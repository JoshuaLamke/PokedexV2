import React from "react";
import { render, screen } from "@testing-library/react";
import App from "../App";

describe("Testing App.tsx", () => {
  it("App renders correctly", async () => {
    render(<App />);
    expect(screen.getByText("Pokedex!")).toBeInTheDocument();
  });
});
