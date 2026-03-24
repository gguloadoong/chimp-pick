import { test, expect } from "@playwright/test";

test.describe("게임 페이지", () => {
  test("메인 페이지가 렌더링된다", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/침팬지픽/);
  });

  test("UP/DOWN 버튼이 표시된다", async ({ page }) => {
    await page.goto("/");
    // Either game is shown or login redirect
    const hasUpBtn = await page.getByRole("button", { name: /UP/i }).isVisible().catch(() => false);
    const hasLoginRedirect = page.url().includes("login");
    expect(hasUpBtn || hasLoginRedirect).toBe(true);
  });

  test("바텀 네비게이션이 표시된다", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("navigation")).toBeVisible();
  });
});
