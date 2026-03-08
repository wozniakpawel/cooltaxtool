import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import InfoPopover from "./InfoPopover";

describe("InfoPopover", () => {
  it("renders the info button", () => {
    render(<InfoPopover title="Test Title" content="Test content" />);
    const button = screen.getByRole("button", { name: /info/i });
    expect(button).toBeDefined();
  });

  it("shows popover content when clicked", async () => {
    render(<InfoPopover title="Test Title" content="Test content here" />);
    const button = screen.getByRole("button", { name: /info/i });
    fireEvent.click(button);
    await waitFor(() => {
      expect(screen.getByText("Test Title")).toBeDefined();
      expect(screen.getByText("Test content here")).toBeDefined();
    });
  });
});
