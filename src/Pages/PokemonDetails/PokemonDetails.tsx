import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  fetchEvolutionDetails,
  fetchIndividualPokemonName,
  fetchIndividualPokemonContext,
  fetchSpeciesDetails,
  fetchTypeInfo,
  fetchMoveInfo,
  fetchVersionInfo,
} from "../../fetchData/fetch";
import { useQueries, useQuery } from "@tanstack/react-query";
import defaultImage from "../../assets/sadPokemon.png";
import { Button, Col, Container, FormControl, Row } from "react-bootstrap";
import { capitalize } from "lodash";
import "./pokemonDetails.scss";
import {
  GiBroadsword,
  GiCheckedShield,
  GiChainedArrowHeads,
} from "react-icons/gi";
import {
  calculateTypeDefAndAttack,
  capitalizeWithHyphens,
  capitalizeWithoutCharacter,
  capitalizeWithoutHyphens,
  findEvoInfoFromChain,
  getTypesForMultiplier,
  kgsToLbs,
  MOVE_LEARN_METHODS,
  mToFeetInches,
} from "../../utils/utils";
import { getImageByType } from "../../utils/typeImages";
import { typeColors } from "../../utils/typeColors";
import BarGraph from "../../components/BarGraph/BarGraph";
import {
  MoveDetails,
  PokemonInfo,
  TypeDetails,
  VersionDetails,
} from "../../types";
import Switch from "react-switch";
import { calculateCrumbs } from "../../components/Breadcrumb/Breadcrumbs";
import GeneralTable from "../../components/GeneralTable/GeneralTable";
import { v4 } from "uuid";

const PokemonDetails = () => {
  const { pokemonName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [checked, setChecked] = useState<boolean>(true);
  const [gameVersion, setGameVersion] = useState<{
    version: string;
    name: string;
  }>({
    version: "None",
    name: pokemonName || "",
  });
  const [moveLearnMethod, setMoveLearnMethod] = useState<string>("level-up");
  const { data, isLoading } = useQuery({
    queryKey: ["pokemon", pokemonName],
    queryFn: fetchIndividualPokemonContext,
    cacheTime: Infinity,
    staleTime: Infinity,
    enabled: pokemonName !== undefined,
  });

  const typeResults = useQueries({
    queries: (data?.types || []).map((type) => ({
      queryKey: [type.type.name],
      queryFn: () => fetchTypeInfo(type.type.url),
      cacheTime: Infinity,
      staleTime: Infinity,
      enabled: data !== undefined,
    })),
  });

  const moveResults = useQueries({
    queries: (data?.moves || []).map((move) => ({
      queryKey: ["move", move.move.name],
      queryFn: () => fetchMoveInfo(move.move.url),
      cacheTime: Infinity,
      staleTime: Infinity,
      enabled: data !== undefined,
    })),
  });

  const { data: speciesData, isLoading: isLoadingSpecies } = useQuery({
    queryKey: ["pokemon", pokemonName, "speciesDetails"],
    queryFn: () => fetchSpeciesDetails(data?.species.url || ""),
    cacheTime: Infinity,
    staleTime: Infinity,
    enabled: data !== undefined,
  });

  const versionResults = useQueries({
    queries: (
      speciesData?.flavor_text_entries.filter(
        (f) => f.language.name === "en"
      ) || []
    ).map((flavorText) => ({
      queryKey: ["version", flavorText.version.name],
      queryFn: () => fetchVersionInfo(flavorText.version.url),
      cacheTime: Infinity,
      staleTime: Infinity,
      enabled: speciesData !== undefined,
    })),
  });

  const { data: evoData, isLoading: isLoadingEvo } = useQuery({
    queryKey: ["pokemon", pokemonName, "evolutionDetails"],
    queryFn: () =>
      fetchEvolutionDetails(speciesData?.evolution_chain?.url || ""),
    cacheTime: Infinity,
    staleTime: Infinity,
    enabled: speciesData !== undefined,
  });

  // Get type damage stats
  const typeStats = calculateTypeDefAndAttack(
    typeResults
      .filter((res) => res.data !== undefined)
      .map((res) => res.data) as TypeDetails[]
  );

  // Get evolution path format and evolution names
  const evoChainNames = findEvoInfoFromChain(evoData);

  const evoResults = useQueries({
    queries: evoChainNames.names.map((name) => ({
      queryKey: ["pokemon", name],
      queryFn: () => fetchIndividualPokemonName(name),
      cacheTime: Infinity,
      staleTime: Infinity,
      enabled: evoData !== undefined,
      retry: false,
    })),
  });

  const everythingNotLoaded =
    !pokemonName ||
    isLoading ||
    isLoadingSpecies ||
    isLoadingEvo ||
    !data ||
    !speciesData;

  // Set version to default when new pokemon is accessed
  useEffect(() => {
    if (pokemonName) {
      setGameVersion({
        version: "None",
        name: pokemonName,
      });
    }
  }, [pokemonName]);

  const hasMoves = (version: VersionDetails, pokemonData: PokemonInfo) => {
    return pokemonData.moves.some((move) =>
      move.version_group_details.some(
        (v) => v.version_group.name === version.version_group?.name
      )
    );
  };

  useEffect(() => {
    if (
      versionResults.length &&
      versionResults.every((res) => res.isSuccess) &&
      data &&
      gameVersion.version === "None" &&
      pokemonName
    ) {
      const versions = [
        ...versionResults.map((res) => res.data),
      ] as VersionDetails[];
      versions.sort((a, b) => {
        const aHasMoves = hasMoves(a, data);
        const bHasMoves = hasMoves(b, data);
        if (aHasMoves && !bHasMoves) {
          return -1;
        } else if (!aHasMoves && bHasMoves) {
          return 1;
        } else {
          return a.id - b.id;
        }
      });

      const first = versions[0];
      setGameVersion({
        name: pokemonName,
        version: first.name,
      });
    }
  }, [versionResults, data, gameVersion, pokemonName]);

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

  const labels = ["HP", "ATK", "DEF", "SP-ATK", "SP-DEF", "SPEED"];
  const colors = [
    "rgb(116, 227, 154)",
    "rgb(233, 69, 96)",
    "rgb(150, 126, 118)",
    "rgb(165, 98, 220)",
    "rgb(240, 225, 48)",
    "rgb(0, 158, 255)",
  ];
  const graphConfig = {
    title: `${capitalizeWithHyphens(data.name)}'s Base Stats`,
    bars: data.stats.map((stat, i) => ({
      val: stat.base_stat,
      name: labels[i],
      color: colors[i],
    })),
  };

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

  const versions = [
    ...(versionResults.length && versionResults.every((v) => v.isSuccess)
      ? versionResults.map((res) => res.data)
      : []),
  ] as VersionDetails[];

  const moves = [
    ...(moveResults.length && moveResults.every((m) => m.isSuccess)
      ? moveResults.map((res) => res.data)
      : []),
  ] as MoveDetails[];

  // Find all available move learn methods
  const moveLearnMethods = MOVE_LEARN_METHODS.reduce(
    (prev: string[], curr: string) => {
      const hasLearnMethod = data.moves.some((move) => {
        return move.version_group_details.some((vg) => {
          return (
            vg.move_learn_method.name === curr &&
            vg.version_group.name ===
              versions.find((v) => v.name === gameVersion.version)
                ?.version_group.name
          );
        });
      });

      if (hasLearnMethod) {
        return [...prev, curr];
      }
      return prev;
    },
    []
  );

  // Add filtering for game versions and for type of learn method
  const movesFromGameVersion = data.moves
    .filter((m) =>
      m.version_group_details.some(
        (v) =>
          v.version_group.name ===
            versions.find((version) => version.name === gameVersion.version)
              ?.version_group.name &&
          v.move_learn_method.name === moveLearnMethod
      )
    )
    .map((m) => ({
      level:
        m.version_group_details.find(
          (v) =>
            versions.find((version) => version.name === gameVersion.version)
              ?.version_group.name &&
            v.move_learn_method.name === moveLearnMethod
        )?.level_learned_at || 0,
      name: m.move.name,
    }))
    .sort((a, b) => {
      const levelDiff = a.level - b.level;
      if (levelDiff === 0) {
        return a.name.localeCompare(b.name);
      }
      return levelDiff;
    });

  const backSprites = Object.keys(data.sprites).filter(
    (k) => k.includes("back") && data.sprites[k as keyof typeof data.sprites]
  );
  const frontSprites = Object.keys(data.sprites).filter(
    (k) => k.includes("front") && data.sprites[k as keyof typeof data.sprites]
  );
  const dreamWorldSprites = Object.keys(data.sprites.other.dream_world).filter(
    (k) =>
      data.sprites.other.dream_world[
        k as keyof typeof data.sprites.other.dream_world
      ]
  );

  return (
    <Container fluid style={{ maxWidth: "80em" }}>
      <Row>
        <Col
          xs={12}
          className="d-flex flex-column align-items-center align-items-lg-start"
        >
          <h4>Game Version</h4>
          <FormControl
            className="text-primary pokemon-details-select"
            onChange={(e) =>
              setGameVersion({
                version: e.target.value,
                name: pokemonName,
              })
            }
            value={gameVersion.version}
            as="select"
          >
            {versions
              .sort((a, b) => a.id - b.id)
              .map((version) => (
                <option value={version.name} key={version.name}>
                  {capitalizeWithHyphens(version.name)}
                </option>
              ))}
          </FormControl>
        </Col>
        <Col
          lg={{
            span: 6,
            order: 2,
          }}
          className="d-flex flex-column justify-content-center align-items-center"
        >
          <img
            className="pokemon-image"
            src={
              data.sprites.other["official-artwork"].front_default ||
              data.sprites.front_default ||
              `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${data.id}.png`
            }
            alt={`Image of ${data.name}`}
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
          <h1 id="details-header" className="mt-2">
            {capitalizeWithHyphens(data.name)}
          </h1>
          <div className="d-flex">
            {data.types.map((type) => (
              <div
                className="type-container"
                style={{ background: typeColors[capitalize(type.type.name)] }}
                key={type.type.name}
                onClick={() => {
                  window.scrollTo(0, 0);
                  navigate(`/types/${type.type.name}`, {
                    state: {
                      ...calculateCrumbs(location, {
                        active: false,
                        content: capitalizeWithoutHyphens(type.type.name),
                        to: `/types/${type.type.name}`,
                      }),
                    },
                  });
                }}
              >
                <img
                  className="type-image"
                  src={getImageByType(capitalize(type.type.name))}
                />
                <span className="type-text">{capitalize(type.type.name)}</span>
              </div>
            ))}
          </div>
          <p className="flavor-text mx-2 lead">
            {speciesData.flavor_text_entries
              .filter(
                (ft) =>
                  ft.language.name === "en" &&
                  ft.version.name === gameVersion.version
              )?.[0]
              ?.flavor_text.replaceAll(/(\f)|(\n)|(\r)/g, " ")}
          </p>
          <table className="table border-top details-table">
            <tbody>
              <tr>
                <th className="lead pokemon-generic-info-text">
                  Pokemon Number
                </th>
                <td className="lead pokemon-generic-info-text">#{data.id}</td>
              </tr>
              <tr>
                <th className="lead pokemon-generic-info-text">Abilities</th>
                <td className="lead pokemon-generic-info-text">
                  {data.abilities.map((a, i) => (
                    <p key={a.ability.name}>{`${i + 1}) ${a.ability.name
                      .split(" ")
                      .map((w) => capitalize(w.trim()))
                      .join(" ")} ${a.is_hidden ? "(Hidden)" : ""}`}</p>
                  ))}
                </td>
              </tr>
              <tr>
                <th className="lead pokemon-generic-info-text">Height</th>
                <td className="lead pokemon-generic-info-text">
                  {data.height / 10}m ({mToFeetInches(data.height / 10)})
                </td>
              </tr>
              <tr>
                <th className="lead pokemon-generic-info-text">Weight</th>
                <td className="lead pokemon-generic-info-text">
                  {data.weight / 10}kg ({kgsToLbs(data.weight / 10)}lbs)
                </td>
              </tr>
              <tr>
                <th className="lead pokemon-generic-info-text">Genus</th>
                <td className="lead pokemon-generic-info-text">
                  {speciesData.genera.filter(
                    (genus) => genus.language.name === "en"
                  )?.[0]?.genus || "N/A"}
                </td>
              </tr>
              <tr>
                <th className="lead pokemon-generic-info-text">Shape</th>
                <td className="lead pokemon-generic-info-text">
                  {capitalizeWithHyphens(speciesData.shape?.name || "N/A")}
                </td>
              </tr>
              <tr>
                <th className="lead pokemon-generic-info-text">Color</th>
                <td className="lead pokemon-generic-info-text">
                  {capitalizeWithHyphens(speciesData.color?.name || "N/A")}
                </td>
              </tr>
            </tbody>
          </table>
        </Col>
      </Row>
      <div className="my-3 w-100">
        <h3 className="text-center section-header">Evolution Chain</h3>
        <div className="d-flex evo-chain-container">
          {evoData && !evoResults.some((res) => res.isError) ? (
            evoChainNames.evoPath.map((link, index) => {
              return (
                <div className="evo-link-container" key={link.toString()}>
                  {link.map((name) => {
                    const pokemon = evoResults.find(
                      (result) => result.data?.name === name
                    )?.data;
                    if (!pokemon) {
                      return null;
                    }
                    const imageSrc =
                      pokemon.sprites.other["official-artwork"].front_default ||
                      pokemon.sprites.other.dream_world.front_default ||
                      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;
                    return (
                      <div className="d-flex align-items-center" key={name}>
                        <GiChainedArrowHeads
                          fill="white"
                          style={{ transform: "rotate(-45deg)" }}
                          className={
                            index === 0
                              ? "d-none evo-link-icon"
                              : "evo-link-icon"
                          }
                        />
                        <div className="d-flex flex-column align-items-center">
                          <img
                            key={name}
                            src={imageSrc}
                            alt={pokemon.name}
                            className="evo-img m-2"
                            onClick={() => {
                              window.scrollTo(0, 0);
                              navigate(`/pokemon/${pokemon.name}`, {
                                state: {
                                  ...calculateCrumbs(location, {
                                    active: false,
                                    content: capitalizeWithHyphens(
                                      pokemon.name
                                    ),
                                    to: `/pokemon/${pokemon.name}`,
                                  }),
                                },
                              });
                            }}
                          />
                          <p className="lead evo-link-name">
                            {capitalizeWithHyphens(pokemon.name)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })
          ) : (
            <div className="evo-link-container">
              <div className="d-flex flex-column align-items-center">
                <img
                  src={
                    data.sprites.other["official-artwork"].front_default ||
                    data.sprites.front_default ||
                    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${data.id}.png`
                  }
                  alt={data.name}
                  className="evo-img m-2"
                  onClick={() => {
                    window.scrollTo(0, 0);
                    navigate(`/pokemon/${data.name}`, {
                      state: {
                        ...calculateCrumbs(location, {
                          active: false,
                          content: capitalizeWithHyphens(data.name),
                          to: `/pokemon/${data.name}`,
                        }),
                      },
                    });
                  }}
                />
                <h6>{capitalizeWithHyphens(data.name)}</h6>
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
            data.name
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
      </Row>
      <Row>
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
                          {speciesData.gender_rate === -1
                            ? "Genderless"
                            : `${(speciesData.gender_rate / 8) * 100}% Male, ${
                                ((8 - speciesData.gender_rate) / 8) * 100
                              }% Female`}
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
                          {speciesData.egg_groups
                            .map((group) =>
                              capitalizeWithoutHyphens(group.name)
                            )
                            .join(", ")}
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
                            speciesData.habitat?.name || "N/A"
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
                      content: <span>{speciesData.capture_rate || "N/A"}</span>,
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
                      content: <span>{speciesData.base_happiness}</span>,
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
                        <span>
                          {capitalizeWithHyphens(
                            speciesData.growth_rate?.name || "N/A"
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
      </Row>
      <Row>
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
                        <span>{speciesData.is_baby ? "Yes" : "No"}</span>
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
                        <span>{speciesData.is_mythical ? "Yes" : "No"}</span>
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
                        <span>{speciesData.is_legendary ? "Yes" : "No"}</span>
                      ),
                    },
                  ],
                },
              ],
            }}
            wrapperClassName="w-100"
          />
        </Col>
        <Col xs={12}>
          <div className="d-flex w-100">
            <h3 className="section-header">Forms</h3>
          </div>
          <GeneralTable
            tableConfig={{
              bodyRows: [
                {
                  cells: [
                    {
                      isHeader: true,
                      className: "lead",
                      content: "Has Gender Differences",
                    },
                    {
                      className: "lead",
                      content: (
                        <span>
                          {speciesData.has_gender_differences ? "Yes" : "No"}
                        </span>
                      ),
                    },
                  ],
                },
                {
                  cells: [
                    {
                      isHeader: true,
                      content: "Varieties",
                      className: "lead",
                    },
                    {
                      className: "lead",
                      content: (
                        <span>
                          {speciesData.varieties.map((variety, i) => (
                            <p key={variety.pokemon.name}>
                              {`${i + 1}) ${capitalizeWithoutHyphens(
                                variety.pokemon.name
                              )} ${variety.is_default ? "(Default)" : ""}`}
                            </p>
                          ))}
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
      </Row>
      <Row className="mb-3">
        {moveLearnMethods.length === 0 ? (
          <Col xs={12}>
            <h3 className="text-center">**No Moves For This Version**</h3>
          </Col>
        ) : (
          <Col xs={12} className="d-flex flex-column align-items-center">
            <h3 className="section-header text-center">
              {capitalizeWithoutHyphens(data.name)}'s Moves (
              {movesFromGameVersion.length})
            </h3>
            <div className="w-100 d-flex flex-column">
              <h4>Move Learn Method</h4>
              <FormControl
                className="text-primary pokemon-details-select mb-3"
                onChange={(e) => setMoveLearnMethod(e.target.value)}
                value={moveLearnMethod}
                as="select"
              >
                {moveLearnMethods.map((method) => (
                  <option value={method} key={method}>
                    {capitalizeWithoutHyphens(method)}
                  </option>
                ))}
              </FormControl>
            </div>
            <GeneralTable
              wrapperClassName="table-responsive-sm w-100"
              tableClassName=""
              tableConfig={{
                headerRows: [
                  {
                    cells: [
                      {
                        content: <h6>Level</h6>,
                      },
                      {
                        content: <h6>Name</h6>,
                      },
                      {
                        content: <h6>Type</h6>,
                      },
                      {
                        content: <h6>Power</h6>,
                      },
                      {
                        content: <h6>Accuracy</h6>,
                      },
                      {
                        content: <h6></h6>,
                      },
                    ],
                  },
                ],
                bodyRows: [
                  ...movesFromGameVersion.map((move) => {
                    const moveInfo = moves.find((m) => m?.name === move.name);
                    return {
                      className: "align-middle",
                      cells: [
                        {
                          className: "move-table-text lead",
                          content: move.level,
                        },
                        {
                          className: "move-table-text lead",
                          content: capitalizeWithoutHyphens(move.name),
                        },
                        {
                          content: moveInfo ? (
                            <img
                              src={getImageByType(
                                capitalize(moveInfo.type.name || "")
                              )}
                              className="type-stat-icon m-1"
                              onClick={() => {
                                window.scrollTo(0, 0);
                                navigate(`/types/${moveInfo.type.name}`, {
                                  state: {
                                    ...calculateCrumbs(location, {
                                      active: false,
                                      content: capitalizeWithoutHyphens(
                                        moveInfo.type.name
                                      ),
                                      to: `/types/${moveInfo.type.name}`,
                                    }),
                                  },
                                });
                              }}
                            />
                          ) : (
                            "Not Found"
                          ),
                        },
                        {
                          className: "move-table-text lead",
                          content: moveInfo?.power || "N/A",
                        },
                        {
                          className: "move-table-text lead",
                          content: moveInfo?.accuracy || "N/A",
                        },
                        {
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
                    };
                  }),
                ],
              }}
            />
          </Col>
        )}
      </Row>
      <Row>
        <Col xs={12}>
          <h3 className="section-header text-center">Sprites</h3>
        </Col>
        {frontSprites.length > 0 && (
          <Col xs={12}>
            <p className="lead">Front Sprites</p>
          </Col>
        )}
        {frontSprites.map((k) => (
          <Col
            xs={6}
            key={v4()}
            className="d-flex flex-column align-items-center"
          >
            <img
              className="sprite-img"
              src={
                data.sprites[k as keyof typeof data.sprites] as
                  | string
                  | undefined
              }
              alt={capitalizeWithoutCharacter(k, "_")}
            />
            <p>{capitalizeWithoutCharacter(k, "_")}</p>
          </Col>
        ))}
        {backSprites.length > 0 && (
          <Col xs={12}>
            <p className="lead">Back Sprites</p>
          </Col>
        )}
        {backSprites.map((k) => (
          <Col
            xs={6}
            key={v4()}
            className="d-flex flex-column align-items-center"
          >
            <img
              className="sprite-img"
              src={
                data.sprites[k as keyof typeof data.sprites] as
                  | string
                  | undefined
              }
              alt={capitalizeWithoutCharacter(k, "_")}
            />
            <p>{capitalizeWithoutCharacter(k, "_")}</p>
          </Col>
        ))}
        {dreamWorldSprites.length > 0 && (
          <Col xs={12}>
            <p className="lead">Dreamworld Artwork</p>
          </Col>
        )}
        {dreamWorldSprites.map((k) => (
          <Col
            xs={6}
            key={v4()}
            className="d-flex flex-column align-items-center"
          >
            <img
              className="dreamworld-img"
              src={
                data.sprites.other.dream_world[
                  k as keyof typeof data.sprites.other.dream_world
                ] as string | undefined
              }
              alt={capitalizeWithoutCharacter(k, "_")}
            />
            <p>{capitalizeWithoutCharacter(k, "_")}</p>
          </Col>
        ))}
      </Row>
      <Row>
        {!!data.sprites.other["official-artwork"].front_default && (
          <>
            <Col xs={12}>
              <div className="d-flex justify-content-center justify-content-sm-start">
                <p className="lead text-center">Official Artwork</p>
              </div>
            </Col>
            <Col xs={12} sm={6} className="d-flex justify-content-center">
              <img
                className="official-image"
                src={data.sprites.other["official-artwork"].front_default}
                alt={data.name}
              />
            </Col>
          </>
        )}
      </Row>
    </Container>
  );
};

export default PokemonDetails;
