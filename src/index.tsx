import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { QueryClient } from "@tanstack/react-query";

const client = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: Infinity,
      staleTime: Infinity,
    },
  },
});

const persister = createSyncStoragePersister({
  storage: window.localStorage,
});

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <PersistQueryClientProvider client={client} persistOptions={{ persister }}>
      <App />
    </PersistQueryClientProvider>
  </React.StrictMode>
);
