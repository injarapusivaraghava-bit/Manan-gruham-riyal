# Security Specification & Threat Model - Mana Gruham

This specification defines the strict security posture for Mana Gruham's Firestore database, based on Attribute-Based Access Control (ABAC) and Zero-Trust principles.

## 1. Data Invariants
*   **Property Listings (`listings`)**:
    *   Any listing created must have `submittedBy` set to the exact UID of the authenticated user creating it.
    *   No client can self-approve a listing (`isApproved` must be "Pending" upon creation, unless done by an admin).
    *   Immutability: Once created, `submittedBy` and `createdAt` cannot be altered.
    *   Updating fields that affect payment status (`paymentStatus`, `isApproved`) is restricted to the admin OR specific states governed by payment validation.
*   **User Feedbacks (`feedbacks`)**:
    *   Feedbacks can be created by any user (authenticated or anonymous) or specifically tracked users.
    *   Feedbacks are write-only by clients (create-only). Clients cannot read, update, or delete feedback entries to prevent information leakage of other users' contact details. Only Admins can read/delete.
*   **Payments (`payments`)**:
    *   Created payments must have `customerName` and valid details.
    *   The `status` of a payment must be "Pending" upon initial creation.
    *   Once a payment status is "Verified" or "Rejected", it is a terminal state and cannot be changed.
    *   Only authorized administrators (configured via the admin document/email) can update the payment status to "Verified" or "Rejected".

---

## 2. The "Dirty Dozen" Payloads
The following 12 payloads are designed to breach identity, integrity, or state invariants. Every single one of these MUST be rejected with `PERMISSION_DENIED`.

### Attack 1: Identity Spoofing (Listing Creator Impersonation)
*   **Target Path**: `listings/listing_123` (Create)
*   **Intruder UID**: `hacker_999`
*   **Payload**:
    ```json
    {
      "id": "listing_123",
      "title": "Beautiful Villa in Kakinada",
      "submittedBy": "victim_uid_555",
      "isApproved": "Pending",
      "createdAt": "2026-08-31T12:00:00.000Z"
    }
    ```
    *   *Invariant Violated*: User attempts to submit a listing on behalf of another user (`victim_uid_555` instead of `hacker_999`).

### Attack 2: Self-Approval of Listing
*   **Target Path**: `listings/listing_123` (Create)
*   **Intruder UID**: `user_111`
*   **Payload**:
    ```json
    {
      "id": "listing_123",
      "title": "Beautiful Villa in Kakinada",
      "submittedBy": "user_111",
      "isApproved": "Yes",
      "createdAt": "2026-08-31T12:00:00.000Z"
    }
    ```
    *   *Invariant Violated*: Standard user attempts to pre-approve their own listing during creation.

### Attack 3: Listing Creator Hijacking (Update submittedBy)
*   **Target Path**: `listings/listing_123` (Update)
*   **Intruder UID**: `victim_uid_555`
*   **Payload**:
    ```json
    {
      "submittedBy": "hacker_999"
    }
    ```
    *   *Invariant Violated*: Attempting to mutate the immutable `submittedBy` field of an existing listing.

### Attack 4: Denial of Wallet via Giant Document ID Poisoning
*   **Target Path**: `listings/SUPER_LONG_ID_WITH_SPECIAL_CHARS_AND_1MB_SIZE_JUNK_DATA...` (Create)
*   **Intruder UID**: `user_111`
*   **Payload**:
    ```json
    {
      "id": "SUPER_LONG_ID_WITH_SPECIAL_CHARS_AND_1MB_SIZE_JUNK_DATA...",
      "title": "Vastu Compliant Flat"
    }
    ```
    *   *Invariant Violated*: Attempting to inject a huge, malicious document ID to bloat index sizes.

### Attack 5: Unauthenticated Public Feedback Scraping (PII Leak)
*   **Target Path**: `feedbacks` (List/Read query)
*   **Intruder UID**: `anonymous` (or standard user)
*   *Invariant Violated*: Attempting to fetch/list other users' feedback entries, which contain private contact numbers/emails.

### Attack 6: Feedback Hijacking / Message Deletion
*   **Target Path**: `feedbacks/feedback_abc` (Delete)
*   **Intruder UID**: `user_111`
*   *Invariant Violated*: A standard user attempting to delete a feedback submission.

### Attack 7: Fake UPI Reference (No-verification Bypass)
*   **Target Path**: `listings/listing_123` (Update status to active paid listing without paying)
*   **Intruder UID**: `user_111`
*   **Payload**:
    ```json
    {
      "paymentStatus": "success",
      "isApproved": "Yes",
      "packageName": "featured"
    }
    ```
    *   *Invariant Violated*: User attempts to manually bypass the payment loop and flag their own property as active/paid.

### Attack 8: Payment Verification Self-Approval
*   **Target Path**: `payments/payment_xyz` (Create)
*   **Intruder UID**: `user_111`
*   **Payload**:
    ```json
    {
      "id": "payment_xyz",
      "customerName": "Hacker",
      "utr": "123456789012",
      "status": "Verified",
      "amount": 1999
    }
    ```
    *   *Invariant Violated*: A standard user creating a payment record with pre-verified status.

### Attack 9: Self-Approve Payment via Update
*   **Target Path**: `payments/payment_xyz` (Update)
*   **Intruder UID**: `user_111`
*   **Payload**:
    ```json
    {
      "status": "Verified"
    }
    ```
    *   *Invariant Violated*: Standard user attempting to modify their payment status from 'Pending' to 'Verified'.

### Attack 10: Mutate Terminal Payment State (Double Spending)
*   **Target Path**: `payments/payment_verified_already` (Update)
*   **Intruder UID**: `admin_user`
*   **Payload**:
    ```json
    {
      "status": "Rejected"
    }
    ```
    *   *Invariant Violated*: Even an admin attempting to alter a transaction status that has already reached the terminal "Verified" state.

### Attack 11: Spoofed Admin Claims Check (No email verification)
*   **Target Path**: `payments/payment_xyz` (Update)
*   **Intruder UID**: `unverified_admin_user` (email: `injarapusivaraghava@gmail.com` but `email_verified` is `false`)
*   **Payload**:
    ```json
    {
      "status": "Verified"
    }
    ```
    *   *Invariant Violated*: Admin actions must require that the admin's email is fully verified (`email_verified == true`).

### Attack 12: Injection of Massive Data in UTR
*   **Target Path**: `payments/payment_xyz` (Create)
*   **Intruder UID**: `user_111`
*   **Payload**:
    ```json
    {
      "id": "payment_xyz",
      "customerName": "Alice",
      "utr": "UTR_STRING_THAT_IS_10000_CHARACTERS_LONG_AND_EXCEEDS_NORMAL_BOUNDS...",
      "status": "Pending"
    }
    ```
    *   *Invariant Violated*: Volumetric size attack on string fields to exhaust project Firestore storage.

---

## 3. The Test Runner Spec
A standard test file `firestore.rules.test.ts` can be used to locally or programmatically assert these denials:

```typescript
import { assertFails, initializeTestEnvironment } from '@firebase/rules-unit-testing';

describe('Mana Gruham Firestore Security Rules', () => {
  let testEnv;

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'charismatic-diorama-dq7jp',
      firestore: {
        rules: require('fs').readFileSync('firestore.rules', 'utf8')
      }
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  it('rejects Identity Spoofing on listing creation (Attack 1)', async () => {
    const context = testEnv.authenticatedContext('hacker_999');
    const db = context.firestore();
    await assertFails(
      db.collection('listings').doc('listing_123').set({
        id: 'listing_123',
        title: 'Beautiful Villa in Kakinada',
        submittedBy: 'victim_uid_555',
        isApproved: 'Pending',
        createdAt: new Date().toISOString()
      })
    );
  });

  it('rejects Self-Approval on listing creation (Attack 2)', async () => {
    const context = testEnv.authenticatedContext('user_111');
    const db = context.firestore();
    await assertFails(
      db.collection('listings').doc('listing_123').set({
        id: 'listing_123',
        title: 'Beautiful Villa in Kakinada',
        submittedBy: 'user_111',
        isApproved: 'Yes',
        createdAt: new Date().toISOString()
      })
    );
  });

  it('rejects unauthenticated feedbacks retrieval (Attack 5)', async () => {
    const context = testEnv.unauthenticatedContext();
    const db = context.firestore();
    await assertFails(db.collection('feedbacks').get());
  });
});
```
