import React from "react";
import { CustomPokemon } from "../../types";
import { getImageByType } from "../../utils/typeImages";
import { capitalize, capitalizeWithHyphens, darken } from "../../utils/utils";
import { typeColors } from "../../utils/typeColors";
import "./customPokemonCard.scss";
import { useLocation, useNavigate } from "react-router-dom";
import { calculateCrumbs } from "../Breadcrumb/Breadcrumbs";

interface Props {
  pokemonInfo: CustomPokemon;
}

const CustomPokemonCard = ({ pokemonInfo }: Props) => {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <div
      onClick={() => {
        window.scrollTo(0, 0);
        navigate(`/pokemon/custom/${pokemonInfo.pk}`, {
          state: calculateCrumbs(location, {
            active: false,
            content: capitalizeWithHyphens(pokemonInfo.pk),
            to: `/pokemon/custom/${pokemonInfo.pk}`,
          }),
        });
      }}
      className="d-flex flex-column mx-2 rounded h-100 pokemon-card"
      style={{
        border: `1px solid ${darken(
          typeColors[capitalize(pokemonInfo.types[0])]
        )}`,
        background: `${
          pokemonInfo.types.length > 1
            ? `linear-gradient(${
                typeColors[capitalize(pokemonInfo.types[0])]
              },${typeColors[capitalize(pokemonInfo.types[1])]})`
            : `linear-gradient(${
                typeColors[capitalize(pokemonInfo.types[0])]
              }, ${darken(typeColors[capitalize(pokemonInfo.types[0])])})`
        }`,
        boxShadow: `-5px -5px 30px -5px ${
          typeColors[capitalize(pokemonInfo.types[0])]
        }, 5px 5px 30px -5px ${
          typeColors[capitalize(pokemonInfo.types[1] || pokemonInfo.types[0])]
        }`,
      }}
    >
      <div className="text-center">
        <h3>{capitalizeWithHyphens(pokemonInfo.pk)}</h3>
      </div>
      <div className="d-flex justify-content-center">
        <img
          className="img-fluid card-image"
          alt={pokemonInfo.pk}
          src={pokemonInfo.image_url}
        />
      </div>
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100%" }}
      >
        {pokemonInfo.types.map((type) => {
          return (
            <img
              onClick={(e) => {
                window.scrollTo(0, 0);
                e.stopPropagation();
                navigate(`/types/${type}`, {
                  state: calculateCrumbs(location, {
                    active: false,
                    content: capitalize(type),
                    to: `/types/${type}`,
                  }),
                });
              }}
              src={getImageByType(capitalize(type))}
              style={{ boxShadow: `0px 0px 10px white`, borderRadius: "50%" }}
              alt={type}
              height="40px"
              width="40px"
              className="mx-3 my-2 card-type"
              key={type}
            />
          );
        })}
      </div>
    </div>
  );
};

export default CustomPokemonCard;
