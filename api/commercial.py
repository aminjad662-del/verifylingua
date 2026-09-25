"""
api/commercial.py - Commercial Pricing, Stripe Checkout & Idempotent Webhook Engine
VerifyLingua Commercial MVP & Account Credit Architecture
"""

import uuid
from typing import Dict, List, Any, Optional
from datetime import datetime, timezone
from api.models import (
    ServiceTier,
    CommercialPlanModel,
    PricingCalculateRequest,
    PricingCalculateResponse,
    CheckoutSessionRequest,
    CheckoutSessionResponse,
    AccountBalanceResponse
)
from api.store import job_store

COMMERCIAL_PLANS: Dict[str, CommercialPlanModel] = {
    "pack_small_25": CommercialPlanModel(
        id="pack_small_25",
        name="Starter Pack",
        tier=ServiceTier.INSTANT,
        price_cents=999,
        price_usd=9.99,
        pages_included=25,
        price_per_page_usd=0.40,
        mode="payment",
        description="Ideal for students and occasional document translation."
    ),
    "pack_large_100": CommercialPlanModel(
        id="pack_large_100",
        name="Professional Pack",
        tier=ServiceTier.INSTANT,
        price_cents=2999,
        price_usd=29.99,
        pages_included=100,
        price_per_page_usd=0.30,
        mode="payment",
        description="Best for freelance translators handling ongoing client files."
    ),
    "agency_monthly_500": CommercialPlanModel(
        id="agency_monthly_500",
        name="Agency Monthly",
        tier=ServiceTier.INSTANT,
        price_cents=11900,
        price_usd=119.00,
        pages_included=500,
        price_per_page_usd=0.24,
        mode="subscription",
        description="High-volume translation agencies with continuous client intake."
    )
}

_PROCESSED_WEBHOOK_EVENTS: Dict[str, Dict[str, Any]] = {}


class CommercialBillingService:
    @classmethod
    def get_plans(cls) -> List[CommercialPlanModel]:
        return list(COMMERCIAL_PLANS.values())

    @classmethod
    def get_plan(cls, plan_id: str) -> Optional[CommercialPlanModel]:
        # Case insensitive lookup
        for k, v in COMMERCIAL_PLANS.items():
            if k.lower() == plan_id.lower() or v.id.lower() == plan_id.lower():
                return v
        return None

    @classmethod
    def calculate_pricing(cls, req: PricingCalculateRequest) -> PricingCalculateResponse:
        pages = max(1, req.page_count)

        if req.service_tier == ServiceTier.CERTIFIED:
            base_rate_per_page = 24.95
            base_price = round(pages * base_rate_per_page, 2)
            expedited_fee = 14.95 if req.is_expedited else 0.0
            notarization_fee = 19.00 if req.needs_notarization else 0.0
            apostille_fee = 49.00 if req.needs_apostille else 0.0
            addons_total = round(expedited_fee + notarization_fee + apostille_fee, 2)
            total_price = round(base_price + addons_total, 2)
            price_per_page = round(total_price / pages, 2)
            est_hours = 12 if req.is_expedited else 24
        else:
            # Instant automated translation tier
            if pages <= 25:
                plan = COMMERCIAL_PLANS["pack_small_25"]
            elif pages <= 100:
                plan = COMMERCIAL_PLANS["pack_large_100"]
            else:
                plan = COMMERCIAL_PLANS["agency_monthly_500"]

            base_price = round(pages * plan.price_per_page_usd, 2)
            expedited_fee = 0.0
            notarization_fee = 0.0
            apostille_fee = 0.0
            addons_total = 0.0
            total_price = base_price
            price_per_page = plan.price_per_page_usd
            est_hours = 0  # Instant (seconds to minutes)

        return PricingCalculateResponse(
            service_tier=req.service_tier,
            page_count=pages,
            base_price_usd=base_price,
            expedited_fee_usd=expedited_fee,
            notarization_fee_usd=notarization_fee,
            apostille_fee_usd=apostille_fee,
            addons_total_usd=addons_total,
            total_price_usd=total_price,
            price_per_page_usd=price_per_page,
            estimated_turnaround_hours=est_hours
        )

    @classmethod
    def create_checkout_session(cls, req: CheckoutSessionRequest) -> CheckoutSessionResponse:
        plan = cls.get_plan(req.plan_id)
        if not plan:
            raise ValueError(f"Unknown commercial plan ID: {req.plan_id}")

        session_id = f"cs_test_{uuid.uuid4().hex[:18]}"
        checkout_url = f"https://checkout.stripe.com/c/pay/{session_id}"

        return CheckoutSessionResponse(
            session_id=session_id,
            checkout_url=checkout_url,
            plan_id=plan.id,
            amount_cents=plan.price_cents,
            amount_usd=plan.price_usd,
            pages_granted=plan.pages_included,
            mode=plan.mode,
            status="open"
        )

    @classmethod
    def handle_stripe_webhook(cls, event: Dict[str, Any]) -> Dict[str, Any]:
        event_id = event.get("id")
        event_type = event.get("type", "")

        if not event_id:
            raise ValueError("Stripe event missing 'id'")

        # Idempotency check: duplicate event protection
        if event_id in _PROCESSED_WEBHOOK_EVENTS:
            return {
                "status": "DUPLICATE_IGNORED",
                "event_id": event_id,
                "message": "Event already processed and recorded in ledger."
            }

        data_obj = event.get("data", {}).get("object", {})
        processed_details = {}

        if event_type in ("checkout.session.completed", "invoice.payment_succeeded"):
            user_id = data_obj.get("client_reference_id") or data_obj.get("customer") or "usr_anonymous"
            metadata = data_obj.get("metadata", {})
            plan_id = metadata.get("plan_id") or data_obj.get("plan_id") or "pack_small_25"

            plan = cls.get_plan(plan_id)
            pages_to_grant = plan.pages_included if plan else 25

            # Atomically credit user balance
            job_store.add_user_credits(user_id=user_id, credits=pages_to_grant)
            processed_details = {
                "user_id": user_id,
                "plan_id": plan_id,
                "pages_granted": pages_to_grant,
                "amount_cents": data_obj.get("amount_total", 999)
            }

        _PROCESSED_WEBHOOK_EVENTS[event_id] = {
            "processed_at": datetime.now(timezone.utc).isoformat(),
            "event_type": event_type,
            "details": processed_details
        }

        return {
            "status": "PROCESSED",
            "event_id": event_id,
            "event_type": event_type,
            "result": processed_details
        }

    @classmethod
    def get_account_balance(cls, user_id: str) -> AccountBalanceResponse:
        bal = job_store.get_user_balance(user_id)
        active_jobs = job_store.count_active_jobs_for_user(user_id)
        return AccountBalanceResponse(
            user_id=user_id,
            credits_available=bal.get("credits_available", 0),
            credits_reserved=bal.get("credits_reserved", 0),
            lifetime_pages_used=bal.get("lifetime_pages_used", 0),
            active_jobs_count=active_jobs
        )
