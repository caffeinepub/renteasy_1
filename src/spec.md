# Specification

## Summary
**Goal:** Allow rental owners to delete their own rentals directly from the Search Rental results, with confirmation and immediate UI removal.

**Planned changes:**
- Add a per-rental "Delete" button to each SearchRentalResultCard in the /search-rental results grid.
- Show the "Delete" button only when the current rental’s createdBy matches the authenticated user; otherwise hide it entirely (including when logged out).
- On clicking "Delete", show a confirmation popup with the exact message: "Are you sure you want to delete this product?" and only proceed on confirm.
- Call the backend rental deletion API on confirm; after successful deletion, remove the rental from the results immediately by updating UI state and/or invalidating relevant caches.
- Enforce backend authorization so only the rental owner can delete; ensure deleting a rental does not automatically delete or modify any Orders.

**User-visible outcome:** On the Search Rental page, owners see a "Delete" button on their own rental cards; confirming the prompt permanently deletes the rental and it disappears from the list immediately, while non-owners never see a delete option.
