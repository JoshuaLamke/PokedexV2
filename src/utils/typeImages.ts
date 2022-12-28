import Normal from "../assets/Normal.png";
import Water from "../assets/Water.png";
import Fire from "../assets/Fire.png";
import Grass from "../assets/Grass.png";
import Electric from "../assets/Electric.png";
import Ice from "../assets/Ice.png";
import Fighting from "../assets/Fighting.png";
import Poison from "../assets/Poison.png";
import Ground from "../assets/Ground.png";
import Flying from "../assets/Flying.png";
import Psychic from "../assets/Psychic.png";
import Bug from "../assets/Bug.png";
import Rock from "../assets/Rock.png";
import Ghost from "../assets/Ghost.png";
import Dark from "../assets/Dark.png";
import Dragon from "../assets/Dragon.png";
import Steel from "../assets/Steel.png";
import Fairy from "../assets/Fairy.png";

export const getImageByType = (type: string) => {
  switch (type) {
    case "Normal": 
      return Normal;
    case "Fire": 
      return Fire;
    case "Water": 
      return Water;
    case "Grass": 
      return Grass;
    case "Electric": 
      return Electric;
    case "Ice": 
      return Ice;
    case "Fighting": 
      return Fighting;
    case "Poison":
      return Poison;
    case "Ground": 
      return Ground;
    case "Flying": 
      return Flying;
    case "Psychic": 
      return Psychic;
    case "Bug": 
      return Bug;
    case "Rock": 
      return Rock;
    case "Ghost":
      return Ghost;
    case "Dark": 
      return Dark;
    case "Dragon": 
      return Dragon;
    case "Steel": 
      return Steel;
    case "Fairy": 
      return Fairy;
    default:
      return Normal;
  }
};