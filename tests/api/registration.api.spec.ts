import { test, expect, APIRequestContext } from "@playwright/test";
import { VALID_PASSWORD, uniqueEmail } from "../../helpers/test-data";

const ENDPOINTS = {
  register: "/api/web/members/register",
  validate: "/api/web/members/validation",
  resend: "/api/web/members/resend-validation",
  email: "/api/web/members/email",
};

async function registerUser(request: APIRequestContext, email = uniqueEmail()) {
  const res = await request.post(
    `${ENDPOINTS.register}?unauthId=${crypto.randomUUID()}`,
    {
      data: {
        email,
        password: VALID_PASSWORD,
        termsAndConditionsConsent: true,
        promoCode: "",
      },
    },
  );
  const token = res.headers()["x-auth-token"];
  return { res, token };
}

function authHeaders(token: string) {
  return { headers: { "x-auth-token": token } };
}

// POST /api/web/members/register

test.describe("POST /api/web/members/register", () => {
  test("valid payload returns 201 with sessionId", async ({ request }) => {
    const { res } = await registerUser(request);

    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body).toHaveProperty("sessionId");
    expect(typeof body.sessionId).toBe("string");
  });

  test("duplicate email returns 4xx", async ({ request }) => {
    const email = uniqueEmail();
    await registerUser(request, email);
    const { res } = await registerUser(request, email);

    expect(res.status()).toBeGreaterThanOrEqual(400);
    expect(res.status()).toBeLessThan(500);
  });

  test("missing email returns 400", async ({ request }) => {
    const res = await request.post(
      `${ENDPOINTS.register}?unauthId=${crypto.randomUUID()}`,
      {
        data: {
          password: VALID_PASSWORD,
          termsAndConditionsConsent: true,
          promoCode: "",
        },
      },
    );

    expect(res.status()).toBe(400);
  });

  test("missing password returns 400", async ({ request }) => {
    const res = await request.post(
      `${ENDPOINTS.register}?unauthId=${crypto.randomUUID()}`,
      {
        data: {
          email: uniqueEmail(),
          termsAndConditionsConsent: true,
          promoCode: "",
        },
      },
    );

    expect(res.status()).toBe(400);
  });

  test("invalid email format returns 400", async ({ request }) => {
    const res = await request.post(
      `${ENDPOINTS.register}?unauthId=${crypto.randomUUID()}`,
      {
        data: {
          email: "not-an-email",
          password: VALID_PASSWORD,
          termsAndConditionsConsent: true,
          promoCode: "",
        },
      },
    );

    expect(res.status()).toBe(400);
  });

  test("terms not accepted returns 400", async ({ request }) => {
    const res = await request.post(
      `${ENDPOINTS.register}?unauthId=${crypto.randomUUID()}`,
      {
        data: {
          email: uniqueEmail(),
          password: VALID_PASSWORD,
          termsAndConditionsConsent: false,
          promoCode: "",
        },
      },
    );

    expect(res.status()).toBe(400);
  });
});

// POST /api/web/members/validation

test.describe("POST /api/web/members/validation", () => {
  test("wrong code returns 404 with error message", async ({ request }) => {
    const { token } = await registerUser(request);
    const res = await request.post(ENDPOINTS.validate, {
      ...authHeaders(token),
      data: { code: "99999" },
    });

    expect(res.status()).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Code not validated");
  });
});

// POST /api/web/members/resend-validation

test.describe("POST /api/web/members/resend-validation", () => {
  test("returns 200", async ({ request }) => {
    const { token } = await registerUser(request);
    const res = await request.post(ENDPOINTS.resend, authHeaders(token));

    expect(res.status()).toBe(200);
  });
});

// POST /api/web/members/email

test.describe("POST /api/web/members/email", () => {
  test("valid new email returns 201", async ({ request }) => {
    const { token } = await registerUser(request);
    const res = await request.post(ENDPOINTS.email, {
      ...authHeaders(token),
      data: { email: uniqueEmail() },
    });

    expect(res.status()).toBe(201);
  });

  test("already registered email returns 4xx", async ({ request }) => {
    const existingEmail = uniqueEmail();
    await registerUser(request, existingEmail);
    const { token } = await registerUser(request);

    const res = await request.post(ENDPOINTS.email, {
      ...authHeaders(token),
      data: { email: existingEmail },
    });

    expect(res.status()).toBeGreaterThanOrEqual(400);
    expect(res.status()).toBeLessThan(500);
  });

  test("invalid email format returns 4xx", async ({ request }) => {
    const { token } = await registerUser(request);
    const res = await request.post(ENDPOINTS.email, {
      ...authHeaders(token),
      data: { email: "not-an-email" },
    });

    expect(res.status()).toBeGreaterThanOrEqual(400);
    expect(res.status()).toBeLessThan(500);
  });
});
