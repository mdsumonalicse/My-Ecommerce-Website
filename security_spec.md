# Firebase Security Spec & Data Invariants

## Data Invariants
1. **Catalog Integrity**: Only authorized admins with `super_admin`, `add_products`, or `modify_products` permissions can insert or alter catalog products. Anyone can read the catalogue.
2. **Profile Isolation**: A user's profile detail (especially PII like full address and mobile phone) is strictly visible to that specific user owner and super_admins.
3. **Escalation Locking**: Regular users are forbidden from self-assigning high-privilege roles like `super_admin` or specific admin clearances on user document writes.
4. **Order Tracking Transparency**: Customers can read and create their own orders securely. Admins with `manage_orders` clearance can read and update shipment status.

## Non-interactive Red Team Matrix: The "Dirty Dozen" Payloads
The following attempts result in a `PERMISSION_DENIED` rejection at the database barrier:

| Target Path | Payload Try | Malicious Goal | Expectation |
|---|---|---|---|
| `/products/malicious-item` | `{ "title": "Free product", "price": 0 }` | Unauthenticated user inserting to catalogue | `PERMISSION_DENIED` |
| `/users/victim-uid` | Read request query | Stranger attempting list scrape of user addresses | `PERMISSION_DENIED` |
| `/users/attacker-uid` | `{ "name": "Attacker", "role": "super_admin", "permissions": ["super_admin"] }` | Attempting self-privilege escalation during sign up | `PERMISSION_DENIED` |
| `/users/attacker-uid` | `update` field: `role = 'super_admin'` | Attempting role takeover on existing normal profile | `PERMISSION_DENIED` |
| `/orders/some-order-id` | `{ "userId": "victim-uid", "total": 99999 }` | Hijacking another user's invoice credentials | `PERMISSION_DENIED` |
| `/products/p-100` | `{ "price": 10 }` containing modified specifications | Regular staff (`add_products` only) modifying premium specifications | `PERMISSION_DENIED` |

## Test Runner Logic (`firestore.rules.test.ts`)
Integrated and checked securely to verify all restrictions are actively running.
