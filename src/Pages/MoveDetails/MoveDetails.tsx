import { useQueries, useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { Col, Container, FormControl, Row } from "react-bootstrap";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { calculateCrumbs } from "../../components/Breadcrumb/Breadcrumbs";
import GeneralTable from "../../components/GeneralTable/GeneralTable";
import PokemonCard from "../../components/PokemonCard/PokemonCard";
import {
  fetchAllPokemon,
  fetchMoveInfo,
  fetchVersionGroupInfo,
} from "../../fetchData/fetch";
import { VersionGroupDetails } from "../../types";
import { typeColors } from "../../utils/typeColors";
import { getImageByType } from "../../utils/typeImages";
import {
  capitalize,
  capitalizeWithHyphens,
  capitalizeWithoutHyphens,
} from "../../utils/utils";
import "./moveDetails.scss";

const MoveDetails = ({}) => {
  const { moveName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [versionGroup, setVersionGroup] = useState<{
    versionGroup: string;
    moveName: string;
  }>({ versionGroup: "None", moveName: moveName || "" });
  const { data: moveData, isLoading: moveIsLoading } = useQuery({
    queryKey: ["move", moveName],
    queryFn: () =>
      fetchMoveInfo(`https://pokeapi.co/api/v2/move/${moveName || ""}`),
    enabled: moveName !== undefined,
  });

  const { data: pokemonData, isLoading: isLoadingPokemonData } = useQuery({
    queryKey: ["pokemon", "general"],
    queryFn: fetchAllPokemon,
    cacheTime: Infinity,
    staleTime: Infinity,
  });

  const versionGroupResults = useQueries({
    queries: (
      moveData?.flavor_text_entries.filter((f) => f.language.name === "en") ||
      []
    ).map((flavorText) => ({
      queryKey: ["version", flavorText.version_group.name],
      queryFn: () => fetchVersionGroupInfo(flavorText.version_group.url),
      cacheTime: Infinity,
      staleTime: Infinity,
      enabled: moveData !== undefined,
    })),
  });

  useEffect(() => {
    if (moveIsLoading || versionGroupResults.some((res) => res.isLoading)) {
      setVersionGroup({
        versionGroup: "None",
        moveName: moveName || "",
      });
      return;
    } else if (versionGroup.versionGroup === "None") {
      const versionGroups = versionGroupResults.map(
        (res) => res.data
      ) as VersionGroupDetails[];
      setVersionGroup({
        versionGroup: versionGroups.sort((a, b) => a.id - b.id)[0]?.name,
        moveName: moveName || "",
      });
    }
  }, [moveIsLoading, moveName, versionGroup, versionGroupResults]);

  if (
    !moveName ||
    moveIsLoading ||
    !moveData ||
    versionGroupResults.some((res) => res.isLoading) ||
    !pokemonData ||
    isLoadingPokemonData
  ) {
    return (
      <div
        className="d-flex flex-column align-items-center justify-content-center"
        style={{ height: "100vh" }}
      >
        <h1 className="text-center text-primary">{`Loading Move ${capitalizeWithHyphens(
          moveName || "Unknown"
        )}...`}</h1>
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

  const versionGroups = versionGroupResults.map(
    (res) => res.data
  ) as VersionGroupDetails[];

  const pokemonMap: Record<string, boolean> =
    moveData.learned_by_pokemon.reduce((prev, curr) => {
      return {
        ...prev,
        [curr.name]: true,
      };
    }, {});

  const pokemonCards = pokemonData
    .filter((pokemon) => pokemonMap[pokemon.name])
    .map((pInfo) => (
      <React.Fragment key={pInfo.name}>
        <Col xs={6} md={4} lg={3} className="pokemon-container-col">
          <PokemonCard pokemonInfo={pInfo} />
        </Col>
      </React.Fragment>
    ));

  return (
    <Container fluid style={{ maxWidth: "80em" }}>
      <Row className="mb-3">
        <Col
          xs={12}
          className="d-flex flex-column align-items-center align-items-lg-start"
        >
          <h4>Game Version</h4>
          <FormControl
            className="text-primary pokemon-details-select"
            onChange={(e) =>
              setVersionGroup({
                versionGroup: e.target.value,
                moveName: moveName,
              })
            }
            value={versionGroup.versionGroup}
            as="select"
          >
            {versionGroups
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
            order: 2,
            span: 6,
          }}
          className="d-flex flex-column align-items-center justify-content-center"
        >
          <img
            src={getImageByType(capitalize(moveData.type.name))}
            alt={capitalize(moveData.type.name)}
            className="my-3 move-type-image"
          />
        </Col>
        <Col
          lg={{
            order: 1,
            span: 6,
          }}
          className="d-flex flex-column align-items-center"
        >
          <h1 id="details-header">{capitalizeWithoutHyphens(moveName)}</h1>
          <div
            className="type-container"
            style={{ background: typeColors[capitalize(moveData.type.name)] }}
            key={moveData.type.name}
            onClick={() => {
              window.scrollTo(0, 0);
              navigate(`/types/${moveData.type.name}`, {
                state: {
                  ...calculateCrumbs(location, {
                    active: false,
                    content: capitalizeWithoutHyphens(moveData.type.name),
                    to: `/types/${moveData.type.name}`,
                  }),
                },
              });
            }}
          >
            <img
              className="type-image"
              src={getImageByType(capitalize(moveData.type.name))}
            />
            <span className="type-text">{capitalize(moveData.type.name)}</span>
          </div>
          <p className="flavor-text mx-2 lead">
            {moveData.flavor_text_entries
              .filter(
                (ft) =>
                  ft.language.name === "en" &&
                  ft.version_group.name === versionGroup.versionGroup
              )?.[0]
              ?.flavor_text.replaceAll(/(\f)|(\n)|(\r)/g, " ")}
          </p>
          <GeneralTable
            wrapperClassName="w-100"
            tableConfig={{
              headerRows: undefined,
              bodyRows: [
                {
                  cells: [
                    {
                      content: "Id",
                      className: "lead",
                    },
                    {
                      content: moveData.id,
                      className: "lead",
                    },
                  ],
                },
                {
                  cells: [
                    {
                      content: "Power",
                      className: "lead",
                    },
                    {
                      content: moveData.power || "N/A",
                      className: "lead",
                    },
                  ],
                },
                {
                  cells: [
                    {
                      content: "Accuracy",
                      className: "lead",
                    },
                    {
                      content: moveData.accuracy || "N/A",
                      className: "lead",
                    },
                  ],
                },
                {
                  cells: [
                    {
                      content: "PP",
                      className: "lead",
                    },
                    {
                      content: moveData.pp || "N/A",
                      className: "lead",
                    },
                  ],
                },
                {
                  cells: [
                    {
                      content: "Target",
                      className: "lead",
                    },
                    {
                      content:
                        capitalizeWithoutHyphens(moveData.target.name) || "N/A",
                      className: "lead",
                    },
                  ],
                },
                {
                  cells: [
                    {
                      content: "Damage Class",
                      className: "lead",
                    },
                    {
                      content: capitalizeWithoutHyphens(
                        moveData.damage_class.name
                      ),
                      className: "lead",
                    },
                  ],
                },
                {
                  cells: [
                    {
                      content: "Generation",
                      className: "lead",
                    },
                    {
                      content: `${capitalize(
                        moveData.generation.name.split("-")[0]
                      )} ${moveData.generation.name
                        .split("-")[1]
                        .toUpperCase()}`,
                      className: "lead",
                    },
                  ],
                },
              ],
            }}
          />
        </Col>
      </Row>
      <Row>
        <Col xs={12} className="d-flex flex-column align-items-center">
          <h3 className="section-header">Contest</h3>
          <GeneralTable
            wrapperClassName="w-100"
            tableClassName=""
            tableConfig={{
              headerRows: undefined,
              bodyRows: [
                {
                  className: "align-middle",
                  cells: [
                    {
                      content: "Contest Type",
                      className: "lead",
                    },
                    {
                      content: capitalizeWithoutHyphens(
                        moveData.contest_type.name
                      ),
                      className: "lead",
                    },
                  ],
                },
                {
                  className: "align-middle",
                  cells: [
                    {
                      content: "Normal Contest Combos(Use Before)",
                      className: "lead",
                    },
                    {
                      content:
                        moveData.contest_combos?.normal?.use_before?.map(
                          (move) => (
                            <p key={move.name}>
                              - {capitalizeWithoutHyphens(move.name)}
                            </p>
                          )
                        ) || "N/A",
                      className: "lead",
                    },
                  ],
                },
                {
                  className: "align-middle",
                  cells: [
                    {
                      content: "Normal Contest Combos(Use After)",
                      className: "lead",
                    },
                    {
                      content:
                        moveData.contest_combos?.normal?.use_after?.map(
                          (move) => (
                            <p key={move.name}>
                              - {capitalizeWithoutHyphens(move.name)}
                            </p>
                          )
                        ) || "N/A",
                      className: "lead",
                    },
                  ],
                },
                {
                  className: "align-middle",
                  cells: [
                    {
                      content: "Super Contest Combos(Use Before)",
                      className: "lead",
                    },
                    {
                      content:
                        moveData.contest_combos?.super?.use_before?.map(
                          (move) => (
                            <p key={move.name}>
                              - {capitalizeWithoutHyphens(move.name)}
                            </p>
                          )
                        ) || "N/A",
                      className: "lead",
                    },
                  ],
                },
                {
                  className: "align-middle",
                  cells: [
                    {
                      content: "Super Contest Combos(Use After)",
                      className: "lead",
                    },
                    {
                      content:
                        moveData.contest_combos?.super?.use_after?.map(
                          (move) => (
                            <p key={move.name}>
                              - {capitalizeWithoutHyphens(move.name)}
                            </p>
                          )
                        ) || "N/A",
                      className: "lead",
                    },
                  ],
                },
              ],
            }}
          />
        </Col>
        <Col xs={12} className="d-flex flex-column align-items-center">
          <h3 className="section-header">Effects</h3>
          <GeneralTable
            tableClassName=""
            wrapperClassName="w-100"
            tableConfig={{
              headerRows: undefined,
              bodyRows: [
                {
                  className: "align-middle",
                  cells: [
                    {
                      content: "Effect",
                      className: "lead",
                    },
                    {
                      content:
                        moveData.effect_entries
                          .filter((e) => e.language.name === "en")?.[0]
                          .effect.replace(
                            /(\$effect_chance)/i,
                            moveData.effect_chance?.toString() || "0"
                          ) || "N/A",
                      className: "lead",
                    },
                  ],
                },
                {
                  className: "align-middle",
                  cells: [
                    {
                      content: "Short Effect",
                      className: "lead",
                    },
                    {
                      content:
                        moveData.effect_entries
                          .filter((e) => e.language.name === "en")?.[0]
                          .short_effect.replace(
                            /(\$effect_chance)/i,
                            moveData.effect_chance?.toString() || "0"
                          ) || "N/A",
                      className: "lead",
                    },
                  ],
                },
                {
                  className: "align-middle",
                  cells: [
                    {
                      content: "Effect Chance",
                      className: "lead",
                    },
                    {
                      content: moveData.effect_chance
                        ? `${moveData.effect_chance}%`
                        : "N/A",
                      className: "lead",
                    },
                  ],
                },
                {
                  className: "align-middle",
                  cells: [
                    {
                      content: "Effect Changes",
                      className: "lead",
                    },
                    {
                      content:
                        moveData.effect_changes
                          ?.filter(
                            (e) =>
                              e?.effect_entries.some(
                                (ef) => ef.language.name === "en"
                              ) &&
                              e?.version_group.name ===
                                versionGroup.versionGroup
                          )?.[0]
                          ?.effect_entries.find((e) => e.language.name === "en")
                          ?.effect || "N/A",
                      className: "lead",
                    },
                  ],
                },
              ],
            }}
          />
        </Col>
      </Row>
      <Row>
        <Col xs={12} className="d-flex flex-column align-items-center">
          <h3 className="section-header">Other Stats</h3>
          <GeneralTable
            tableClassName=""
            wrapperClassName="w-100"
            tableConfig={{
              headerRows: undefined,
              bodyRows: [
                {
                  className: "align-middle",
                  cells: [
                    {
                      content: "Ailment",
                      className: "lead",
                    },
                    {
                      content: capitalizeWithoutHyphens(
                        moveData.meta.ailment.name
                      ),
                      className: "lead",
                    },
                  ],
                },
                {
                  className: "align-middle",
                  cells: [
                    {
                      content: "Ailment Chance",
                      className: "lead",
                    },
                    {
                      content: moveData.meta.ailment_chance
                        ? `${capitalizeWithoutHyphens(
                            moveData.meta.ailment_chance.toString()
                          )}%`
                        : "N/A",
                      className: "lead",
                    },
                  ],
                },
                {
                  className: "align-middle",
                  cells: [
                    {
                      content: "Category",
                      className: "lead",
                    },
                    {
                      content: moveData.meta.category.name
                        .split("+")
                        .map((c) => capitalizeWithoutHyphens(c))
                        .join(", "),
                      className: "lead",
                    },
                  ],
                },
                {
                  className: "align-middle",
                  cells: [
                    {
                      content: "Crit Rate",
                      className: "lead",
                    },
                    {
                      content: moveData.meta.crit_rate || "N/A",
                      className: "lead",
                    },
                  ],
                },
                {
                  className: "align-middle",
                  cells: [
                    {
                      content: "Drain",
                      className: "lead",
                    },
                    {
                      content: moveData.meta.drain || "N/A",
                      className: "lead",
                    },
                  ],
                },
                {
                  className: "align-middle",
                  cells: [
                    {
                      content: "Flinch Chance",
                      className: "lead",
                    },
                    {
                      content: moveData.meta.flinch_chance || "N/A",
                      className: "lead",
                    },
                  ],
                },
                {
                  className: "align-middle",
                  cells: [
                    {
                      content: "Max Hits",
                      className: "lead",
                    },
                    {
                      content: moveData.meta.max_hits || "N/A",
                      className: "lead",
                    },
                  ],
                },
                {
                  className: "align-middle",
                  cells: [
                    {
                      content: "Min Hits",
                      className: "lead",
                    },
                    {
                      content: moveData.meta.min_hits || "N/A",
                      className: "lead",
                    },
                  ],
                },
                {
                  className: "align-middle",
                  cells: [
                    {
                      content: "Max Turns",
                      className: "lead",
                    },
                    {
                      content: moveData.meta.max_turns || "N/A",
                      className: "lead",
                    },
                  ],
                },
                {
                  className: "align-middle",
                  cells: [
                    {
                      content: "Min Turns",
                      className: "lead",
                    },
                    {
                      content: moveData.meta.min_turns || "N/A",
                      className: "lead",
                    },
                  ],
                },
                {
                  className: "align-middle",
                  cells: [
                    {
                      content: "Stat Chance",
                      className: "lead",
                    },
                    {
                      content: moveData.meta.stat_chance || "N/A",
                      className: "lead",
                    },
                  ],
                },
              ],
            }}
          />
        </Col>
      </Row>
      <Row className="g-3 d-flex justify-content-center mb-5">
        <Col xs={12} className="d-flex justify-content-center">
          <h3 className="section-header">
            Learned By Pokemon({pokemonCards.length})
          </h3>
        </Col>
        {pokemonCards}
      </Row>
    </Container>
  );
};

export default MoveDetails;
