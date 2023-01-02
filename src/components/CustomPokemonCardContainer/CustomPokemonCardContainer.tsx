import React, { useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { MdCatchingPokemon } from "react-icons/md";
import InfiniteScroll from "react-infinite-scroller";
import { CustomPokemon } from "../../types";
import CustomPokemonCard from "../CustomPokemonCard/CustomPokemonCard";
import "./customPokemonCardContainer.scss";

interface Props {
  cards: CustomPokemon[];
}

const CustomPokemonCardContainer = ({ cards }: Props) => {
  const [numLoaded, setNumLoaded] = useState(20);

  useEffect(() => {
    setNumLoaded(20);
  }, [cards]);
  const allCards = cards.map((pInfo) => (
    <React.Fragment key={pInfo.pk}>
      <Col xs={6} md={4} lg={3} className="pokemon-container-col">
        <CustomPokemonCard pokemonInfo={pInfo} />
      </Col>
    </React.Fragment>
  ));

  let pokemonCards = allCards.slice(
    0,
    numLoaded > allCards.length ? allCards.length : numLoaded
  );

  const hasMore = numLoaded <= allCards.length;
  return (
    <Container>
      <InfiniteScroll
        loadMore={() => {
          setNumLoaded(numLoaded + 20);
          pokemonCards = allCards.slice(0, numLoaded + 20);
        }}
        hasMore={hasMore}
        loader={
          <div key={0} className="text-primary">
            Loading more pokemon!
          </div>
        }
      >
        <Row className="g-3 d-flex justify-content-center">{pokemonCards}</Row>
      </InfiniteScroll>
      {!hasMore && (
        <div className="text-primary m-4 d-flex justify-content-center align-items-center">
          <MdCatchingPokemon color="white" size={30} />
          <h3 className="text-primary">No more Pokemon</h3>
          <MdCatchingPokemon color="white" size={30} />
        </div>
      )}
    </Container>
  );
};

export default CustomPokemonCardContainer;
