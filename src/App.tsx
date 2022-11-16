import React from "react";
import Routes from "./Routes";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import "./app.scss";

const App: React.FC = () => {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        cacheTime: Infinity,
      },
    },
  });

  return (
    <QueryClientProvider client={client}>
      <Routes />
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
};

export default App;
