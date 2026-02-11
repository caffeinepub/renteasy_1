# Order Flow End-to-End Test Instructions

This document provides manual test instructions for verifying the stable order acceptance flow.

## Prerequisites
- Two Internet Identity accounts (one for Buyer, one for Owner)
- Access to the deployed RentEasy application

## Test Steps

### 1. Owner Account Setup
1. Log in with the Owner Internet Identity account
2. Navigate to "Add Rental" page
3. Create a new rental listing (e.g., "Beach House")
   - Fill in all required fields: title, category, description, price, location, phone, image
   - Submit the rental
4. Verify the rental appears in the search results
5. Log out

### 2. Buyer Account - Create Order
1. Log in with the Buyer Internet Identity account
2. Navigate to "Search Rental" page
3. Find the "Beach House" rental created by the Owner
4. Click "Buy Rental" button
5. Fill in the contact form:
   - Phone number
   - Email address
   - Full address
6. Submit the order
7. Verify the success message: "Request sent successfully"
8. Navigate to "My Orders" page
9. **Verify**: Exactly ONE order appears for "Beach House"
10. **Verify**: Order status shows "Pending" with an orange badge
11. Log out

### 3. Owner Account - Accept Order
1. Log in with the Owner Internet Identity account
2. Navigate to "Owner Messages" page
3. **Verify**: Exactly ONE order appears for "Beach House"
4. **Verify**: Order displays:
   - Rental title: "Beach House"
   - Buyer name (or principal if no profile)
   - Buyer phone number
   - Buyer email address
   - Buyer address
   - Status: "Pending"
5. Click "Accept Order" button
6. Verify the success message: "Order Accepted Successfully"
7. **Verify**: Order status changes to "Accepted" with a green badge
8. **Verify**: "Accept Order" button is no longer visible
9. Log out

### 4. Buyer Account - Verify Acceptance
1. Log in with the Buyer Internet Identity account
2. Navigate to "My Orders" page
3. **Verify**: The SAME order for "Beach House" now shows status "Accepted" with a green badge
4. **Verify**: NO duplicate orders exist
5. **Verify**: Only ONE order record is displayed

## Authorization Tests

### Test 1: Unauthenticated User
1. Log out (if logged in)
2. Navigate to "Search Rental" page
3. Try to click "Buy Rental" on any listing
4. **Expected**: User should be prompted to log in

### Test 2: Buyer Cannot Accept Own Order
1. Log in as Buyer
2. Navigate to "Owner Messages" page
3. **Expected**: No orders should appear (buyer doesn't own any rentals)

### Test 3: Owner Cannot View Other Owners' Orders
1. Create a third Internet Identity account (Owner 2)
2. Log in as Owner 2
3. Create a different rental listing
4. Log in as Buyer and create an order for Owner 2's rental
5. Log in as Owner 1 (original owner)
6. Navigate to "Owner Messages" page
7. **Expected**: Only orders for Owner 1's rentals should appear, not Owner 2's

## Expected Final Result

✅ Exactly ONE order record exists throughout the entire flow
✅ Order status transitions from "Pending" to "Accepted"
✅ No duplicate orders are created
✅ No new order is created during acceptance
✅ Buyer sees the updated status in "My Orders"
✅ Owner sees the updated status in "Owner Messages"
✅ Authorization rules are enforced correctly

## Troubleshooting

If you encounter issues:
- Check browser console for error messages
- Verify you're using the correct Internet Identity for each role
- Clear browser cache and try again
- Ensure the backend canister is running and accessible
