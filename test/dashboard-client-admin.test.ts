import { describe, it, expect } from "vitest";
import {
  calculateQuote,
  createOrder,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  updateQAChecklist,
  addMessageToOrder,
  requestOrderRevision,
  getAdminMetrics,
  getTranslators,
  updateTranslator,
  addTranslator,
  getOrganizations,
  updateOrganization,
  getSystemSettings,
  updateSystemSettings,
  OrderStatus,
} from "@/lib/dashboard/store";

describe("VerifyLingua Client & Admin Dashboard Architecture Suite", () => {
  describe("1. Dynamic Quote Calculation Engine", () => {
    it("calculates standard translation pricing accurately", () => {
      const quote = calculateQuote({
        pageCount: 3,
        serviceType: "STANDARD",
        rush: false,
        notarized: false,
      });

      expect(quote.baseAmount).toBe(Math.round(3 * 19.95 * 100) / 100);
      expect(quote.certificationFee).toBe(0);
      expect(quote.notaryFee).toBe(0);
      expect(quote.rushFee).toBe(0);
      expect(quote.total).toBe(quote.baseAmount);
    });

    it("applies USCIS certification and notary fees", () => {
      const quote = calculateQuote({
        pageCount: 2,
        serviceType: "CERTIFIED",
        rush: false,
        notarized: true,
      });

      expect(quote.baseAmount).toBe(Math.round(2 * 24.95 * 100) / 100);
      expect(quote.notaryFee).toBe(19.95);
      expect(quote.total).toBe(quote.baseAmount + quote.notaryFee);
    });

    it("applies 1.5x multiplier for rush turnaround", () => {
      const quote = calculateQuote({
        pageCount: 1,
        serviceType: "CERTIFIED",
        rush: true,
        notarized: false,
      });

      const subtotal = 24.95;
      const expectedRush = Math.round(subtotal * 0.5 * 100) / 100;
      expect(quote.rushFee).toBe(expectedRush);
      expect(quote.total).toBe(Math.round((subtotal + expectedRush) * 100) / 100);
    });

    it("applies enterprise volume discount percentage", () => {
      const quote = calculateQuote({
        pageCount: 10,
        serviceType: "LEGAL",
        rush: false,
        notarized: false,
        discountPercent: 15,
      });

      const subtotal = 10 * 29.95;
      const expectedDiscount = Math.round(subtotal * 0.15 * 100) / 100;
      expect(quote.discount).toBe(expectedDiscount);
      expect(quote.total).toBe(Math.round((subtotal - expectedDiscount) * 100) / 100);
    });
  });

  describe("2. 14-State Order Lifecycle State Machine", () => {
    it("creates a new order with valid initial state and timeline milestone", () => {
      const newOrder = createOrder({
        clientName: "Elena Rostova",
        clientEmail: "elena.r@example.com",
        serviceType: "CERTIFIED",
        sourceLang: "Russian",
        targetLangs: ["English"],
        pageCount: 2,
        wordCount: 520,
      });

      expect(newOrder.id).toBeDefined();
      expect(newOrder.publicCode).toMatch(/^VL-[A-Z0-9-]+$/);
      expect(newOrder.status).toBe("SUBMITTED");
      expect(newOrder.timeline.length).toBeGreaterThan(0);
      expect(newOrder.timeline[0].type).toBe("ORDER_CREATED");
    });

    it("transitions through state machine sequentially", () => {
      const order = createOrder({
        clientName: "Jean-Paul Sartre",
        clientEmail: "jp@example.org",
        serviceType: "STANDARD",
        sourceLang: "French",
        targetLangs: ["English"],
        pageCount: 1,
        wordCount: 240,
      });

      const lifecycleSequence: OrderStatus[] = [
        "UNDER_REVIEW",
        "QUOTE_SENT",
        "AWAITING_APPROVAL",
        "PAYMENT_PENDING",
        "SCHEDULED",
        "IN_TRANSLATION",
        "QUALITY_REVIEW",
        "CLIENT_REVIEW",
        "COMPLETED",
      ];

      for (const nextStatus of lifecycleSequence) {
        const updated = updateOrderStatus(order.id, nextStatus, "System Orchestrator");
        expect(updated).toBeDefined();
        expect(updated?.status).toBe(nextStatus);
        expect(updated?.timeline[0].type).toBe("STATUS_CHANGED");
      }
    });
  });

  describe("3. 5-Point Quality Assurance & Certificate Verification Gate", () => {
    it("does not advance to CLIENT_REVIEW when checks are incomplete", () => {
      const order = createOrder({
        clientName: "Carlos Santana",
        clientEmail: "carlos@example.com",
        serviceType: "CERTIFIED",
        sourceLang: "Spanish",
        targetLangs: ["English"],
        pageCount: 1,
        wordCount: 180,
      });

      updateOrderStatus(order.id, "QUALITY_REVIEW");

      // Incomplete QA check
      const result = updateQAChecklist(order.id, {
        terminologyVerified: true,
        formattingMirrored: true,
        completenessChecked: false, // Incomplete
        cfrAffidavitSigned: false,
        stampsTranscribed: true,
      });

      expect(result?.status).toBe("QUALITY_REVIEW");
      expect(result?.qualityChecklist?.completenessChecked).toBe(false);
    });

    it("advances to CLIENT_REVIEW and mints certified hash when all 5 criteria pass", () => {
      const order = createOrder({
        clientName: "David Silva",
        clientEmail: "david.s@example.com",
        serviceType: "CERTIFIED",
        sourceLang: "Portuguese",
        targetLangs: ["English"],
        pageCount: 2,
        wordCount: 450,
      });

      updateOrderStatus(order.id, "QUALITY_REVIEW");

      const result = updateQAChecklist(
        order.id,
        {
          terminologyVerified: true,
          formattingMirrored: true,
          completenessChecked: true,
          cfrAffidavitSigned: true,
          stampsTranscribed: true,
          reviewerNotes: "All 5 checks verified with ATA linguist credentials.",
        },
        "Senior QA Inspector"
      );

      expect(result?.status).toBe("CLIENT_REVIEW");
      expect(result?.deliveredFiles.length).toBeGreaterThan(0);
      expect(result?.deliveredFiles[0].sha256).toBeDefined();
      expect(result?.deliveredFiles[0].verifyCode).toContain("VL-CERT-");
      expect(result?.timeline[0].type).toBe("QA_PASSED");
    });
  });

  describe("4. Information Privacy Boundary & Internal Message Filtering", () => {
    it("stores internal staff notes separately from public client messages", () => {
      const order = getOrderById("ord-1") || getAllOrders()[0];
      expect(order).toBeDefined();

      const internalMsg = addMessageToOrder(order.id, {
        senderId: "staff-qa",
        senderName: "QA Staff",
        senderRole: "STAFF",
        body: "Confidential internal note: Linguist cost rate adjusted to $0.07/wd.",
        isInternal: true,
      });

      expect(internalMsg).toBeDefined();
      expect(internalMsg?.isInternal).toBe(true);

      const clientViewMessages = order.messages.filter((m) => !m.isInternal);
      expect(clientViewMessages.some((m) => m.id === internalMsg?.id)).toBe(false);
    });
  });

  describe("5. Client Revision Request Lifecycle", () => {
    it("records revision request and transitions order to REVISION_REQUESTED", () => {
      const order = createOrder({
        clientName: "Dr. Kenji Sato",
        clientEmail: "kenji@example.jp",
        serviceType: "TECHNICAL",
        sourceLang: "Japanese",
        targetLangs: ["English"],
        pageCount: 3,
        wordCount: 750,
      });

      updateOrderStatus(order.id, "CLIENT_REVIEW");

      const revisedOrder = requestOrderRevision(
        order.id,
        "Please standardize patent claim #4 technical phrasing.",
        "Dr. Kenji Sato"
      );

      expect(revisedOrder?.status).toBe("REVISION_REQUESTED");
      expect(revisedOrder?.revisions.length).toBeGreaterThan(0);
      expect(revisedOrder?.revisions[0].clientNotes).toBe(
        "Please standardize patent claim #4 technical phrasing."
      );
      expect(revisedOrder?.timeline[0].type).toBe("REVISION_REQUESTED");
    });
  });

  describe("6. Executive Admin Metrics & Store Mutations", () => {
    it("computes executive KPIs correctly across orders", () => {
      const metrics = getAdminMetrics();

      expect(metrics.totalRevenue).toBeDefined();
      expect(metrics.grossOrderValue).toBeDefined();
      expect(metrics.activeOrders).toBeGreaterThanOrEqual(0);
      expect(metrics.quoteAcceptanceRate).toContain("%");
      expect(metrics.languageBreakdown.length).toBeGreaterThan(0);
    });

    it("supports updating translator profiles and availability", () => {
      const translators = getTranslators();
      expect(translators.length).toBeGreaterThan(0);

      const firstLinguist = translators[0];
      const initialAvailability = firstLinguist.availability;
      const targetAvailability = initialAvailability === "AVAILABLE" ? "BUSY" : "AVAILABLE";

      const updated = updateTranslator(firstLinguist.id, {
        availability: targetAvailability,
      });

      expect(updated?.availability).toBe(targetAvailability);
    });

    it("supports adding and updating enterprise organizations", () => {
      const orgs = getOrganizations();
      expect(orgs.length).toBeGreaterThan(0);

      const firstOrg = orgs[0];
      const updatedOrg = updateOrganization(firstOrg.id, {
        customDiscountPercent: 20,
      });

      expect(updatedOrg?.customDiscountPercent).toBe(20);
    });

    it("updates and retrieves system settings", () => {
      const settings = getSystemSettings();
      expect(settings.pricingRules).toBeDefined();

      const updated = updateSystemSettings({
        retentionPolicyDays: 180,
      });

      expect(updated.retentionPolicyDays).toBe(180);
    });
  });
});
