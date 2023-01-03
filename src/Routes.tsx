import React from "react";
import {
  Route,
  Routes as RouterRoutes,
  BrowserRouter as Router,
} from "react-router-dom";
import Footer from "./components/Footer/Footer";
import Header from "./components/Header/Header";
import CreatePokemon from "./Pages/CreatePokemon/CreatePokemon";
import EditPokemon from "./Pages/CreatePokemon/EditPokemon";
import CustomPokemon from "./Pages/CustomPokemon/CustomPokemon";
import CustomPokemonDetails from "./Pages/CustomPokemonDetails/CustomPokemonDetails";
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
        <Route path="/" element={<Home />} />
        <Route path="/pokemon/:pokemonName" element={<PokemonDetails />} />
        <Route
          path="/pokemon/custom/:pokemonName"
          element={<CustomPokemonDetails />}
        />
        <Route path="/custom/update/:pokemonName" element={<EditPokemon />} />
        <Route path="/types/:typeName" element={<TypeDetails />} />
        <Route path="/moves/:moveName" element={<MoveDetails />} />
        <Route path="/custom" element={<CustomPokemon />} />
        <Route path="/custom/create" element={<CreatePokemon />} />
        <Route path="/queries/remove" element={<RemoveQueries />} />
        <Route path="*" element={<PageNotFound />} />
      </RouterRoutes>
      <Footer />
    </Router>
  );
};

export default Routes;
