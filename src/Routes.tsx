import React from "react";
import { Route, Routes as RouterRoutes, BrowserRouter as Router } from "react-router-dom";
import PageNotFound from "./PageNotFound";

const Routes: React.FC = () => {
  return (
    <Router basename="/">
      <RouterRoutes>
        <Route index element={<h1>Hello World</h1>} />
        <Route path="*" element={<PageNotFound />} />
      </RouterRoutes>
    </Router>
  );
};

export default Routes;
