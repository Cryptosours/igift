import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { motionMock } from "@/test-mocks";
import { DealScore } from "./deal-score";

vi.mock("motion/react", () => motionMock);

describe("DealScore", () => {
  it("renders the score number", () => {
    render(<DealScore score={92} />);
    expect(screen.getByText("92")).toBeInTheDocument();
  });

  it("labels score >= 85 as Excellent", () => {
    render(<DealScore score={85} />);
    expect(screen.getByText("Excellent")).toBeInTheDocument();
  });

  it("labels score 70-84 as Good", () => {
    render(<DealScore score={72} />);
    expect(screen.getByText("Good")).toBeInTheDocument();
  });

  it("labels score 50-69 as Fair", () => {
    render(<DealScore score={55} />);
    expect(screen.getByText("Fair")).toBeInTheDocument();
  });

  it("labels score < 50 as Weak", () => {
    render(<DealScore score={30} />);
    expect(screen.getByText("Weak")).toBeInTheDocument();
  });

  it("has accessible aria-label with score and rating", () => {
    render(<DealScore score={90} />);
    expect(
      screen.getByLabelText("Deal quality score: 90 out of 100, rated Excellent"),
    ).toBeInTheDocument();
  });

  it("boundary: score of exactly 70 is Good, not Fair", () => {
    render(<DealScore score={70} />);
    expect(screen.getByText("Good")).toBeInTheDocument();
  });

  it("boundary: score of exactly 50 is Fair, not Weak", () => {
    render(<DealScore score={50} />);
    expect(screen.getByText("Fair")).toBeInTheDocument();
  });
});
