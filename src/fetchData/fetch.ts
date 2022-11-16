import axios from "axios";

export const fetchAllPokemon = async () => {
  const baseUrl = "https://pokeapi.co/api/v2/";
  const response = await axios.get(`${baseUrl}pokemon?limit=100000`);
  return response.data.results;
};

export const fetchPokemon = async (name: string) => {
  const baseUrl = "https://pokeapi.co/api/v2/";
  const response = await axios.get(`${baseUrl}pokemon/${name}`);
  return response.data;
};
