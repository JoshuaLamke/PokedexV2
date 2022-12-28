import React, { useState } from "react";
import { CardInfo } from "../../types";
import defaultImage from "../../assets/sadPokemon.png";
import { getImageByType } from "../../utils/typeImages";
import { capitalize, capitalizeWithHyphens, darken } from "../../utils/utils";
import { typeColors } from "../../utils/typeColors";
import "./pokemonCard.scss";
import { useLocation, useNavigate } from "react-router-dom";
import { calculateCrumbs } from "../Breadcrumb/Breadcrumbs";

interface Props {
  pokemonInfo: CardInfo;
}

const PokemonCard = ({ pokemonInfo }: Props) => {
  const location = useLocation();
  const [imageNotFound, setImageNotFound] = useState<boolean>(false);
  const navigate = useNavigate();
  return (
    <div
      onClick={() => {
        window.scrollTo(0, 0);
        navigate(`/pokemon/${pokemonInfo.name}`, {
          state: calculateCrumbs(location, {
            active: false,
            content: capitalizeWithHyphens(pokemonInfo.name),
            to: `/pokemon/${pokemonInfo.name}`,
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
        <h4>{pokemonInfo.id}</h4>
        <h5>{capitalizeWithHyphens(pokemonInfo.name)}</h5>
        <h6 className={imageNotFound ? "" : "invisible"}>(Image Not Found)</h6>
      </div>
      <div className="d-flex justify-content-center">
        <img
          className="img-fluid card-image"
          alt={pokemonInfo.name}
          src={
            pokemonInfo.image ||
            pokemonInfo.image_url.home.front_default ||
            `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonInfo.id}.png`
          }
          onError={({ currentTarget }) => {
            currentTarget.onerror = null;
            currentTarget.src = defaultImage;
            currentTarget.alt = "No image found.";
            setImageNotFound(true);
          }}
        />
      </div>
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100%" }}
      >
        {pokemonInfo.types.map((type) => {
          return (
            <img
              src={getImageByType(capitalize(type))}
              style={{ boxShadow: `0px 0px 10px white`, borderRadius: "50%" }}
              alt={type}
              height="40px"
              width="40px"
              className="mx-3 my-2"
              key={type}
            />
          );
        })}
      </div>
    </div>
  );
};

export default PokemonCard;
