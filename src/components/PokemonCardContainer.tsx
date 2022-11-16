import React from "react";
import { Container } from "react-bootstrap";
import { GenericPokemon } from "../types";
import { fetchPokemon } from "../fetchData/fetch";
import { useQueries } from "@tanstack/react-query";

interface Props {
  pokemonNames: GenericPokemon[];
}

const PokemonCardContainer = ({ pokemonNames }: Props) => {
  const queryData = useQueries({
    queries: [pokemonNames[0], pokemonNames[1]].map(
      (pokemon: GenericPokemon) => {
        return {
          queryKey: ["pokemon", pokemon.name],
          queryFn: () => fetchPokemon(pokemon.name),
          staleTime: Infinity,
          cacheTime: Infinity,
        };
      },
    ),
  });

  return <></>;
};

export default PokemonCardContainer;
