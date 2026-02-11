# Specification

## Summary
**Goal:** Make Order creation and owner acceptance stable and non-duplicative, supporting the Pending → Accepted flow with correct authorization and new buyer/owner order-list pages.

**Planned changes:**
- Add/ensure an `Order` backend data model with fields: rental reference, buyer principal, buyerPhone, buyerEmail, buyerAddress, status ("Pending"/"Accepted"), createdAt timestamp.
- Implement stable Order persistence with a unique Order ID (not derived from rental title) so a single create-order call produces exactly one stored Order record (no overwrite/upsert/duplicate write).
- Add backend APIs to:
  - Create an Order (authenticated callers only) with status="Pending" and createdAt set server-side.
  - List Orders for owners (only orders for rentals where rental.createdBy == caller), including rental title + buyer details + status.
  - List Orders for buyers (only orders where buyer == caller), including rental image/title/price + status.
  - Accept an Order by Order ID (owner-only) that updates only status to "Accepted" without creating any new Order record.
- Enforce Order authorization rules across APIs: view only by buyer or rental owner; create only for authenticated users; update/delete only for rental owner.
- Add frontend UI:
  - “Buy Rental” workflow (collect phone/email/address; submit exactly one create-order call; show “Request sent successfully”; show English auth error when not logged in).
  - Owner Messages page (list relevant orders; “Accept Order” updates status to Accepted; show “Order Accepted Successfully”).
  - My Orders page (list buyer’s orders with rental image/title/price; show orange “Pending” badge and green “Accepted” badge).
- Update routing/navigation to include Owner Messages and My Orders without breaking existing routes, keeping all user-facing labels in English.
- Add documented manual end-to-end verification steps for two identities (buyer creates one Pending order → owner accepts → buyer sees Accepted; confirm no duplicates).

**User-visible outcome:** Buyers can request a rental purchase once and see it in “My Orders” as Pending/Accepted, while owners can view incoming requests on “Owner Messages” and accept them—updating the existing order without creating duplicates.
