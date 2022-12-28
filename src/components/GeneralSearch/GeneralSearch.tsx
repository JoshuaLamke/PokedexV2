import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { typeColors } from "../../utils/typeColors";
import { CardInfo } from "../../types";
import { capitalize } from "lodash";
import { getImageByType } from "../../utils/typeImages";
import "./generalSearch.scss";
import { capitalizeWithHyphens } from "../../utils/utils";
import { useLocation, useNavigate } from "react-router-dom";
import { calculateCrumbs } from "../Breadcrumb/Breadcrumbs";
import { fetchAllPokemon } from "../../fetchData/fetch";

const GeneralSearch = ({}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [value, setValue] = useState<string>("");
  const [results, setResults] = useState<
    {
      imgSrc: string;
      name: string;
      number?: number;
      category: "pokemon" | "type";
      route: string;
    }[]
  >([]);
  const { data, isLoading } = useQuery({
    queryKey: ["pokemon", "general"],
    queryFn: fetchAllPokemon,
    cacheTime: Infinity,
    staleTime: Infinity,
  });

  if (!data || isLoading) {
    return null;
  }

  data.sort((a: CardInfo, b: CardInfo) => a.id - b.id);

  const types = Object.keys(typeColors);

  const getFirstFiveResults = (val: string) => {
    const searchVal = val.trim().toLowerCase();
    const matchedPokemon = data.filter((pokemon) =>
      pokemon.name.toLowerCase().includes(searchVal)
    );
    const matchedTypes = types.filter((type) =>
      type.toLowerCase().includes(searchVal)
    );
    const matchedResults = [...matchedPokemon, ...matchedTypes].slice(
      undefined,
      5
    );
    setResults(
      matchedResults.map((result) => {
        if (typeof result === "string") {
          return {
            imgSrc: getImageByType(capitalize(result)),
            name: capitalize(result),
            category: "type",
            route: `/types/${result.toLowerCase()}`,
          };
        }
        return {
          imgSrc:
            result.image ||
            result.image_url.home.front_default ||
            `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${result.id}.png`,
          name: capitalizeWithHyphens(result.name),
          category: "pokemon",
          number: result.id,
          route: `/pokemon/${result.name}`,
        };
      })
    );
  };

  return (
    <div className="d-flex flex-column align-items-center">
      <input
        spellCheck={false}
        type="text"
        id="general-pokemon-search"
        placeholder="Search Pokemon or Type"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          if (e.target.value.trim()) {
            getFirstFiveResults(e.target.value);
          } else {
            setResults([]);
          }
        }}
      />
      <div className="general-search-popover d-flex position-relative d-flex justify-content-center w-100">
        <div className="position-absolute general-search-popover-inner">
          {results.map((result) => (
            <div
              className="d-flex justify-content-between py-4 general-search-container align-items-center"
              key={result.name}
              onClick={() => {
                setValue("");
                setResults([]);
                navigate(result.route, {
                  state: {
                    ...calculateCrumbs(location, {
                      active: false,
                      content: capitalizeWithHyphens(result.name),
                      to: result.route,
                    }),
                  },
                });
              }}
            >
              <div className="d-flex align-items-center">
                <img
                  className="general-search-img me-2"
                  src={result.imgSrc}
                  alt={result.name}
                />
                <span className="general-search-name">{result.name}</span>
              </div>
              <h4 className="m-0">{result.number}</h4>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GeneralSearch;
