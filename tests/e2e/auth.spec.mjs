import { test, expect } from "@playwright/test";

const adminEmail = process.env.E2E_ADMIN_EMAIL;
const adminPassword = process.env.E2E_ADMIN_PASSWORD;
const gvEmail = process.env.E2E_GV_EMAIL;
const gvPassword = process.env.E2E_GV_PASSWORD;

async function login(page, email, password) {
  await page.goto("/login");
  await page.getByLabel("E-mail operacional").fill(email);
  await page.getByLabel("Senha de acesso").fill(password);
  await page.getByRole("button", { name: "Iniciar sessão" }).click();
}

test.describe("auth flows", () => {
  test.skip(!adminEmail || !adminPassword, "Admin credentials not configured");

  test("admin can log in and reach restricted area", async ({ page }) => {
    await login(page, adminEmail, adminPassword);

    await expect(page).toHaveURL(/\/admin$/);
    await page.goto("/admin/logs");
    await expect(page.getByRole("heading", { name: "Logs do sistema" })).toBeVisible();
  });
});

test.describe("authorization", () => {
  test.skip(!gvEmail || !gvPassword, "GV credentials not configured");

  test("gv is redirected away from restricted pages", async ({ page }) => {
    await login(page, gvEmail, gvPassword);

    await expect(page).toHaveURL(/\/admin$/);
    await page.goto("/admin/logs");
    await expect(page).toHaveURL(/\/admin$/);
  });
});
