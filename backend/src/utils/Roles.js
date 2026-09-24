// Roles.js
// -----------------------------------------------------------------------------
// All five user roles in MedAssist, defined in one place.
// Anywhere in the code that wants to check "is this user a doctor?" uses
// the constants here, NOT the string 'doctor' written inline.
// -----------------------------------------------------------------------------

// ROLES is "frozen" so a noob doesn't accidentally reassign ROLES.ADMIN.
export const ROLES = Object.freeze({
  ADMIN: 'admin',
  DOCTOR: 'doctor',
  RECEPTIONIST: 'receptionist',
  LAB: 'lab',
  PATIENT: 'patient',
});

// ROLE_LIST is the plain array of role strings (useful for zod's z.enum(...))
export const ROLE_LIST = Object.values(ROLES);
