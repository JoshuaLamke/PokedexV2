import { EvoLink, EvolutionDetails, TypeDetails } from "../types";

export const capitalize = (str: string) => {
  return str.substring(0, 1).toUpperCase() + str.substring(1);
};

export const capitalizeWithHyphens = (str: string) => {
  return (
    str
    .split("-")
    .map((word, index, arr) =>
      index === arr.length - 1
        ? capitalize(word)
        : capitalize(word) + "-").join("")
  );
};

export const capitalizeWithoutHyphens = (str: string) => {
  return (
    str
    .split("-")
    .map((word) =>
      capitalize(word)).join(" ")
  );
};

export const capitalizeWithoutCharacter = (str: string, char: string) => {
  return (
    str
    .split(char)
    .map((word) => 
      capitalize(word)).join(" ")
  );
};

//Not for hex colors
export const darken = (color: string) => {
  const arr = color.split(/[()]+/);
  const numbers: number[] = arr[1].split(",").map(v => Number(v));
  const darkerArr = [];
  for (let i = 0; i < 3; i++) {
    if (numbers[i] < 100) {
      darkerArr.push(0);
    } else {
      darkerArr.push(numbers[i] - 100);
    }
  }
  
  return "rgba(" + darkerArr[0] + "," + darkerArr[1] + "," + darkerArr[2] + ")";
};

//Only for hex colors
export const lighten = (color: string) => {
  const arr = color.split(/[()]+/);
  const numbers = arr[1].split(",").map(v => Number(v));
  const lighterArr = [];
  for (let i = 0; i < 3; i++) {
    if (numbers[i] > 235) {
      lighterArr.push(255);
    } else {
      lighterArr.push(numbers[i] + 20);
    }
  }
  
  return "rgba(" + lighterArr[0] + "," + lighterArr[1] + "," + lighterArr[2] + ")";
};

export const regions: Record<string, Array<number>> = {
  "Kanto (1 - 151)": [1, 151],
  "Johto (152 - 251)": [152, 251],
  "Hoenn (252 - 386)": [252, 386],
  "Sinnoh (387 - 494)": [387, 494],
  "Unova (495 - 649)": [495, 649],
  "Kalos (650 - 721)": [650, 721],
  "Alola (722 - 809)": [722, 809],
  "Galar (810 - 898)": [810, 898]
};

export const findEvoInfoFromChain = (evoChain: EvolutionDetails | null | undefined) => {
  if (!evoChain) {
    return {
      names: [],
      evoPath: []
    };
  }

  const chain = evoChain.chain;
  const queue = [chain];
  const names: string[] = [];
  const evoPath: string[][] = [];
  let pathLevel = 0;

  while (queue.length !== 0) {
    let levelSize = queue.length;
    while (levelSize !== 0) {
      const evoDetail = queue.shift() as EvoLink;
      if (evoDetail.evolves_to.length !== 0) {
        queue.push(...evoDetail.evolves_to);
      }
      names.push(evoDetail.species.name);
      if (!evoPath[pathLevel]) {
        evoPath.push([]);
      }
      evoPath[pathLevel].push(evoDetail.species.name);
      levelSize--;
    }    
    pathLevel++;
  }

  return {
    names,
    evoPath
  };
};

export const kgsToLbs = (kgs: number) => {
  return (
    Math.round(kgs * 2.2 * 100) / 100
  );
};

export const mToFeetInches = (m: number) => {
  const feet = Math.floor(m * 3.28);
  const inches = Math.floor(((m * 3.28) - feet) / (1 / 12));
  return `${feet}' ${inches}"`;
};

export const calculateTypeDefAndAttack = (types: TypeDetails[]) => {
  const typeDamageRelations = types.map((typeDetail) => {
    return typeDetail.damage_relations;
  });

  return {
    ...typeDamageRelations.reduce((prev, curr) => {
      return {
        attack: {
          ...prev.attack,
          ...curr.no_damage_to.reduce((p, c) => ({
            ...p,
            [c.name]: prev.attack[c.name] * 0
          }), {}),
          ...curr.half_damage_to.reduce((p, c) => ({
            ...p,
            [c.name]: prev.attack[c.name] / 2
          }), {}),
          ...curr.double_damage_to.reduce((p, c) => ({
            ...p,
            [c.name]: prev.attack[c.name] * 2
          }), {}),
        },
        defense: {
          ...prev.defense,
          ...curr.no_damage_from.reduce((p, c) => ({
            ...p,
            [c.name]: prev.defense[c.name] * 0
          }), {}),
          ...curr.half_damage_from.reduce((p, c) => ({
            ...p,
            [c.name]: prev.defense[c.name] / 2
          }), {}),
          ...curr.double_damage_from.reduce((p, c) => ({
            ...p,
            [c.name]: prev.defense[c.name] * 2
          }), {}),
        }
      };
    }, {
      attack: {
        normal: 1,
        fire: 1,
        water: 1,
        grass: 1,
        electric: 1,
        ice: 1,
        fighting: 1,
        poison: 1,
        ground: 1,
        flying: 1,
        psychic: 1,
        bug: 1,
        rock: 1,
        ghost: 1,
        dark: 1,
        dragon: 1,
        steel: 1,
        fairy: 1,
      },
      defense: {
        normal: 1,
        fire: 1,
        water: 1,
        grass: 1,
        electric: 1,
        ice: 1,
        fighting: 1,
        poison: 1,
        ground: 1,
        flying: 1,
        psychic: 1,
        bug: 1,
        rock: 1,
        ghost: 1,
        dark: 1,
        dragon: 1,
        steel: 1,
        fairy: 1,
      }
    } as {
      attack: Record<string, number>,
      defense: Record<string, number>
    })
  };
};

export const getTypesForMultiplier = (typeStats: Record<string, number>, multiplier: 0 | 0.25 | 0.5 | 1 | 2 | 4) => {
  const typesWithMultiplier = [];
  for (const k in typeStats) {
    if (typeStats[k] === multiplier) {
      typesWithMultiplier.push(k);
    }
  }
  return typesWithMultiplier;
};

export const GAME_VERSIONS = [
  "red-blue",
  "yellow",
  "gold-silver",
  "crystal",
  "ruby-sapphire",
  "emerald",
  "firered-leafgreen",
  "diamond-pearl",
  "platinum",
  "heartgold-soulsilver",
  "black-white",
  "colosseum",
  "xd",
  "black-2-white-2",
  "x-y",
  "omega-ruby-alpha-sapphire",
  "sun-moon",
  "ultra-sun-ultra-moon",
  "lets-go-pikachu-lets-go-eevee",
  "sword-shield",
  "the-isle-of-armor",
  "the-crown-tundra",
  "brilliant-diamond-and-shining-pearl",
  "legends-arceus",
];

export const MOVE_LEARN_METHODS = [
  "level-up",
  "egg",
  "tutor",
  "machine",
  "stadium-surfing-pikachu",
  "light-ball-egg",
  "colosseum-purification",
  "xd-shadow",
  "xd-purification",
  "form-change",
  "zygarde-cube"
];