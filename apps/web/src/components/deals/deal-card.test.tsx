import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { motionMock } from "@/test-mocks";
import { DealCard, type DealCardProps } from "./deal-card";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock("motion/react", () => motionMock);

const baseDeal: DealCardProps = {
  id: "deal-1",
  brand: "Steam",
  brandSlug: "steam",
  title: "Steam $50 Gift Card",
  faceValue: 50,
  effectivePrice: 42.5,
  currency: "$",
  effectiveDiscount: 0.15,
  dealScore: 88,
  confidenceScore: 92,
  trustZone: "green",
  sourceName: "CardCash",
  sourceUrl: "https://cardcash.com",
  region: "US",
  lastVerified: "2 hours ago",
  historicalLow: false,
};

describe("DealCard", () => {
  it("renders the deal title", () => {
    render(<DealCard deal={baseDeal} />);
    expect(screen.getByText("Steam $50 Gift Card")).toBeInTheDocument();
  });

  it("renders the brand name as a link to brand page", () => {
    render(<DealCard deal={baseDeal} />);
    const brandLink = screen.getByText("Steam");
    expect(brandLink.closest("a")).toHaveAttribute("href", "/brands/steam");
  });

  it("displays the effective price formatted to 2 decimal places", () => {
    render(<DealCard deal={baseDeal} />);
    // Currency symbol and price are adjacent text nodes: "$" + "42.50"
    expect(screen.getByText((_, el) => el?.textContent === "$42.50" && el.classList.contains("price-display") && !el.classList.contains("line-through"))).toBeInTheDocument();
  });

  it("displays the face value with strikethrough", () => {
    render(<DealCard deal={baseDeal} />);
    expect(screen.getByText((_, el) => el?.textContent === "$50.00" && el.classList.contains("line-through"))).toBeInTheDocument();
  });

  it("calculates discount percentage correctly (effectiveDiscount * 100, rounded)", () => {
    render(<DealCard deal={baseDeal} />);
    // 0.15 → 15%
    expect(screen.getByText("-15%")).toBeInTheDocument();
  });

  it("rounds discount to nearest integer", () => {
    render(<DealCard deal={{ ...baseDeal, effectiveDiscount: 0.126 }} />);
    // 0.126 → Math.round(12.6) = 13
    expect(screen.getByText("-13%")).toBeInTheDocument();
  });

  it("renders the View Deal link with correct click tracking URL", () => {
    render(<DealCard deal={baseDeal} />);
    const viewDeal = screen.getByText("viewDeal").closest("a");
    expect(viewDeal).toHaveAttribute("href", "/api/click/deal-1");
  });

  it("View Deal link has rel=noopener noreferrer nofollow (compliance)", () => {
    render(<DealCard deal={baseDeal} />);
    const viewDeal = screen.getByText("viewDeal").closest("a");
    expect(viewDeal).toHaveAttribute("rel", "noopener noreferrer nofollow");
  });

  it("View Deal link opens in new tab", () => {
    render(<DealCard deal={baseDeal} />);
    const viewDeal = screen.getByText("viewDeal").closest("a");
    expect(viewDeal).toHaveAttribute("target", "_blank");
  });

  it("shows Historical Low badge when historicalLow is true", () => {
    render(<DealCard deal={{ ...baseDeal, historicalLow: true }} />);
    expect(screen.getByText("historicalLow")).toBeInTheDocument();
  });

  it("does NOT show Historical Low badge when historicalLow is false", () => {
    render(<DealCard deal={baseDeal} />);
    expect(screen.queryByText("historicalLow")).not.toBeInTheDocument();
  });

  it("displays confidence score", () => {
    render(<DealCard deal={baseDeal} />);
    // Mock returns key with param interpolation: "confidence" (no {score} in key)
    expect(screen.getByText("confidence")).toBeInTheDocument();
  });

  it("displays the last verified time", () => {
    render(<DealCard deal={baseDeal} />);
    expect(screen.getByText("2 hours ago")).toBeInTheDocument();
  });

  it("displays the source name via i18n key", () => {
    render(<DealCard deal={baseDeal} />);
    // Mock interpolates: t("via", { source: "CardCash" }) → "via"
    expect(screen.getByText("via")).toBeInTheDocument();
  });

  it("renders TrustBadge with correct zone", () => {
    render(<DealCard deal={{ ...baseDeal, trustZone: "yellow" }} />);
    expect(screen.getByText("Marketplace")).toBeInTheDocument();
  });

  it("renders DealScore with correct score", () => {
    render(<DealCard deal={baseDeal} />);
    // score=88 → Excellent
    expect(screen.getByText("88")).toBeInTheDocument();
    expect(screen.getByText("Excellent")).toBeInTheDocument();
  });
});
