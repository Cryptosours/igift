import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TrustBadge } from "./trust-badge";

describe("TrustBadge", () => {
  it("renders 'Verified' for green zone", () => {
    render(<TrustBadge zone="green" />);
    expect(screen.getByText("Verified")).toBeInTheDocument();
  });

  it("renders 'Marketplace' for yellow zone", () => {
    render(<TrustBadge zone="yellow" />);
    expect(screen.getByText("Marketplace")).toBeInTheDocument();
  });

  it("renders 'Caution' for red zone", () => {
    render(<TrustBadge zone="red" />);
    expect(screen.getByText("Caution")).toBeInTheDocument();
  });

  it("applies deal (green) styling for green zone", () => {
    const { container } = render(<TrustBadge zone="green" />);
    const badge = container.firstElementChild;
    expect(badge?.className).toContain("bg-deal-50");
    expect(badge?.className).toContain("text-deal-700");
  });

  it("applies alert (amber) styling for yellow zone", () => {
    const { container } = render(<TrustBadge zone="yellow" />);
    const badge = container.firstElementChild;
    expect(badge?.className).toContain("bg-alert-50");
    expect(badge?.className).toContain("text-alert-700");
  });

  it("applies red styling for red zone", () => {
    const { container } = render(<TrustBadge zone="red" />);
    const badge = container.firstElementChild;
    expect(badge?.className).toContain("bg-red-50");
    expect(badge?.className).toContain("text-red-700");
  });
});
