# Firestore Security Specification — Al Hashmi Real Estate Agency Sahiwal

## 1. Data Invariants
1. **Public Catalog Visibility**: Only valid `properties` with status in `['for_sale', 'for_rent', 'sold', 'rented']` and `gallery_images` in `['Houses', 'Plots', 'Commercial', 'Projects']` may be read by public visitors.
2. **PII Isolation on Inquiries**: `inquiries` contain client phone numbers, emails, and messages. Public users may `create` a new inquiry strictly with `status == 'new'` and bounded text lengths, and may never `get`, `list`, `update`, or `delete` inquiries.
3. **Role-Based Staff Control**: Only verified admins (`akramaziz563@gmail.com` with `email_verified == true`, or users with `profiles/{uid}.role == 'admin'`) can edit `site_settings` or manage `profiles`. Verified editors (`profiles/{uid}.role == 'editor'`) and admins can create, update, and delete `properties`, `gallery_images`, and manage `inquiries`.
4. **Immutable Creation Timestamps & Strict Key Allowlists**: Every `create` validates exact required and optional keys (`hasAll` + `hasOnly`), `createdAt == request.time`, and `updatedAt == request.time`. Updates preserve `createdAt == existing().createdAt` and enforce `updatedAt == request.time`.
5. **Path Variable Hardening**: Every single-document `get`, `create`, `update`, `delete` enforces `isValidId(id)` (`^[a-zA-Z0-9_\-]+$`, max 128 chars).

## 2. The "Dirty Dozen" Adversarial Payloads (Must All Return PERMISSION_DENIED)
1. **Shadow Field Injection on Property**: Creating a property with extra `{ isAdminVerified: true }` key -> rejected by `keys().hasOnly(...)`.
2. **Unverified Admin Email Spoof**: Request with `email: 'akramaziz563@gmail.com'` and `email_verified: false` -> rejected by `email_verified == true`.
3. **Public PII Inquiry Read**: Unauthenticated `getDoc` on `/inquiries/{id}` -> rejected by `isEditorOrAdmin()`.
4. **Public PII Inquiry List**: Authenticated non-staff user running `getDocs` on `/inquiries` -> rejected.
5. **Client-Forged Inquiry Status**: Public user creating an inquiry with `status: 'closed'` -> rejected (`status == 'new'` enforced).
6. **Client-Forged Timestamp**: Creating a property with backdated `createdAt` instead of `request.time` -> rejected.
7. **Self-Assigned Staff Role Escalation**: Non-admin user creating `/profiles/{ownUid}` with `role: 'admin'` -> rejected by `isAdmin()`.
8. **Editor Modifying Site Settings**: Staff user with `role: 'editor'` updating `/site_settings/default` -> rejected by `isAdmin()`.
9. **Oversized String Resource Poisoning**: Public inquiry with 50,000-char `message` -> rejected by `message.size() <= 2000`.
10. **ID Poisoning**: Document creation at `/properties/..invalid..id..` -> rejected by `isValidId(propertyId)`.
11. **Unbounded Images Array**: Updating property with 20 images (> 12 limit) -> rejected by `images.size() <= 12`.
12. **Terminal Creation Timestamp Tampering**: Updating property while altering `createdAt` -> rejected by `incoming().createdAt == existing().createdAt`.
