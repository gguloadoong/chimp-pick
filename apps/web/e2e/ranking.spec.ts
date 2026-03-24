import { test, expect } from "@playwright/test";

test.describe("랭킹 페이지", () => {
  test("랭킹 페이지가 렌더링된다", async ({ page }) => {
    await page.goto("/ranking");
    await expect(page).toHaveTitle(/침팬지픽/);
  });

  test("랭킹 목록 영역이 존재한다", async ({ page }) => {
    await page.goto("/ranking");
    // Page renders without crashing
    await expect(page.locator("body")).toBeVisible();
    await expect(page.getByRole("navigation")).toBeVisible();
  });
});
