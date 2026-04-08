/**
 * Data integrity tests for lib/constants.ts.
 *
 * These tests validate the structural correctness and content of all exported
 * constants used throughout the terminal portfolio site. They ensure required
 * fields exist, URLs are properly formatted, and data arrays are non-empty.
 *
 * This is not about testing logic but about guarding against accidental data
 * corruption, missing fields, or malformed URLs that would break the UI.
 */

import {
  USER,
  LINKS,
  PROJECTS,
  SKILLS,
  ASCII_BANNER,
  GITHUB_BADGES,
} from "@/lib/constants";

// ---------------------------------------------------------------------------
// USER object
// ---------------------------------------------------------------------------
describe("USER constant", () => {
  it("has a 'name' field that is a non-empty string", () => {
    expect(typeof USER.name).toBe("string");
    expect(USER.name.length).toBeGreaterThan(0);
  });

  it("has a 'shortName' field that is a non-empty string", () => {
    expect(typeof USER.shortName).toBe("string");
    expect(USER.shortName.length).toBeGreaterThan(0);
  });

  it("has a 'hostname' field that is a non-empty string", () => {
    expect(typeof USER.hostname).toBe("string");
    expect(USER.hostname.length).toBeGreaterThan(0);
  });

  it("has a 'bio' field that is a non-empty string", () => {
    expect(typeof USER.bio).toBe("string");
    expect(USER.bio.length).toBeGreaterThan(0);
  });

  it("has a 'profileImage' field that starts with '/' (valid public path)", () => {
    expect(typeof USER.profileImage).toBe("string");
    expect(USER.profileImage.startsWith("/")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// LINKS object
// ---------------------------------------------------------------------------
describe("LINKS constant", () => {
  it("has a 'github' URL that starts with 'https://'", () => {
    expect(typeof LINKS.github).toBe("string");
    expect(LINKS.github.startsWith("https://")).toBe(true);
  });

  it("has a 'linkedin' URL that starts with 'https://'", () => {
    expect(typeof LINKS.linkedin).toBe("string");
    expect(LINKS.linkedin.startsWith("https://")).toBe(true);
  });

  it("has an 'email' that contains '@'", () => {
    expect(typeof LINKS.email).toBe("string");
    expect(LINKS.email).toContain("@");
  });
});

// ---------------------------------------------------------------------------
// PROJECTS array
// ---------------------------------------------------------------------------
describe("PROJECTS constant", () => {
  it("is a non-empty array", () => {
    expect(Array.isArray(PROJECTS)).toBe(true);
    expect(PROJECTS.length).toBeGreaterThan(0);
  });

  it("every project has required fields: name, description, languages, url", () => {
    for (const project of PROJECTS) {
      expect(typeof project.name).toBe("string");
      expect(project.name.length).toBeGreaterThan(0);

      expect(typeof project.description).toBe("string");
      expect(project.description.length).toBeGreaterThan(0);

      expect(Array.isArray(project.languages)).toBe(true);

      expect(typeof project.url).toBe("string");
    }
  });

  it("every project URL starts with 'https://'", () => {
    for (const project of PROJECTS) {
      expect(project.url.startsWith("https://")).toBe(true);
    }
  });

  it("every project has a non-empty languages array", () => {
    for (const project of PROJECTS) {
      expect(project.languages.length).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// SKILLS object
// ---------------------------------------------------------------------------
describe("SKILLS constant", () => {
  it("has at least one category", () => {
    const categories = Object.keys(SKILLS);
    expect(categories.length).toBeGreaterThan(0);
  });

  it("every category has at least one item", () => {
    for (const [category, items] of Object.entries(SKILLS)) {
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// ASCII_BANNER
// ---------------------------------------------------------------------------
describe("ASCII_BANNER constant", () => {
  it("is a non-empty string", () => {
    expect(typeof ASCII_BANNER).toBe("string");
    expect(ASCII_BANNER.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// GITHUB_BADGES
// ---------------------------------------------------------------------------
describe("GITHUB_BADGES constant", () => {
  it("is a non-empty array", () => {
    expect(Array.isArray(GITHUB_BADGES)).toBe(true);
    expect(GITHUB_BADGES.length).toBeGreaterThan(0);
  });

  it("contains only non-empty strings", () => {
    for (const badge of GITHUB_BADGES) {
      expect(typeof badge).toBe("string");
      expect(badge.length).toBeGreaterThan(0);
    }
  });
});
