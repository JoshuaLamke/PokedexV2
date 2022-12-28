import React from "react";
import { Container, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./pageNotFound.scss";

const PageNotFound: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Container
      fluid
      id="page-not-found-container"
      className="d-flex flex-column justify-content-center align-items-center"
    >
      <h3>The page you are looking for does not exist.</h3>
      <Button
        variant="secondary"
        className="my-2"
        onClick={() => {
          window.scrollTo(0, 0);
          navigate("/");
        }}
      >
        Homepage
      </Button>
      <Button
        variant="secondary"
        className="my-2"
        onClick={() => {
          window.scrollTo(0, 0);
          navigate(-1);
        }}
      >
        Previous Page
      </Button>
    </Container>
  );
};

export default PageNotFound;
