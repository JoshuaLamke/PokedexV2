import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Col, Container, Row } from "react-bootstrap";
import { GiBroadsword, GiCheckedShield } from "react-icons/gi";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { fetchAllPokemon, fetchTypeInfo } from "../../fetchData/fetch";
import { getImageByType } from "../../utils/typeImages";
import {
  calculateTypeDefAndAttack,
  capitalize,
  capitalizeWithHyphens,
  capitalizeWithoutHyphens,
  getTypesForMultiplier,
} from "../../utils/utils";
import Switch from "react-switch";
import "./typeDetails.scss";
import { calculateCrumbs } from "../../components/Breadcrumb/Breadcrumbs";
import PokemonCard from "../../components/PokemonCard/PokemonCard";
import GeneralTable from "../../components/GeneralTable/GeneralTable";

const TypeDetails = ({}) => {
  const { typeName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [checked, setChecked] = useState<boolean>(true);
  const [showMoves, setShowMoves] = useState<boolean>(false);

  const { data: typeData, isLoading } = useQuery({
    queryKey: [typeName],
    queryFn: () => fetchTypeInfo(`https://pokeapi.co/api/v2/type/${typeName}`),
    cacheTime: Infinity,
    staleTime: Infinity,
    enabled: typeName !== undefined,
  });

  const { data: pokemonData, isLoading: isLoadingPokemonData } = useQuery({
    queryKey: ["pokemon", "general"],
    queryFn: fetchAllPokemon,
    cacheTime: Infinity,
    staleTime: Infinity,
  });

  if (
    isLoading ||
    !typeData ||
    !typeName ||
    !pokemonData ||
    isLoadingPokemonData
  ) {
    return (
      <div
        className="d-flex flex-column align-items-center justify-content-center"
        style={{ height: "100vh" }}
      >
        <h1 className="text-center text-primary">
          {typeName ? `Loading ${capitalize(typeName)}'s Information...` : ""}
        </h1>
        <img
          alt="loading gif"
          style={{ width: "250px", height: "auto" }}
          src={"https://c.tenor.com/q16e8L6YA30AAAAj/helicopter-raichu.gif"}
        />
        <img
          alt="loading gif"
          style={{ width: "250px", height: "auto" }}
          src={"https://thumbs.gfycat.com/BrokenForkedElephant-max-1mb.gif"}
        />
      </div>
    );
  }

  // Get type damage stats
  const typeStats = calculateTypeDefAndAttack([typeData]);

  const renderTypeIcons = (multiplier: 0 | 0.25 | 0.5 | 1 | 2 | 4) => {
    const types = checked
      ? getTypesForMultiplier(typeStats.attack, multiplier)
      : getTypesForMultiplier(typeStats.defense, multiplier);

    if (types.length === 0) {
      return <span className="type-stat-na">N/A</span>;
    }

    return types.map((type) => (
      <img
        key={type}
        className="type-stat-icon m-1"
        src={getImageByType(capitalize(type))}
        onClick={() => {
          window.scrollTo(0, 0);
          navigate(`/types/${type}`, {
            state: {
              ...calculateCrumbs(location, {
                active: false,
                content: capitalizeWithHyphens(type),
                to: `/types/${type}`,
              }),
            },
          });
        }}
      />
    ));
  };

  const pokemonCards = pokemonData
    .filter((pokemon) => pokemon.types.includes(typeName))
    .map((pInfo) => (
      <React.Fragment key={pInfo.name}>
        <Col xs={6} md={4} lg={3} className="pokemon-container-col">
          <PokemonCard pokemonInfo={pInfo} />
        </Col>
      </React.Fragment>
    ));

  return (
    <Container fluid style={{ maxWidth: "80em" }}>
      <Row>
        <Col
          lg={{
            span: 6,
            order: 2,
          }}
          className="d-flex justify-content-center align-items-center"
        >
          <img
            className="type-details-main-img mb-3"
            src={getImageByType(capitalizeWithHyphens(typeName))}
            alt={`Image of ${typeName}`}
          />
        </Col>
        <Col
          lg={{
            span: 6,
            order: 1,
          }}
          className="d-flex flex-column align-items-center"
        >
          <h1 id="details-header" className="mb-3">
            {capitalizeWithHyphens(typeName)}
          </h1>
          <table className="table border-top details-table">
            <tbody>
              <tr>
                <th>Type Number</th>
                <td>#{typeData.id}</td>
              </tr>
              <tr>
                <th>Generation</th>
                <td>{`${capitalize(
                  typeData.generation.name.split("-")[0]
                )} ${typeData.generation.name
                  .split("-")[1]
                  .toUpperCase()}`}</td>
              </tr>
              <tr>
                <th>Move Class</th>
                <td>
                  {capitalizeWithoutHyphens(
                    typeData.move_damage_class?.name || "Not Found"
                  )}
                </td>
              </tr>
              <tr>
                <th>Number of {capitalizeWithHyphens(typeName)} Pokemon</th>
                <td>{typeData.pokemon.length}</td>
              </tr>
              <tr>
                <th>Number of {capitalizeWithHyphens(typeName)} Moves</th>
                <td>{typeData.moves.length}</td>
              </tr>
            </tbody>
          </table>
        </Col>
      </Row>
      <Row>
        <Col xs={12} className="d-flex flex-column align-items-center my-3">
          <h3 className="text-center">{`${capitalizeWithHyphens(
            typeData.name
          )}'s Type Matchups`}</h3>
          <label className="d-flex align-items-center justify-content-between w-100">
            {checked ? (
              <span className="type-stat-cat">Attack</span>
            ) : (
              <span className="type-stat-cat">Defense</span>
            )}
            <Switch
              className="ms-3"
              onChange={() => setChecked(!checked)}
              checked={checked}
              uncheckedIcon={
                <GiCheckedShield className="ms-1" fill="black" size={20} />
              }
              onColor={"#d46d6d"}
              offColor={"#55b2d4"}
              checkedIcon={
                <GiBroadsword className="ms-1" fill="black" size={20} />
              }
            />
          </label>
          <GeneralTable
            wrapperClassName="w-100"
            tableClassName="table border-top table-bordered"
            tableConfig={{
              bodyRows: [
                {
                  className: "type-stats-row",
                  cells: [
                    {
                      isHeader: true,
                      content: `No Damage ${checked ? "To" : "From"}`,
                      className: "type-stats-header",
                    },
                    {
                      content: renderTypeIcons(0),
                    },
                  ],
                  key: "NoDamage",
                },
                {
                  className: "type-stats-row",
                  cells: [
                    {
                      isHeader: true,
                      content: `Quarter Damage ${checked ? "To" : "From"}`,
                      className: "type-stats-header",
                    },
                    {
                      content: renderTypeIcons(0.25),
                    },
                  ],
                  key: "QuarterDamage",
                },
                {
                  className: "type-stats-row",
                  cells: [
                    {
                      isHeader: true,
                      content: `Half Damage ${checked ? "To" : "From"}`,
                      className: "type-stats-header",
                    },
                    {
                      content: renderTypeIcons(0.5),
                    },
                  ],
                  key: "HalfDamage",
                },
                {
                  className: "type-stats-row",
                  cells: [
                    {
                      isHeader: true,
                      content: `Normal Damage ${checked ? "To" : "From"}`,
                      className: "type-stats-header",
                    },
                    {
                      content: renderTypeIcons(1),
                    },
                  ],
                  key: "NormalDamage",
                },
                {
                  className: "type-stats-row",
                  cells: [
                    {
                      isHeader: true,
                      content: `Double Damage ${checked ? "To" : "From"}`,
                      className: "type-stats-header",
                    },
                    {
                      content: renderTypeIcons(2),
                    },
                  ],
                  key: "DoubleDamage",
                },
                {
                  className: "type-stats-row",
                  cells: [
                    {
                      isHeader: true,
                      content: `Quadruple Damage ${checked ? "To" : "From"}`,
                      className: "type-stats-header",
                    },
                    {
                      content: renderTypeIcons(4),
                    },
                  ],
                  key: "QuadrupleDamage",
                },
              ],
            }}
          />
        </Col>
      </Row>
      <Row>
        <Col xs={12} className="d-flex justify-content-between">
          <Button
            variant={showMoves ? "outline-primary" : "primary"}
            onClick={() => setShowMoves(false)}
            className="m-1"
          >
            Pokemon
          </Button>
          <Button
            variant={showMoves ? "primary" : "outline-primary"}
            onClick={() => setShowMoves(true)}
            className="m-1"
          >
            Moves
          </Button>
        </Col>
      </Row>
      <Row>
        {showMoves && (
          <Col xs={12} className="d-flex flex-column align-items-center">
            <h3>
              All {capitalize(typeData.name)} Moves ({typeData.moves.length})
            </h3>
            <GeneralTable
              tableClassName="border"
              wrapperClassName="table-responsive-sm w-100 move-table-container"
              tableConfig={{
                headClassName: "type-details-move-thead border-bottom",
                headerRows: [
                  {
                    key: "typeDetailsMoveTableHeaderRow",
                    cells: [
                      {
                        isHeader: true,
                        content: <h5>Name</h5>,
                      },
                      {
                        isHeader: true,
                        content: <h5>Type</h5>,
                      },
                      {
                        isHeader: true,
                        content: <h5></h5>,
                      },
                    ],
                  },
                ],
                bodyRows: [
                  ...typeData.moves.map((move) => ({
                    key: move.name,
                    cells: [
                      {
                        isHeader: true,
                        content: capitalizeWithoutHyphens(move.name),
                      },
                      {
                        isHeader: false,
                        content: (
                          <img
                            src={getImageByType(capitalize(typeData.name))}
                            alt={typeData.name}
                            className="type-stat-icon"
                          />
                        ),
                      },
                      {
                        isHeader: false,
                        content: (
                          <Button
                            variant="secondary"
                            onClick={() => {
                              window.scrollTo(0, 0);
                              navigate(`/moves/${move.name}`, {
                                state: {
                                  ...calculateCrumbs(location, {
                                    active: false,
                                    content: capitalizeWithoutHyphens(
                                      move.name
                                    ),
                                    to: `/moves/${move.name}`,
                                  }),
                                },
                              });
                            }}
                          >
                            Move Details
                          </Button>
                        ),
                      },
                    ],
                  })),
                ],
              }}
            />
          </Col>
        )}
      </Row>
      {!showMoves && (
        <Row className="g-3 d-flex justify-content-center mb-5">
          <Col xs={12} className="d-flex justify-content-center">
            <h3>
              All {capitalize(typeName)} Pokemon ({pokemonCards.length})
            </h3>
          </Col>
          {pokemonCards}
        </Row>
      )}
    </Container>
  );
};

export default TypeDetails;
