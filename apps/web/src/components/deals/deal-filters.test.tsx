import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { motionMock } from "@/test-mocks";
import { DealFilters } from "./deal-filters";
import type { DealCardProps } from "./deal-card";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  usePathname: () => "/deals",
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock("motion/react", () => motionMock);

// Mock SearchBar (avoids useSearchParams nesting issues)
vi.mock("@/components/ui/search-bar", () => ({
  SearchBar: () => <div data-testid="search-bar" />,
}));

const makeDeal = (overrides: Partial<DealCardProps> = {}): DealCardProps => ({
  id: `deal-${Math.random().toString(36).slice(2)}`,
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
  ...overrides,
});

const testDeals: DealCardProps[] = [
  makeDeal({ id: "d1", brand: "Steam", region: "US", trustZone: "green", historicalLow: true }),
  makeDeal({ id: "d2", brand: "Amazon", region: "EU", trustZone: "yellow", historicalLow: false }),
  makeDeal({ id: "d3", brand: "Netflix", region: "US", trustZone: "green", historicalLow: false }),
  makeDeal({ id: "d4", brand: "Spotify", region: "global", trustZone: "red", historicalLow: true }),
];

describe("DealFilters", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all deals initially (All Regions selected)", () => {
    render(<DealFilters initialDeals={testDeals} />);
    // All 4 deals should render (DealCard uses i18n key "viewDeal")
    expect(screen.getAllByText("viewDeal")).toHaveLength(4);
  });

  it("renders region filter pills", () => {
    render(<DealFilters initialDeals={testDeals} />);
    expect(screen.getByText("allRegions")).toBeInTheDocument();
    expect(screen.getByText("US")).toBeInTheDocument();
    expect(screen.getByText("EU")).toBeInTheDocument();
  });

  it("filters by region when a region pill is clicked", async () => {
    const user = userEvent.setup();
    render(<DealFilters initialDeals={testDeals} />);

    // Click EU filter
    await user.click(screen.getByText("EU"));

    // Should show only EU deals + global deals
    // d2 (EU) + d4 (global) = 2
    expect(screen.getAllByText("viewDeal")).toHaveLength(2);
  });

  it("includes global deals when any region is selected", async () => {
    const user = userEvent.setup();
    render(<DealFilters initialDeals={testDeals} />);

    await user.click(screen.getByText("US"));
    // d1 (US) + d3 (US) + d4 (global) = 3
    expect(screen.getAllByText("viewDeal")).toHaveLength(3);
  });

  it("filters green-only when toggle is clicked", async () => {
    const user = userEvent.setup();
    render(<DealFilters initialDeals={testDeals} />);

    await user.click(screen.getByText("greenSourcesOnly"));
    // d1 (green) + d3 (green) = 2
    expect(screen.getAllByText("viewDeal")).toHaveLength(2);
  });

  it("filters historical lows when toggle is clicked", async () => {
    const user = userEvent.setup();
    render(<DealFilters initialDeals={testDeals} />);

    await user.click(screen.getByText("historicalLows"));
    // d1 (historicalLow) + d4 (historicalLow) = 2
    expect(screen.getAllByText("viewDeal")).toHaveLength(2);
  });

  it("combines region + green-only filters", async () => {
    const user = userEvent.setup();
    render(<DealFilters initialDeals={testDeals} />);

    await user.click(screen.getByText("US"));
    await user.click(screen.getByText("greenSourcesOnly"));
    // US green: d1, d3. Global green: none (d4 is red) → 2
    expect(screen.getAllByText("viewDeal")).toHaveLength(2);
  });

  it("shows empty state when no deals match filters", async () => {
    const user = userEvent.setup();
    render(<DealFilters initialDeals={testDeals} />);

    await user.click(screen.getByText("EU"));
    await user.click(screen.getByText("greenSourcesOnly"));
    // EU green: none. Global green: none (d4 is red) → 0
    expect(screen.getByText("noDealsFilter")).toBeInTheDocument();
  });

  it("shows result count when filters are active", async () => {
    const user = userEvent.setup();
    render(<DealFilters initialDeals={testDeals} />);

    await user.click(screen.getByText("historicalLows"));
    expect(screen.getByText(/resultCount/)).toBeInTheDocument();
  });

  it("clears filters when Clear filters is clicked", async () => {
    const user = userEvent.setup();
    render(<DealFilters initialDeals={testDeals} />);

    await user.click(screen.getByText("greenSourcesOnly"));
    expect(screen.getAllByText("viewDeal")).toHaveLength(2);

    await user.click(screen.getByText("clearFilters"));
    expect(screen.getAllByText("viewDeal")).toHaveLength(4);
  });

  it("sets aria-pressed on active region pill", async () => {
    const user = userEvent.setup();
    render(<DealFilters initialDeals={testDeals} />);

    const usPill = screen.getByText("US");
    expect(usPill).toHaveAttribute("aria-pressed", "false");

    await user.click(usPill);
    expect(usPill).toHaveAttribute("aria-pressed", "true");
  });

  it("sets aria-pressed on active toggle filters", async () => {
    const user = userEvent.setup();
    render(<DealFilters initialDeals={testDeals} />);

    const greenToggle = screen.getByText("greenSourcesOnly");
    expect(greenToggle).toHaveAttribute("aria-pressed", "false");

    await user.click(greenToggle);
    expect(greenToggle).toHaveAttribute("aria-pressed", "true");
  });

  it("respects defaultRegion prop", () => {
    render(<DealFilters initialDeals={testDeals} defaultRegion="EU" />);
    // EU + global = 2
    expect(screen.getAllByText("viewDeal")).toHaveLength(2);
  });
});
