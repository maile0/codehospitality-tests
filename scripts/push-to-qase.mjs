const API_TOKEN = '9e5105aa9e54b11efd46e87e0a3a88116296df3751c023e1ce171e455b0e64a5';
const PROJECT_CODE = 'CODEH';
const BASE_URL = 'https://api.qase.io/v1';

const headers = {
  Token: API_TOKEN,
  'Content-Type': 'application/json',
};

async function post(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!data.status) throw new Error(`API error on ${path}: ${JSON.stringify(data)}`);
  return data.result;
}

async function createSuite(title) {
  const result = await post(`/suite/${PROJECT_CODE}`, { title });
  console.log(`  Suite: "${title}" → id ${result.id}`);
  return result.id;
}

async function createCase(suiteId, tc) {
  const result = await post(`/case/${PROJECT_CODE}`, { suite_id: suiteId, automation: 2, ...tc });
  console.log(`    Case: "${tc.title}" → id ${result.id}`);
  return result.id;
}

// ---------------------------------------------------------------------------
// Test cases definition
// ---------------------------------------------------------------------------

const suites = [
  {
    title: 'Navigation',
    cases: [
      {
        title: 'Navigate to registration page via login page link',
        behavior: 3,
        priority: 2,
        type: 2,
        steps: [
          { action: 'Navigate to /login page', expected_result: 'Login page is displayed' },
          { action: "Click the 'Join here' link", expected_result: 'Page URL changes to /signup' },
          { action: 'Verify email input, password input and Register button are present', expected_result: 'All three form elements are visible' },
        ],
      },
      {
        title: 'Registration page shows all 4 progress bar steps',
        behavior: 3,
        priority: 3,
        type: 2,
        steps: [
          { action: 'Navigate to /signup/1', expected_result: 'Registration page is displayed' },
          { action: 'Check the progress bar for all step labels', expected_result: '"Registration", "Personal Info", "Payment Details" and "Proof of Employment" labels are all visible' },
        ],
      },
    ],
  },
  {
    title: 'Registration form — field validation',
    cases: [
      {
        title: 'Empty email shows "Required field" validation error',
        behavior: 2,
        priority: 1,
        type: 2,
        steps: [
          { action: 'Navigate to /signup/1', expected_result: 'Registration page is displayed' },
          { action: 'Leave email field empty, fill a valid password, check terms, click Register', expected_result: '"Required field" error appears below the email input' },
          { action: 'Check that the activation popup is not shown', expected_result: 'Popup is not visible' },
        ],
      },
      {
        title: 'Empty password shows validation error',
        behavior: 2,
        priority: 1,
        type: 2,
        steps: [
          { action: 'Navigate to /signup/1', expected_result: 'Registration page is displayed' },
          { action: 'Fill a valid email, leave password empty, check terms, click Register', expected_result: 'Password validation error appears below the password input' },
          { action: 'Check that the activation popup is not shown', expected_result: 'Popup is not visible' },
        ],
      },
      {
        title: 'Invalid email format shows "Invalid e-mail" error',
        behavior: 2,
        priority: 2,
        type: 2,
        steps: [
          { action: 'Navigate to /signup/1', expected_result: 'Registration page is displayed' },
          { action: 'Fill email with "not-an-email", fill valid password, check terms, click Register', expected_result: '"Invalid e-mail" error appears below the email input' },
          { action: 'Check that the activation popup is not shown', expected_result: 'Popup is not visible' },
        ],
      },
      {
        title: 'Excessively long email is rejected with "must be a well-formed email address"',
        behavior: 2,
        priority: 2,
        type: 2,
        steps: [
          { action: 'Navigate to /signup/1', expected_result: 'Registration page is displayed' },
          { action: 'Fill email with a string of 100+ characters (e.g. longlonglonglong...@test.com), fill valid password, check terms, click Register', expected_result: 'Server error banner appears with "must be a well-formed email address"' },
          { action: 'Check that the activation popup is not shown', expected_result: 'Popup is not visible' },
        ],
      },
      {
        title: 'Unchecked terms checkbox blocks submission',
        behavior: 2,
        priority: 1,
        type: 2,
        steps: [
          { action: 'Navigate to /signup/1', expected_result: 'Registration page is displayed' },
          { action: 'Fill valid email and password but do NOT check the terms checkbox, click Register', expected_result: '"Required field" error text and error icon appear next to the terms checkbox' },
          { action: 'Check that the activation popup is not shown', expected_result: 'Popup is not visible' },
        ],
      },
      {
        title: 'Already-registered email shows "User with this email already exist" server error',
        behavior: 2,
        priority: 1,
        type: 2,
        steps: [
          { action: 'Navigate to /signup/1', expected_result: 'Registration page is displayed' },
          { action: 'Fill email with "test@test.com" (existing account), fill valid password, check terms, click Register', expected_result: 'Server error banner appears with "User with this email already exist"' },
          { action: 'Check that the activation popup is not shown', expected_result: 'Popup is not visible' },
        ],
      },
    ],
  },
  {
    title: 'Password field',
    cases: [
      {
        title: 'Password is hidden by default and revealed when eye icon is clicked',
        behavior: 3,
        priority: 2,
        type: 2,
        steps: [
          { action: 'Navigate to /signup/1 and fill the password field', expected_result: 'Password is masked — input type is "password"' },
          { action: 'Click the eye icon inside the password field', expected_result: 'Password becomes visible — input type changes to "text"' },
        ],
      },
      {
        title: 'Password is hidden again when eye icon is clicked a second time',
        behavior: 2,
        priority: 2,
        type: 2,
        steps: [
          { action: 'Navigate to /signup/1 and fill the password field', expected_result: 'Password is masked — input type is "password"' },
          { action: 'Click the eye icon once', expected_result: 'Password becomes visible — input type is "text"' },
          { action: 'Click the eye icon again', expected_result: 'Password is masked again — input type returns to "password"' },
        ],
      },
    ],
  },
  {
    title: 'Successful registration',
    cases: [
      {
        title: 'Successful registration shows activation popup with the registered email',
        behavior: 3,
        priority: 1,
        type: 3,
        steps: [
          { action: 'Navigate to /signup/1', expected_result: 'Registration page is displayed' },
          { action: 'Fill a unique valid email, a valid password, check terms, click Register', expected_result: 'Verification code popup appears' },
          { action: 'Check the email displayed inside the popup', expected_result: 'Email shown in the popup matches the email used during registration' },
        ],
      },
      {
        title: 'Activation popup contains all expected UI elements',
        behavior: 3,
        priority: 2,
        type: 2,
        steps: [
          { action: 'Register with a unique valid email and password', expected_result: 'Verification code popup appears' },
          { action: 'Check popup title', expected_result: '"Verification code sent" is visible' },
          { action: 'Check spam folder message', expected_result: '"If there is nothing in your inbox, please check your Spam folder." is visible' },
          { action: 'Count the verification code input boxes', expected_result: 'Exactly 5 digit input boxes are present' },
          { action: 'Check resend and change-email links', expected_result: 'Both "click here" links (resend and change email) are visible' },
        ],
      },
    ],
  },
  {
    title: 'Verification code popup',
    cases: [
      {
        title: 'Wrong verification code shows error message',
        behavior: 2,
        priority: 1,
        type: 2,
        steps: [
          { action: 'Register with a unique email and open the verification popup', expected_result: 'Popup is visible and shows the registered email' },
          { action: 'Enter 5 incorrect digits (e.g. 1, 2, 3, 4, 5) in the code inputs', expected_result: '"Error with code. Please check." error message appears' },
        ],
      },
      {
        title: 'Resend link sends a new code and shows success message',
        behavior: 3,
        priority: 2,
        type: 2,
        steps: [
          { action: 'Register and open the verification popup', expected_result: 'Popup is visible' },
          { action: 'Click the "click here" resend link', expected_result: '"A new verification code was sent." success message appears' },
        ],
      },
      {
        title: 'Partially filled code does not trigger an error',
        behavior: 2,
        priority: 3,
        type: 2,
        steps: [
          { action: 'Register and open the verification popup', expected_result: 'Popup is visible' },
          { action: 'Fill only 3 out of 5 digit inputs', expected_result: 'No error message is shown and the popup remains open' },
        ],
      },
    ],
  },
  {
    title: 'Update email popup',
    cases: [
      {
        title: 'Valid new email updates the email on the verification screen',
        behavior: 3,
        priority: 1,
        type: 2,
        steps: [
          { action: 'Register, open verification popup, click "Need to update your email? Click here"', expected_result: '"Update your email" popup appears' },
          { action: 'Enter a new unique valid email and click UPDATE', expected_result: 'Update popup closes and verification screen shows the new email' },
        ],
      },
      {
        title: 'Cancelling email update keeps the original email unchanged',
        behavior: 2,
        priority: 2,
        type: 2,
        steps: [
          { action: 'Register, open verification popup, click "Need to update your email? Click here"', expected_result: '"Update your email" popup appears' },
          { action: 'Enter a new email and click CANCEL', expected_result: 'Update popup closes and verification screen still shows the original registration email' },
        ],
      },
      {
        title: 'Invalid email in update popup shows "Invalid e-mail" error and icon',
        behavior: 2,
        priority: 2,
        type: 2,
        steps: [
          { action: 'Register, open verification popup, open update email popup', expected_result: '"Update your email" popup is visible' },
          { action: 'Enter "kokos" in the email field and click UPDATE', expected_result: '"Invalid e-mail" error text and error icon appear below the email input' },
        ],
      },
      {
        title: 'Empty email in update popup shows "Required field" error and icon',
        behavior: 2,
        priority: 2,
        type: 2,
        steps: [
          { action: 'Register, open verification popup, open update email popup', expected_result: '"Update your email" popup is visible' },
          { action: 'Leave the email field empty and click UPDATE', expected_result: '"Required field" error text and error icon appear below the email input' },
        ],
      },
      {
        title: 'Entering the same email as original shows server error',
        behavior: 2,
        priority: 2,
        type: 2,
        steps: [
          { action: 'Register with email A, open verification popup, open update email popup', expected_result: '"Update your email" popup is visible' },
          { action: 'Enter email A (same as original) and click UPDATE', expected_result: 'Server error banner appears with "User with this email already exist"' },
        ],
      },
      {
        title: 'Already-registered email in update popup shows server error',
        behavior: 2,
        priority: 2,
        type: 2,
        steps: [
          { action: 'Register, open verification popup, open update email popup', expected_result: '"Update your email" popup is visible' },
          { action: 'Enter "test@test.com" (already registered) and click UPDATE', expected_result: 'Server error banner appears with "User with this email already exist"' },
        ],
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log(`\nPushing test cases to Qase project "${PROJECT_CODE}"...\n`);

  let totalCases = 0;

  for (const suite of suites) {
    console.log(`\n[Suite] ${suite.title}`);
    const suiteId = await createSuite(suite.title);

    for (const tc of suite.cases) {
      await createCase(suiteId, tc);
      totalCases++;
    }
  }

  console.log(`\n✓ Done — ${totalCases} test cases created across ${suites.length} suites.\n`);
}

main().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});
