const API_TOKEN = '9e5105aa9e54b11efd46e87e0a3a88116296df3751c023e1ce171e455b0e64a5';
const PROJECT_CODE = 'CODEH';
const BASE_URL = 'https://api.qase.io/v1';

const headers = {
  Token: API_TOKEN,
  'Content-Type': 'application/json',
};

async function patchCase(id, body) {
  const res = await fetch(`${BASE_URL}/case/${PROJECT_CODE}/${id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!data.status) throw new Error(`PATCH case ${id} failed: ${JSON.stringify(data)}`);
  console.log(`  Updated case ID ${id}`);
}

const updates = [
  // --- Navigation ---
  {
    id: 1,
    description: "Verifies that a user can reach the registration page by clicking the 'Join here' link from the login page.",
    preconditions: "User is on the /login page and is not logged in.",
  },
  {
    id: 2,
    description: "Verifies that the multi-step progress bar displays all four step labels correctly.",
    preconditions: "User is on the registration page (/signup/1) and is not logged in.",
  },

  // --- Registration form — field validation ---
  {
    id: 3,
    description: "Verifies that submitting the form without an email address triggers the inline 'Required field' error.",
    preconditions: "User is on /signup/1. Password field is filled with a valid value. Terms checkbox is checked.",
  },
  {
    id: 4,
    description: "Verifies that submitting the form without a password triggers an inline validation error.",
    preconditions: "User is on /signup/1. Email field is filled with a valid unique address. Terms checkbox is checked.",
  },
  {
    id: 5,
    description: "Verifies that a malformed email address (e.g. 'not-an-email') triggers the inline 'Invalid e-mail' error.",
    preconditions: "User is on /signup/1. Password is filled with a valid value. Terms checkbox is checked.",
  },
  {
    id: 6,
    description: "Verifies that an email address exceeding the allowed length is rejected with a server-level error banner.",
    preconditions: "User is on /signup/1. Password is filled with a valid value. Terms checkbox is checked.",
  },
  {
    id: 7,
    description: "Verifies that the form cannot be submitted unless the terms and conditions checkbox is checked.",
    preconditions: "User is on /signup/1. Email and password fields are filled with valid values. Terms checkbox is NOT checked.",
  },
  {
    id: 8,
    description: "Verifies that attempting to register with an existing email triggers the 'User with this email already exist' server error.",
    preconditions: "User is on /signup/1. A user with email 'test@test.com' already exists in the system.",
  },

  // --- Password field ---
  {
    id: 9,
    description: "Verifies that the password field masks input by default and reveals it when the visibility toggle is clicked.",
    preconditions: "User is on /signup/1. Password field contains a value.",
  },
  {
    id: 10,
    description: "Verifies that clicking the visibility toggle a second time re-masks the password.",
    preconditions: "User is on /signup/1. Password field contains a value. Password is currently visible (eye icon was already clicked once).",
  },

  // --- Successful registration ---
  {
    id: 11,
    description: "Verifies the happy path: a valid registration triggers the verification code popup which displays the email used during registration.",
    preconditions: "User is on /signup/1. The email used for registration does not exist in the system.",
  },
  {
    id: 12,
    description: "Verifies that the verification code popup renders all required UI elements after a successful registration.",
    preconditions: "A successful registration has been completed. The verification code popup is open.",
  },

  // --- Verification code popup ---
  {
    id: 13,
    description: "Verifies that entering an incorrect 5-digit code triggers the 'Error with code. Please check.' error, and that the popup displays the correct email.",
    preconditions: "A successful registration has been completed. The verification code popup is open.",
  },
  {
    id: 14,
    description: "Verifies that clicking the resend link triggers the 'A new verification code was sent.' success message.",
    preconditions: "A successful registration has been completed. The verification code popup is open.",
  },
  {
    id: 15,
    description: "Verifies that filling fewer than 5 digit inputs does not prematurely trigger an error or close the popup.",
    preconditions: "A successful registration has been completed. The verification code popup is open.",
  },

  // --- Update email popup ---
  {
    id: 16,
    description: "Verifies that submitting a new valid email via the update popup replaces the email shown on the verification screen.",
    preconditions: "A successful registration has been completed. The verification code popup is open. The 'Update your email' popup is open.",
  },
  {
    id: 17,
    description: "Verifies that clicking CANCEL in the update email popup discards changes and preserves the original registration email.",
    preconditions: "A successful registration has been completed. The verification code popup is open. The 'Update your email' popup is open.",
  },
  {
    id: 18,
    description: "Verifies that entering a malformed email in the update popup triggers the 'Invalid e-mail' inline error with error icon.",
    preconditions: "A successful registration has been completed. The verification code popup is open. The 'Update your email' popup is open.",
  },
  {
    id: 19,
    description: "Verifies that submitting the update form with an empty email field triggers the 'Required field' inline error with error icon.",
    preconditions: "A successful registration has been completed. The verification code popup is open. The 'Update your email' popup is open.",
  },
  {
    id: 20,
    description: "Verifies that entering the same email used during registration in the update popup triggers a server error, as the address is already in use.",
    preconditions: "A successful registration has been completed. The verification code popup is open. The 'Update your email' popup is open.",
  },
  {
    id: 21,
    description: "Verifies that entering a known registered email (test@test.com) in the update popup triggers the 'User with this email already exist' server error.",
    preconditions: "A successful registration has been completed. The verification code popup is open. The 'Update your email' popup is open. A user with email 'test@test.com' exists in the system.",
  },
];

async function main() {
  console.log(`\nUpdating ${updates.length} test cases in project "${PROJECT_CODE}"...\n`);

  for (const { id, description, preconditions } of updates) {
    await patchCase(id, { description, preconditions });
  }

  console.log(`\n✓ Done — all ${updates.length} cases updated.\n`);
}

main().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});
