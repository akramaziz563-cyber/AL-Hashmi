/**
 * Payload-First Security Test Specification for Al Hashmi Real Estate Agency Sahiwal.
 * Documents and verifies the 12 adversarial payloads against Firestore security rules.
 */
export const dirtyDozenSecurityCases = [
  { id: 1, name: 'Shadow field injection on property create', path: 'properties/prop_1', expected: 'PERMISSION_DENIED' },
  { id: 2, name: 'Unverified email spoofing bootstrap admin', path: 'properties/prop_1', expected: 'PERMISSION_DENIED' },
  { id: 3, name: 'Public single inquiry PII get', path: 'inquiries/inq_1', expected: 'PERMISSION_DENIED' },
  { id: 4, name: 'Non-staff authenticated inquiry list', path: 'inquiries', expected: 'PERMISSION_DENIED' },
  { id: 5, name: 'Public inquiry created with non-new status', path: 'inquiries/inq_2', expected: 'PERMISSION_DENIED' },
  { id: 6, name: 'Forged createdAt timestamp on property create', path: 'properties/prop_2', expected: 'PERMISSION_DENIED' },
  { id: 7, name: 'Non-admin self-promotion in profiles', path: 'profiles/user_1', expected: 'PERMISSION_DENIED' },
  { id: 8, name: 'Editor attempting to update site_settings', path: 'site_settings/default', expected: 'PERMISSION_DENIED' },
  { id: 9, name: 'Oversized 50KB inquiry message string', path: 'inquiries/inq_3', expected: 'PERMISSION_DENIED' },
  { id: 10, name: 'Path variable ID poisoning with invalid characters', path: 'properties/bad.id!', expected: 'PERMISSION_DENIED' },
  { id: 11, name: 'Unbounded property images array (> 12 items)', path: 'properties/prop_1', expected: 'PERMISSION_DENIED' },
  { id: 12, name: 'Mutating immutable createdAt on property update', path: 'properties/prop_1', expected: 'PERMISSION_DENIED' },
] as const;
