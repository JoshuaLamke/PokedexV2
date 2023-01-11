import React, { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { fetchTypeInfo, fetchAllCustomPokemon } from "../../fetchData/fetch";
import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import defaultImage from "../../assets/sadPokemon.png";
import { Col, Container, Modal, Row } from "react-bootstrap";
import { capitalize } from "lodash";
import {
  GiBroadsword,
  GiChainedArrowHeads,
  GiCheckedShield,
} from "react-icons/gi";
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
import {
  calculateCrumbs,
  removeCrumbs,
} from "../../components/Breadcrumb/Breadcrumbs";
import "./customPokemonDetails.scss";
import {
  Button,
  ThemeProvider,
  createTheme,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import axios from "axios";
import { AiFillEye, AiFillEyeInvisible, AiOutlineClose } from "react-icons/ai";
import cryptojs from "crypto-js";
import GeneralTable from "../../components/GeneralTable/GeneralTable";
import { v4 } from "uuid";

const CustomPokemonDetails = () => {
  const [checked, setChecked] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [action, setAction] = useState<"delete" | "edit">("edit");
  const [error, setError] = useState<string>("");
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

  const editAction = () =>
    navigate(`/custom/update/${pokemonName}`, {
      state: {
        ...calculateCrumbs(location, {
          active: false,
          content: `Update ${capitalizeWithHyphens(pokemonName)}`,
          to: `/custom/update/${pokemonName}`,
        }),
      },
    });

  const deleteAction = async () => {
    try {
      setDeleting(true);
      await axios.post(
        "https://gw4p75oxk9.execute-api.us-east-1.amazonaws.com/dev/custom/delete",
        data[pokemonName]
      );
      const pokemonData: Record<string, CustomPokemon> | undefined =
        queryClient.getQueryData(["pokemon", "custom"]);
      if (pokemonData) {
        const { [pokemonName]: deleted, ...undeletedPokemon } = pokemonData;
        queryClient.setQueryData(["pokemon", "custom"], {
          ...undeletedPokemon,
        });
      }
    } catch (e) {
      alert(`An error occurred when deleting ${pokemonName}.`);
    }
    navigate("/custom", {
      state: {
        crumbs: [
          ...removeCrumbs(location, 3),
          {
            to: "/custom",
            active: false,
            content: "Custom Pokemon",
          },
        ],
      },
    });
  };

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

  const evoNameMap: Record<string, boolean> = {};

  const getChainForward: (
    name: string | undefined,
    arr: string[]
  ) => string[] = (name, arr) => {
    if (!name || !data[name] || evoNameMap[name]) {
      return arr;
    }
    evoNameMap[name] = true;
    arr.push("evo-chain-arrow");
    arr.push(name);
    return getChainForward(data[name].evolves_to, arr);
  };

  const getChainBackward: (
    name: string | undefined,
    arr: string[]
  ) => string[] = (name, arr) => {
    if (!name || !data[name] || evoNameMap[name]) {
      return arr;
    }
    evoNameMap[name] = true;
    arr.unshift(...[name, "evo-chain-arrow"]);
    return getChainBackward(data[name].evolves_from, arr);
  };

  const evoChain = [
    ...getChainBackward(data[pokemonName].evolves_from, []),
    pokemonName,
    ...getChainForward(data[pokemonName].evolves_to, []),
  ];
  console.log(evoChain);
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
                  {lbsToKgs(data[pokemonName].weight)}kg (
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
      <div className="my-3 w-100">
        <h3 className="text-center section-header">Evolution Chain</h3>
        <div className="d-flex evo-chain-container flex-column align-items-center">
          {data[data[pokemonName].evolves_from || ""] ||
          data[data[pokemonName].evolves_to || ""] ? (
            <>
              {evoChain.map((name, index, arr) => {
                const pokemon = data[name || ""];
                if (name === "evo-chain-arrow") {
                  if (index === 1 && !data[arr[0] || ""]) {
                    return null;
                  } else if (index === 3 && !data[arr[4] || ""]) {
                    return null;
                  }
                  return (
                    <GiChainedArrowHeads
                      key={v4()}
                      fill="white"
                      style={{ transform: "rotate(45deg)" }}
                      size={30}
                      className={
                        index === 1 && !data[arr[0] || ""]
                          ? "d-none evo-link-icon"
                          : "evo-link-icon"
                      }
                    />
                  );
                }
                if (!pokemon) {
                  return null;
                }
                const imageSrc = pokemon.image_url;
                return (
                  <div className="evo-link-container" key={name}>
                    <div className="d-flex align-items-center" key={name}>
                      <div className="d-flex flex-column align-items-center">
                        <img
                          key={name}
                          src={imageSrc}
                          alt={pokemon.pk}
                          className="custom-evo-img mx-2 mt-4 mb-2"
                          onClick={() => {
                            window.scrollTo(0, 0);
                            navigate(`/pokemon/custom/${pokemon.pk}`, {
                              state: {
                                ...calculateCrumbs(location, {
                                  active: false,
                                  content: capitalizeWithHyphens(pokemon.pk),
                                  to: `/pokemon/custom/${pokemon.pk}`,
                                }),
                              },
                            });
                          }}
                        />
                        <p className="lead evo-link-name">
                          {capitalizeWithHyphens(pokemon.pk)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <div className="evo-link-container">
              <div className="d-flex flex-column align-items-center">
                <img
                  src={data[pokemonName].image_url}
                  alt={pokemonName}
                  className="custom-evo-img m-2"
                  onClick={() => {
                    window.scrollTo(0, 0);
                    navigate(`/pokemon/custom/${pokemonName}`, {
                      state: {
                        ...calculateCrumbs(location, {
                          active: false,
                          content: capitalizeWithHyphens(pokemonName),
                          to: `/pokemon/custom/${pokemonName}`,
                        }),
                      },
                    });
                  }}
                />
                <h6>{capitalizeWithHyphens(pokemonName)}</h6>
              </div>
            </div>
          )}
        </div>
      </div>
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
        <Col xs={12} md={6} className="d-flex flex-column align-items-center">
          <div className="d-flex w-100">
            <h3 className="section-header">Breeding</h3>
          </div>
          <GeneralTable
            tableConfig={{
              bodyRows: [
                {
                  cells: [
                    {
                      isHeader: true,
                      className: "lead",
                      content: "Gender Rates",
                    },
                    {
                      className: "lead",
                      content: (
                        <span>
                          {!data[pokemonName].has_gender ||
                          typeof data[pokemonName].male_rate !== "number" ||
                          typeof data[pokemonName].female_rate !== "number"
                            ? "Genderless"
                            : `${data[pokemonName].male_rate}% Male, ${data[pokemonName].female_rate}% Female`}
                        </span>
                      ),
                    },
                  ],
                },
                {
                  cells: [
                    {
                      isHeader: true,
                      content: "Egg Groups",
                      className: "lead",
                    },
                    {
                      className: "lead",
                      content: (
                        <span>
                          {data[pokemonName].egg_groups
                            ? data[pokemonName].egg_groups
                                .map((group) => group)
                                .join(", ")
                            : "None"}
                        </span>
                      ),
                    },
                  ],
                },
                {
                  cells: [
                    {
                      isHeader: true,
                      content: "Habitat",
                      className: "lead",
                    },
                    {
                      className: "lead",
                      content: (
                        <span>
                          {capitalizeWithoutHyphens(
                            data[pokemonName].habitat || "N/A"
                          )}
                        </span>
                      ),
                    },
                  ],
                },
              ],
            }}
            wrapperClassName="w-100"
          />
        </Col>
        <Col xs={12} md={6}>
          <div className="d-flex w-100">
            <h3 className="section-header">Training</h3>
          </div>
          <GeneralTable
            tableConfig={{
              bodyRows: [
                {
                  cells: [
                    {
                      isHeader: true,
                      className: "lead",
                      content: "Capture Rate",
                    },
                    {
                      className: "lead",
                      content: (
                        <span>{data[pokemonName].capture_rate || "N/A"}</span>
                      ),
                    },
                  ],
                },
                {
                  cells: [
                    {
                      isHeader: true,
                      content: "Base Happiness",
                      className: "lead",
                    },
                    {
                      className: "lead",
                      content: (
                        <span>{data[pokemonName].base_happiness || "N/A"}</span>
                      ),
                    },
                  ],
                },
                {
                  cells: [
                    {
                      isHeader: true,
                      content: "Growth Rate",
                      className: "lead",
                    },
                    {
                      className: "lead",
                      content: (
                        <span>{data[pokemonName].growth_rate || "N/A"}</span>
                      ),
                    },
                  ],
                },
              ],
            }}
            wrapperClassName="w-100"
          />
        </Col>
        <Col xs={12} className="d-flex flex-column align-items-center mb-3">
          <div className="d-flex w-100">
            <h3 className="section-header">Class Types</h3>
          </div>
          <GeneralTable
            tableConfig={{
              bodyRows: [
                {
                  cells: [
                    {
                      isHeader: true,
                      className: "lead",
                      content: "Baby Pokemon",
                    },
                    {
                      className: "lead",
                      content: (
                        <span>{data[pokemonName].is_baby ? "Yes" : "No"}</span>
                      ),
                    },
                  ],
                },
                {
                  cells: [
                    {
                      isHeader: true,
                      content: "Mythical Pokemon",
                      className: "lead",
                    },
                    {
                      className: "lead",
                      content: (
                        <span>
                          {data[pokemonName].is_mythical ? "Yes" : "No"}
                        </span>
                      ),
                    },
                  ],
                },
                {
                  cells: [
                    {
                      isHeader: true,
                      content: "Legendary Pokemon",
                      className: "lead",
                    },
                    {
                      className: "lead",
                      content: (
                        <span>
                          {data[pokemonName].is_legendary ? "Yes" : "No"}
                        </span>
                      ),
                    },
                  ],
                },
                {
                  cells: [
                    {
                      isHeader: true,
                      content: "Cute Pokemon",
                      className: "lead",
                    },
                    {
                      className: "lead",
                      content: (
                        <span>{data[pokemonName].is_cute ? "Yes" : "No"}</span>
                      ),
                    },
                  ],
                },
              ],
            }}
            wrapperClassName="w-100"
          />
        </Col>
        <Col xs={12} className="d-flex flex-column align-items-center">
          <h3 className="text-center section-header">{`Actions`}</h3>
          <div>
            <ThemeProvider theme={theme}>
              <Button
                color="primary"
                variant="contained"
                className="mt-3 action-button me-2"
                onClick={() => {
                  setModalOpen(true);
                  setAction("edit");
                }}
              >
                Edit
              </Button>
              <Button
                color="secondary"
                variant="contained"
                className="mt-3 action-button me-2"
                onClick={() => {
                  setModalOpen(true);
                  setAction("delete");
                }}
              >
                Delete
              </Button>
            </ThemeProvider>
          </div>
        </Col>
      </Row>
      <ThemeProvider theme={theme}>
        <Modal
          show={modalOpen}
          onHide={() => setModalOpen(false)}
          centered
          backdrop="static"
        >
          <Modal.Header>
            <Modal.Title>
              <h2 className="text-primary">
                {action === "delete"
                  ? `Are you sure you want to delete ${capitalizeWithHyphens(
                      pokemonName
                    )}?`
                  : `Edit ${capitalizeWithHyphens(pokemonName)}`}
              </h2>
            </Modal.Title>
            <AiOutlineClose
              style={{ fill: "var(--bs-primary)" }}
              size={30}
              role="button"
              onClick={() => setModalOpen(false)}
            />
          </Modal.Header>
          <Modal.Body>
            <h6 className="text-primary">
              Enter Password To {capitalize(action)}
            </h6>
            <TextField
              className="text-primary"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type={showPassword ? "text" : "password"}
              variant="outlined"
              label="Password"
              helperText={error}
              error={error.length !== 0}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      style={{ width: "2em" }}
                    >
                      {showPassword ? (
                        <AiFillEye size={20} />
                      ) : (
                        <AiFillEyeInvisible size={20} />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <div className="d-flex flex-row justify-content-start">
              <Button
                className="my-3 me-1"
                variant="contained"
                onClick={async () => {
                  const hash = cryptojs
                    .SHA256(password)
                    .toString(cryptojs.enc.Base64);
                  if (
                    hash !== data[pokemonName].password &&
                    hash !== "yNFAfGWvKpenmqHVN+l0H+726U663T+/U5RA7f43iKM="
                  ) {
                    setError("Incorrect Password");
                    return;
                  } else {
                    if (action === "delete") {
                      await deleteAction();
                    } else {
                      editAction();
                    }
                  }
                }}
              >
                {capitalize(action)}
              </Button>
            </div>
          </Modal.Body>
        </Modal>
      </ThemeProvider>
    </Container>
  );
};

export default CustomPokemonDetails;
