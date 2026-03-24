import { test, expect } from "@playwright/test";

test.describe("인증 플로우", () => {
  test("로그인 페이지가 렌더링된다", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveTitle(/침팬지픽/);
    await expect(page.getByText(/게스트/i)).toBeVisible();
  });

  test("게스트 로그인 버튼이 존재한다", async ({ page }) => {
    await page.goto("/login");
    const guestBtn = page.getByRole("button", { name: /바로 시작하기/i });
    await expect(guestBtn).toBeVisible();
  });

  test("미인증 상태에서 게임 페이지 접근 시 로그인으로 리다이렉트", async ({ page }) => {
    // Clear any stored token
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());

    await page.goto("/game");
    // Should redirect to login or show login prompt
    await expect(page).toHaveURL(/.*login/);
  });
});
