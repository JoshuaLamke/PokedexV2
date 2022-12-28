import React from "react";
import { Container } from "react-bootstrap";
import PokeApiLogo from "../../assets/pokeapi.png";
import GithubLogo from "../../assets/github.png";
import "./footer.scss";

const Footer = ({}) => {
  return (
    <>
      <hr />
      <Container
        fluid
        className="mx-1 d-flex justify-content-between align-item-center flex-wrap"
      >
        <div className="d-flex align-items-center">
          <p className="m-0 d-flex flex-wrap">
            <a
              href="https://joshua-lamke-portfolio.netlify.app/"
              target="_blank"
              className="lead footer-text text-white me-2 my-2"
            >
              Created By Joshua Lamke,
            </a>
            <a
              href="https://pokeapi.co/"
              target="_blank"
              className="lead footer-text text-white m-0 my-2"
            >
              Powered by:
              <img
                width="100px"
                height="auto"
                alt="pokeapi-logo"
                className="mx-2 pokeapi-img"
                src={PokeApiLogo}
              />
            </a>
          </p>
        </div>
        <div className="d-flex align-items-center">
          <p className="m-0">
            <a
              href="https://github.com/JoshuaLamke"
              target="_blank"
              className="lead footer-text text-white d-flex align-items-center my-2"
            >
              GitHub{" "}
              <img
                width="auto"
                alt="github"
                className="mx-2 github-img"
                src={GithubLogo}
              />
            </a>
          </p>
        </div>
      </Container>
      <hr className="mb-0" />
    </>
  );
};

export default Footer;
