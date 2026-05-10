# TeaOrder Firebase Security Specification

## 1. Data Invariants
- **Category**: Name is required, order must be a number.
- **Product**: Name and categoryId are required, price must be a positive number.
- **Order**: items list must not be empty, status must be one of ['pending', 'preparing', 'completed', 'cancelled'], total must be the sum of items.

## 2. The Dirty Dozen Payloads
- **Spoofing Owner**: Attempt to create an order with a fake `userId`. (Protected: We don't link orders to users strictly in this MVP, but we will protect admin actions).
- **Infinite Quantity**: Attempt to create an order with 99,999 items. (Protected: Rule will limit array size).
- **Negative Price**: Attempt to update a product with a negative price. (Protected: Validation helper).
- **Shadow Fields**: Adding `isAdmin: true` to a category. (Protected: `hasOnly`).
- **Illegal Status Jump**: Changing an order from `cancelled` back to `pending`. (Protected: Terminal state locking).
- **Unauthorized Catalog Edit**: Guest user trying to delete a category. (Protected: `isAdmin` check).

## 3. Test Cases
All admin collections (`categories`, `products`) should be read-only for public, and writeable only by admins.
`orders` should be create-only for public, and writeable by admins.

(Note: Tests omitted for brevity in this scratchpad, but logic implemented in rules).
