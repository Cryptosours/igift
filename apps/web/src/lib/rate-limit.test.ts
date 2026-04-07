import { describe, it, expect, beforeEach, vi } from "vitest";
import { checkRateLimit } from "./rate-limit";

// Reset the module between tests so the in-memory store is fresh
beforeEach(async () => {
  vi.resetModules();
});

describe("checkRateLimit", () => {
  it("allows requests under the limit", () => {
    const result = checkRateLimit("1.2.3.4", { limit: 5, route: "test-under" });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
    expect(result.limit).toBe(5);
  });

  it("blocks requests at the limit", () => {
    for (let i = 0; i < 3; i++) {
      checkRateLimit("1.2.3.5", { limit: 3, route: "test-block" });
    }
    const result = checkRateLimit("1.2.3.5", { limit: 3, route: "test-block" });
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("decrements remaining correctly", () => {
    const r1 = checkRateLimit("1.2.3.6", { limit: 5, route: "test-decrement" });
    expect(r1.remaining).toBe(4);

    const r2 = checkRateLimit("1.2.3.6", { limit: 5, route: "test-decrement" });
    expect(r2.remaining).toBe(3);

    const r3 = checkRateLimit("1.2.3.6", { limit: 5, route: "test-decrement" });
    expect(r3.remaining).toBe(2);
  });

  it("treats different IPs independently", () => {
    for (let i = 0; i < 3; i++) {
      checkRateLimit("10.0.0.1", { limit: 3, route: "test-ip" });
    }
    // IP 10.0.0.1 is exhausted
    expect(checkRateLimit("10.0.0.1", { limit: 3, route: "test-ip" }).allowed).toBe(false);
    // IP 10.0.0.2 is fresh
    expect(checkRateLimit("10.0.0.2", { limit: 3, route: "test-ip" }).allowed).toBe(true);
  });

  it("treats different routes independently", () => {
    for (let i = 0; i < 2; i++) {
      checkRateLimit("10.0.0.3", { limit: 2, route: "route-a" });
    }
    // route-a is exhausted
    expect(checkRateLimit("10.0.0.3", { limit: 2, route: "route-a" }).allowed).toBe(false);
    // route-b is fresh for the same IP
    expect(checkRateLimit("10.0.0.3", { limit: 2, route: "route-b" }).allowed).toBe(true);
  });

  it("returns a valid resetUnix timestamp", () => {
    const before = Math.ceil((Date.now() + 60_000) / 1000);
    const result = checkRateLimit("1.2.3.7", { limit: 10, route: "test-reset", windowMs: 60_000 });
    const after = Math.ceil((Date.now() + 60_000) / 1000);
    expect(result.resetUnix).toBeGreaterThanOrEqual(before);
    expect(result.resetUnix).toBeLessThanOrEqual(after);
  });

  it("uses default windowMs of 60s when not specified", () => {
    const result = checkRateLimit("1.2.3.8", { limit: 10, route: "test-default-window" });
    // resetUnix should be ~60s from now
    const expectedMin = Math.ceil((Date.now() + 59_000) / 1000);
    const expectedMax = Math.ceil((Date.now() + 61_000) / 1000);
    expect(result.resetUnix).toBeGreaterThanOrEqual(expectedMin);
    expect(result.resetUnix).toBeLessThanOrEqual(expectedMax);
  });

  it("expires old requests after the window", async () => {
    const originalNow = Date.now;
    let mockNow = 1000000;

    // Use a short window for testability
    vi.spyOn(Date, "now").mockImplementation(() => mockNow);

    // Exhaust limit
    for (let i = 0; i < 3; i++) {
      checkRateLimit("10.0.0.4", { limit: 3, route: "test-expire", windowMs: 1000 });
    }
    expect(checkRateLimit("10.0.0.4", { limit: 3, route: "test-expire", windowMs: 1000 }).allowed).toBe(false);

    // Advance past the window
    mockNow += 1500;
    const result = checkRateLimit("10.0.0.4", { limit: 3, route: "test-expire", windowMs: 1000 });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2); // 1 consumed from this new request

    vi.spyOn(Date, "now").mockRestore();
  });
});
