import { test, expect } from "@playwright/test";

/**
 * Mobile-viewport regression for the SIPESDEV ASCII banner.
 *
 * On real mobile browsers, `100vh` resolves to the *large* viewport
 * (URL-bar-collapsed) while the visible area is smaller by the URL-bar
 * height. A container sized `h-screen` (100vh) therefore exceeds the
 * visible area, the browser compensates by scrolling the document body
 * down, and content at the top of the page is pushed above the viewport.
 * With `body { overflow: hidden }` the user cannot scroll up to recover
 * the banner.
 *
 * CAVEAT: Chromium device emulation (and Chrome DevTools responsive mode)
 * flatten `100vh === innerHeight` — the URL-bar viewport mismatch cannot
 * be simulated in CI. The definitive repro is a real Android/iOS browser;
 * see `e2e/README.md` for the `adb reverse` + `brave://inspect` workflow.
 *
 * The specs below therefore use a two-layer guard:
 *   1. A behavioral check — the banner's top edge is inside the viewport.
 *      This catches any general layout breakage at mobile sizes.
 *   2. An implementation check — the terminal container uses `h-dvh`,
 *      not `h-screen`. This is the direct CI-reliable regression guard
 *      against someone re-introducing the original bug.
 */
test.describe("SIPESDEV banner visibility on mobile", () => {
  test("banner top edge is within the visible viewport on page load", async ({
    page,
  }) => {
    await page.goto("/");

    // WelcomeBanner renders as the first <pre> on the page.
    const banner = page.locator("pre").first();
    await expect(banner).toBeVisible();

    const bannerTop = await banner.evaluate(
      (el) => el.getBoundingClientRect().top,
    );
    expect(bannerTop).toBeGreaterThanOrEqual(0);
  });

  test("terminal container uses h-dvh, not h-screen", async ({ page }) => {
    await page.goto("/");

    // The outer terminal div is uniquely identified by its overflow + base-bg
    // combo. Whether it uses h-screen or h-dvh is what this test guards.
    const termRoot = page.locator("div.overflow-y-auto.bg-mb-bg").first();
    await expect(termRoot).toBeAttached();
    await expect(termRoot).toHaveClass(/\bh-dvh\b/);
    await expect(termRoot).not.toHaveClass(/\bh-screen\b/);
  });

  test("banner does not require horizontal scroll at mobile widths", async ({
    page,
  }) => {
    await page.goto("/");

    // The SIPESDEV ASCII banner uses Unicode block/box-drawing chars (█, ═,
    // ╗, etc.) that render at the standard 0.6em monospace width in the
    // self-hosted JetBrains Mono font (which includes those glyphs natively
    // — the Google Fonts subset does not). At 61 chars wide × 5.77px per
    // char (text-[0.375rem] = 6px font), banner width ≈ 352px, fitting the
    // 358px iPhone 13 budget (390px viewport minus p-4 padding). This spec
    // guards that scrollWidth <= clientWidth on mobile, catching any future
    // change that breaks banner sizing.
    const banner = page.locator("pre").first();
    await expect(banner).toBeVisible();

    const { scrollWidth, clientWidth } = await banner.evaluate((el) => ({
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
    }));
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });
});
