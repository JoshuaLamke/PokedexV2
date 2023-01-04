import React, { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { fetchTypeInfo, fetchAllCustomPokemon } from "../../fetchData/fetch";
import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import defaultImage from "../../assets/sadPokemon.png";
import { Col, Container, Row } from "react-bootstrap";
import { capitalize } from "lodash";
import { GiBroadsword, GiCheckedShield } from "react-icons/gi";
import {
  calculateTypeDefAndAttack,
  capitalizeWithHyphens,
  capitalizeWithoutHyphens,
  feetInchesToMeters,
  getTypesForMultiplier,
  lbsToKgs,
} from "../../utils/utils";
import { getImageByType } from "../../utils/typeImages";
import { typeColors } from "../../utils/typeColors";
import BarGraph from "../../components/BarGraph/BarGraph";
import { CustomPokemon, CustomStats, TypeDetails } from "../../types";
import Switch from "react-switch";
import { calculateCrumbs } from "../../components/Breadcrumb/Breadcrumbs";
import "./customPokemonDetails.scss";
import { Button, ThemeProvider, createTheme } from "@mui/material";
import axios from "axios";

const CustomPokemonDetails = () => {
  const [checked, setChecked] = useState<boolean>(true);
  const { pokemonName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [deleting, setDeleting] = useState<boolean>(false);
  const { data, isLoading } = useQuery({
    queryKey: ["pokemon", "custom"],
    queryFn: fetchAllCustomPokemon,
    cacheTime: Infinity,
    staleTime: Infinity,
    enabled: pokemonName !== undefined,
  });

  const typeResults = useQueries({
    queries: (data?.[pokemonName || ""]?.types || []).map((type) => ({
      queryKey: [type],
      queryFn: () => fetchTypeInfo(`https://pokeapi.co/api/v2/type/${type}`),
      cacheTime: Infinity,
      staleTime: Infinity,
      enabled: data !== undefined,
    })),
  });

  const everythingNotLoaded =
    !pokemonName ||
    isLoading ||
    !data ||
    typeResults.some((res) => res.isLoading || !res?.data?.name) ||
    deleting;

  const theme = createTheme({
    palette: {
      mode: "dark",
      primary: {
        "50": "#e7f5ec",
        "100": "#c4e7cf",
        "200": "#9fd7b1",
        "300": "#77c992",
        "400": "#58bd7b",
        "500": "#37b165",
        "600": "#2fa25b",
        "700": "#26904e",
        "800": "#1e7f43",
        "900": "#0d5f2f",
        main: "#58bd7b",
      },
      secondary: {
        "50": "#f7f7fa",
        "100": "#eeeef1",
        "200": "#e2e2e5",
        "300": "#d0d0d2",
        "400": "#ababae",
        "500": "#8a8a8d",
        "600": "#636365",
        "700": "#505052",
        "800": "#323234",
        "900": "#121214",
        main: "#323234",
      },
    },
  });

  if (everythingNotLoaded) {
    return (
      <div
        className="d-flex flex-column align-items-center justify-content-center"
        style={{ height: "100vh" }}
      >
        <h1 className="text-center text-primary">{`Loading ${capitalizeWithHyphens(
          pokemonName || "Unknown"
        )}'s Information...`}</h1>
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

  const colors: Record<keyof CustomStats, string> = {
    hp: "rgb(116, 227, 154)",
    atk: "rgb(233, 69, 96)",
    def: "rgb(150, 126, 118)",
    sp_atk: "rgb(165, 98, 220)",
    sp_def: "rgb(240, 225, 48)",
    speed: "rgb(0, 158, 255)",
  };
  const graphConfig = {
    title: `${capitalizeWithHyphens(data[pokemonName].pk)}'s Base Stats`,
    bars: Object.keys(data[pokemonName].stats).map((stat) => ({
      val: data[pokemonName].stats[stat as keyof CustomStats],
      name: stat.toUpperCase(),
      color: colors[stat as keyof CustomStats],
    })),
  };

  // Get type damage stats
  const typeStats = calculateTypeDefAndAttack(
    typeResults
      .filter((res) => res.data !== undefined)
      .map((res) => res.data) as TypeDetails[]
  );

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
                content: capitalizeWithoutHyphens(type),
                to: `/types/${type}`,
              }),
            },
          });
        }}
      />
    ));
  };

  return (
    <Container fluid style={{ maxWidth: "80em" }}>
      <Row>
        <Col
          lg={{
            span: 6,
            order: 2,
          }}
          className="d-flex flex-column justify-content-center align-items-center"
        >
          <img
            className="custom-pokemon-image"
            src={data[pokemonName].image_url}
            alt={`Image of ${data[pokemonName].pk}`}
            onError={({ currentTarget }) => {
              currentTarget.onerror = null;
              currentTarget.src = defaultImage;
              currentTarget.alt = "No image found.";
            }}
          />
        </Col>
        <Col
          lg={{
            span: 6,
            order: 1,
          }}
          className="d-flex flex-column align-items-center"
        >
          <h1 id="details-header" className="mt-3 text-center">
            {capitalizeWithHyphens(data[pokemonName].pk)}
          </h1>
          <div className="d-flex">
            {data[pokemonName].types.map((type) => (
              <div
                className="type-container"
                style={{ background: typeColors[capitalize(type)] }}
                key={type}
                onClick={() => {
                  window.scrollTo(0, 0);
                  navigate(`/types/${type}`, {
                    state: {
                      ...calculateCrumbs(location, {
                        active: false,
                        content: capitalizeWithoutHyphens(type),
                        to: `/types/${type}`,
                      }),
                    },
                  });
                }}
              >
                <img
                  className="type-image"
                  src={getImageByType(capitalize(type))}
                />
                <span className="type-text">{capitalize(type)}</span>
              </div>
            ))}
          </div>
          <p className="flavor-text mx-2 lead">
            {data[pokemonName].description}
          </p>
          <table className="table border-top details-table">
            <tbody>
              <tr>
                <th className="lead pokemon-generic-info-text">Abilities</th>
                <td className="lead pokemon-generic-info-text">
                  {data[pokemonName].abilities.map((a, i) => (
                    <p key={a.name}>{`${i + 1}) ${a.name
                      .split(" ")
                      .map((w) => capitalize(w.trim()))
                      .join(" ")} ${a.hidden ? " (Hidden)" : ""}`}</p>
                  ))}
                </td>
              </tr>
              <tr>
                <th className="lead pokemon-generic-info-text">Height</th>
                <td className="lead pokemon-generic-info-text">
                  {feetInchesToMeters(
                    data[pokemonName].feet,
                    data[pokemonName].inches
                  )}
                  m ({data[pokemonName].feet}' {data[pokemonName].inches}")
                </td>
              </tr>
              <tr>
                <th className="lead pokemon-generic-info-text">Weight</th>
                <td className="lead pokemon-generic-info-text">
                  {lbsToKgs(data[pokemonName].weight / 10)}kg (
                  {data[pokemonName].weight}lbs)
                </td>
              </tr>
              <tr>
                <th className="lead pokemon-generic-info-text">Genus</th>
                <td className="lead pokemon-generic-info-text">
                  {capitalizeWithoutHyphens(data[pokemonName].genus)}
                </td>
              </tr>
              <tr>
                <th className="lead pokemon-generic-info-text">Shape</th>
                <td className="lead pokemon-generic-info-text">
                  {capitalizeWithoutHyphens(data[pokemonName].shape)}
                </td>
              </tr>
              <tr>
                <th className="lead pokemon-generic-info-text">Color</th>
                <td className="lead pokemon-generic-info-text">
                  {capitalizeWithoutHyphens(data[pokemonName].color)}
                </td>
              </tr>
            </tbody>
          </table>
        </Col>
      </Row>
      <Row>
        <Col xs={12} className="my-3">
          <BarGraph graphConfig={graphConfig} />
        </Col>
        <Col xs={12} className="d-flex flex-column align-items-center my-3">
          <h3 className="text-center section-header">{`${capitalizeWithHyphens(
            data[pokemonName].pk
          )}'s Type Matchups`}</h3>
          <label className="d-flex align-items-center justify-content-between w-100">
            {checked ? (
              <span className="type-stat-cat lead">Attack</span>
            ) : (
              <span className="type-stat-cat lead">Defense</span>
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
          <table className="table border-top table-bordered">
            <tbody>
              <tr className="type-stats-row">
                <th className="type-stats-header lead">
                  No Damage {checked ? "To" : "From"}
                </th>
                <td>{renderTypeIcons(0)}</td>
              </tr>
              <tr className="type-stats-row">
                <th className="type-stats-header lead">
                  Quarter Damage {checked ? "To" : "From"}
                </th>
                <td>{renderTypeIcons(0.25)}</td>
              </tr>
              <tr className="type-stats-row">
                <th className="type-stats-header lead">
                  Half Damage {checked ? "To" : "From"}
                </th>
                <td>{renderTypeIcons(0.5)}</td>
              </tr>
              <tr className="type-stats-row">
                <th className="type-stats-header lead">
                  Normal Damage {checked ? "To" : "From"}
                </th>
                <td>{renderTypeIcons(1)}</td>
              </tr>
              <tr className="type-stats-row">
                <th className="type-stats-header lead">
                  Double Damage {checked ? "To" : "From"}
                </th>
                <td>{renderTypeIcons(2)}</td>
              </tr>
              <tr className="type-stats-row">
                <th className="type-stats-header lead">
                  Quadruple Damage {checked ? "To" : "From"}
                </th>
                <td>{renderTypeIcons(4)}</td>
              </tr>
            </tbody>
          </table>
        </Col>
        <Col xs={12} className="d-flex flex-column align-items-center">
          <h3 className="text-center section-header">{`Actions`}</h3>
          <div>
            <ThemeProvider theme={theme}>
              <Button
                color="primary"
                variant="contained"
                className="mt-3 action-button me-2"
                onClick={() =>
                  navigate(`/custom/update/${pokemonName}`, {
                    state: {
                      ...calculateCrumbs(location, {
                        active: false,
                        content: `Update ${capitalizeWithHyphens(pokemonName)}`,
                        to: `/custom/update/${pokemonName}`,
                      }),
                    },
                  })
                }
              >
                Edit
              </Button>
              <Button
                color="secondary"
                variant="contained"
                className="mt-3 action-button me-2"
                onClick={async () => {
                  try {
                    setDeleting(true);
                    await axios.post(
                      "https://gw4p75oxk9.execute-api.us-east-1.amazonaws.com/dev/custom/delete",
                      data[pokemonName]
                    );
                    const pokemonData:
                      | Record<string, CustomPokemon>
                      | undefined = queryClient.getQueryData([
                      "pokemon",
                      "custom",
                    ]);
                    if (pokemonData) {
                      const { [pokemonName]: deleted, ...undeletedPokemon } =
                        pokemonData;
                      queryClient.setQueryData(["pokemon", "custom"], {
                        ...undeletedPokemon,
                      });
                    }
                  } catch (e) {
                    alert(`An error occurred when deleting ${pokemonName}.`);
                  }
                  navigate(-1);
                }}
              >
                Delete
              </Button>
            </ThemeProvider>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default CustomPokemonDetails;
