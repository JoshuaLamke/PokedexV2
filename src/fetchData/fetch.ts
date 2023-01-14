import { QueryFunctionContext } from "@tanstack/react-query";
import axios from "axios";
import { CardInfo, CustomPokemon, EvolutionDetails, GeneralPokemonInfo, MoveDetails, PokemonInfo, SpeciesDetails, Type, TypeDetails, VersionDetails, VersionGroupDetails } from "../types";

export const fetchAllPokemon = async () => {
  const response = await axios.get<GeneralPokemonInfo[]>("https://gw4p75oxk9.execute-api.us-east-1.amazonaws.com/dev/pokemon/all");
  const data: CardInfo[] = response.data?.map((p) => ({
    ...p,
    types: p.types.map((t: Type) => t.type.name),
    image: p.image_url["official-artwork"].front_default,
    name: p.pk
  }));
  return data.sort((a, b) => a.id - b.id);
};

export const fetchAllCustomPokemon = async () => {
  const response = await axios.get<Record<string, CustomPokemon>>("https://gw4p75oxk9.execute-api.us-east-1.amazonaws.com/dev/custom/all");
  const data = response.data; 
  for (const key in data) {
    data[key].image_url = `https://custom-pokemon-images.s3.amazonaws.com/${key.replace(/ /g, "+")}/${data[key].img.replace(
      / /g,
      "+"
    )}`;
  }
  return response.data;
};

export const fetchTypeInfo = async (typeUrl: string) => {
  const response = await axios.get<TypeDetails>(typeUrl);
  const data = response.data;
  return data;
};

export const fetchMoveInfo = async (moveUrl: string) => {
  const response = await axios.get<MoveDetails>(moveUrl);
  const data = response.data;
  return data;
};

export const fetchVersionInfo = async (versionUrl: string) => {
  const response = await axios.get<VersionDetails>(versionUrl);
  const data = response.data;
  return data;
};

export const fetchVersionGroupInfo = async (versionGroupUrl: string) => {
  const response = await axios.get<VersionGroupDetails>(versionGroupUrl);
  const data = response.data;
  return data;
};

export const fetchIndividualPokemonContext = async ({ queryKey }: QueryFunctionContext) => {
  const response = await axios.get<PokemonInfo>(`https://pokeapi.co/api/v2/pokemon/${queryKey[1]}`);
  const data = response.data;
  return data;
};

export const fetchIndividualPokemonName = async (name: string) => {
  const response = await axios.get<PokemonInfo>(`https://pokeapi.co/api/v2/pokemon/${name}`);
  const data = response.data;
  return data;
};

export const fetchSpeciesDetails = async (speciesUrl: string) => {
  const response = await axios.get<SpeciesDetails>(speciesUrl);
  const data = response.data;
  return data;
};

export const fetchEvolutionDetails = async (evolutionChainUrl: string | null) => {
  if (!evolutionChainUrl) {
    return null;
  }
  try {
    const response = await axios.get<EvolutionDetails>(evolutionChainUrl);
    const data = response.data;
    return data;
  } catch (error) {
    return null;
  }
};