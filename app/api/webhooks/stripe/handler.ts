import { prisma } from "@/lib/prisma";
import { CreditTransactionType } from "@prisma/client";
import { getMvpPlan, getMvpPlanPages } from "@/lib/pricing";

export interface WebhookResult {
  status: string;
  creditsAdded: number;
  duplicate?: boolean;
}

/**
 * Handles incoming Stripe webhook events with strict idempotency and atomic credit fulfillment.
 * Supports:
 * - checkout.session.completed: Fulfills one-time credit packs and agency subscriptions
 * - invoice.payment_succeeded: Fulfills recurring agency monthly quota renewals
 */
export async function handleStripeWebhookEvent(event: any): Promise<WebhookResult> {
  if (!event || !event.type) {
    return { status: "INVALID_EVENT", creditsAdded: 0, duplicate: false };
  }

  // 1. Handle checkout.session.completed
  if (event.type === "checkout.session.completed") {
    const session = event.data?.object;
    if (!session || !session.id) {
      return { status: "INVALID_PAYLOAD", creditsAdded: 0, duplicate: false };
    }

    const planId = session.metadata?.planId;
    const userId = session.metadata?.userId || session.client_reference_id;
    const rawPages = session.metadata?.pagesGranted;

    // Only process if commercial plan or user is indicated
    if (planId && userId) {
      const plan = getMvpPlan(planId);
      const defaultPages = plan ? getMvpPlanPages(plan) : 0;
      const parsedPages = rawPages ? parseInt(rawPages, 10) : defaultPages;
      const pagesGranted =
        Number.isInteger(parsedPages) && parsedPages > 0
          ? parsedPages
          : defaultPages;

      // Idempotency check 1: Fast pre-check on CreditTransaction
      const existingTx = await prisma.creditTransaction.findFirst({
        where: { stripePaymentId: session.id },
      });

      if (existingTx) {
        return { status: "DUPLICATE_IGNORED", creditsAdded: 0, duplicate: true };
      }

      // Atomic execution inside transaction
      try {
        return await prisma.$transaction(async (tx) => {
          // Concurrency check inside transaction
          const existingInTx = await tx.creditTransaction.findFirst({
            where: { stripePaymentId: session.id },
          });
          if (existingInTx) {
            return {
              status: "DUPLICATE_IGNORED",
              creditsAdded: 0,
              duplicate: true,
            };
          }

          // Row lock user for update
          const users = await tx.$queryRaw<
            Array<{ id: string; creditsAvailable: number }>
          >`
            SELECT id, "creditsAvailable"
            FROM "User"
            WHERE id = ${userId}
            FOR UPDATE
          `;
          const user = users[0];
          if (!user) {
            throw new Error(`User not found: ${userId}`);
          }

          const updatedUser = await tx.user.update({
            where: { id: userId },
            data: {
              creditsAvailable: { increment: pagesGranted },
            },
            select: {
              creditsAvailable: true,
            },
          });

          const isAgency =
            planId === "agency_monthly_500" || planId === "AGENCY_MONTHLY";
          const txType = isAgency
            ? CreditTransactionType.SUBSCRIPTION_GRANT
            : CreditTransactionType.PACK_PURCHASE;

          const planName =
            plan?.name || (isAgency ? "Agency Monthly" : "Credit Pack");
          const description = `Purchased ${planName} (${pagesGranted} pages)`;

          await tx.creditTransaction.create({
            data: {
              userId,
              amount: pagesGranted,
              balanceAfter: updatedUser.creditsAvailable,
              type: txType,
              description,
              stripePaymentId: session.id,
            },
          });

          if (isAgency) {
            await tx.subscription.upsert({
              where: { userId },
              create: {
                userId,
                stripeCustomerId: session.customer
                  ? String(session.customer)
                  : undefined,
                stripeSubscriptionId: session.subscription
                  ? String(session.subscription)
                  : undefined,
                plan: "AGENCY_MONTHLY",
                status: "ACTIVE",
                pageQuota: pagesGranted,
                pagesUsed: 0,
              },
              update: {
                stripeCustomerId: session.customer
                  ? String(session.customer)
                  : undefined,
                stripeSubscriptionId: session.subscription
                  ? String(session.subscription)
                  : undefined,
                plan: "AGENCY_MONTHLY",
                status: "ACTIVE",
                pageQuota: pagesGranted,
              },
            });
          }

          return {
            status: "CREDITS_GRANTED",
            creditsAdded: pagesGranted,
            duplicate: false,
          };
        });
      } catch (err: any) {
        // Unique constraint violation (P2002) on stripePaymentId indicates concurrent replay handled
        if (err.code === "P2002") {
          return {
            status: "DUPLICATE_IGNORED",
            creditsAdded: 0,
            duplicate: true,
          };
        }
        throw err;
      }
    }
  }

  // 2. Handle invoice.payment_succeeded for monthly subscription renewals
  if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data?.object;
    if (invoice && invoice.id) {
      // Idempotency pre-check
      const existingTx = await prisma.creditTransaction.findFirst({
        where: { stripePaymentId: invoice.id },
      });
      if (existingTx) {
        return {
          status: "DUPLICATE_IGNORED",
          creditsAdded: 0,
          duplicate: true,
        };
      }

      let userId =
        invoice.metadata?.userId ||
        invoice.subscription_details?.metadata?.userId ||
        invoice.lines?.data?.[0]?.metadata?.userId;

      let planId =
        invoice.metadata?.planId ||
        invoice.subscription_details?.metadata?.planId ||
        invoice.lines?.data?.[0]?.metadata?.planId;

      if (!userId && (invoice.subscription || invoice.customer)) {
        const sub = await prisma.subscription.findFirst({
          where: {
            OR: [
              invoice.subscription
                ? { stripeSubscriptionId: String(invoice.subscription) }
                : {},
              invoice.customer
                ? { stripeCustomerId: String(invoice.customer) }
                : {},
            ].filter((c) => Object.keys(c).length > 0),
          },
        });
        if (sub) {
          userId = sub.userId;
          if (!planId) planId = sub.plan;
        }
      }

      if (userId) {
        const pagesGranted = invoice.metadata?.pagesGranted
          ? parseInt(invoice.metadata.pagesGranted, 10)
          : 500;

        try {
          return await prisma.$transaction(async (tx) => {
            const existingInTx = await tx.creditTransaction.findFirst({
              where: { stripePaymentId: invoice.id },
            });
            if (existingInTx) {
              return {
                status: "DUPLICATE_IGNORED",
                creditsAdded: 0,
                duplicate: true,
              };
            }

            const users = await tx.$queryRaw<
              Array<{ id: string; creditsAvailable: number }>
            >`
              SELECT id, "creditsAvailable"
              FROM "User"
              WHERE id = ${userId}
              FOR UPDATE
            `;
            const user = users[0];
            if (!user) {
              throw new Error(`User not found: ${userId}`);
            }

            const updatedUser = await tx.user.update({
              where: { id: userId },
              data: {
                creditsAvailable: { increment: pagesGranted },
              },
              select: {
                creditsAvailable: true,
              },
            });

            await tx.creditTransaction.create({
              data: {
                userId,
                amount: pagesGranted,
                balanceAfter: updatedUser.creditsAvailable,
                type: CreditTransactionType.SUBSCRIPTION_GRANT,
                description: `Agency Monthly subscription renewal (${pagesGranted} pages)`,
                stripePaymentId: invoice.id,
              },
            });

            await tx.subscription.upsert({
              where: { userId },
              create: {
                userId,
                stripeCustomerId: invoice.customer
                  ? String(invoice.customer)
                  : undefined,
                stripeSubscriptionId: invoice.subscription
                  ? String(invoice.subscription)
                  : undefined,
                plan: "AGENCY_MONTHLY",
                status: "ACTIVE",
                pageQuota: pagesGranted,
                pagesUsed: 0,
              },
              update: {
                status: "ACTIVE",
                pageQuota: pagesGranted,
              },
            });

            return {
              status: "CREDITS_GRANTED",
              creditsAdded: pagesGranted,
              duplicate: false,
            };
          });
        } catch (err: any) {
          if (err.code === "P2002") {
            return {
              status: "DUPLICATE_IGNORED",
              creditsAdded: 0,
              duplicate: true,
            };
          }
          throw err;
        }
      }
    }
  }

  return { status: "IGNORED", creditsAdded: 0, duplicate: false };
}
