import React from "react";
import { Container } from "react-bootstrap";
import { fetchAllPokemon } from "../fetchData/fetch";
import { useQuery } from "@tanstack/react-query";
import PokemonCardContainer from "../components/PokemonCardContainer";
import "../styles/Home/home.scss";

const Home: React.FC = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["pokemon", "general"],
    queryFn: fetchAllPokemon,
    cacheTime: Infinity,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <>
      <Container
        fluid
        id="home-container"
        className="d-flex flex-column justify-content-center align-items-center"
      >
        <header className="d-flex flex-column align-items-center">
          <h1 id="header">Pokedex!</h1>
          <div className="w-100">
            <h5 className="text-primary">By Joshua Lamke</h5>
          </div>
        </header>
        <section className="mt-5">
          <h3>Search For Pokemon</h3>
          <input type="text" id="home-pokemon-search" />
        </section>
      </Container>
      {isLoading || isError ? (
        <>{"Loading"}</>
      ) : (
        <PokemonCardContainer pokemonNames={data} />
      )}
    </>
  );
};

export default Home;
