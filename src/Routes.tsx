import React from "react";
import {
  Route,
  Routes as RouterRoutes,
  BrowserRouter as Router,
} from "react-router-dom";
import Footer from "./components/Footer/Footer";
import Header from "./components/Header/Header";
import Home from "./Pages/Home/Home";
import MoveDetails from "./Pages/MoveDetails/MoveDetails";
import PageNotFound from "./Pages/PageNotFound/PageNotFound";
import PokemonDetails from "./Pages/PokemonDetails/PokemonDetails";
import RemoveQueries from "./Pages/RemoveQueries/RemoveQueries";
import TypeDetails from "./Pages/TypeDetails/TypeDetails";

const Routes: React.FC = () => {
  return (
    <Router basename="/">
      <Header />
      <RouterRoutes>
        <Route index element={<Home />} />
        <Route path="/pokemon/:pokemonName" element={<PokemonDetails />} />
        <Route path="/types/:typeName" element={<TypeDetails />} />
        <Route path="/moves/:moveName" element={<MoveDetails />} />
        <Route path="/queries/remove" element={<RemoveQueries />} />
        <Route path="*" element={<PageNotFound />} />
      </RouterRoutes>
      <Footer />
    </Router>
  );
};

export default Routes;
