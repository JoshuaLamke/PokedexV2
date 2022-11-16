import React from "react";
import {
  Route,
  Routes as RouterRoutes,
  BrowserRouter as Router,
} from "react-router-dom";
import Home from "./Pages/Home";
import PageNotFound from "./Pages/PageNotFound";

const Routes: React.FC = () => {
  return (
    <Router basename="/">
      <RouterRoutes>
        <Route index element={<Home />} />
        <Route path="*" element={<PageNotFound />} />
      </RouterRoutes>
    </Router>
  );
};

export default Routes;
