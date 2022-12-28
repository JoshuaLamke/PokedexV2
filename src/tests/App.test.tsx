import React from "react";
import { render, screen } from "@testing-library/react";
import App from "../App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

describe("Testing App.tsx", () => {
  it("App renders correctly", async () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <App />
      </QueryClientProvider>
    );
    expect(screen.getByText("Pokedex!")).toBeInTheDocument();
  });
});
