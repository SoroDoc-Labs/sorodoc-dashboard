import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "./setup.js";
import Home from "../app/page.js";

describe("Dashboard Page", () => {
  it("renders page title and upload button", () => {
    render(<Home />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/Inspect Local Contract WASM/i)).toBeInTheDocument();
    expect(screen.getByText(/Select WASM File/i)).toBeInTheDocument();
  });
});
