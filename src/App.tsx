import React from "react";
import Routes from "./Routes";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import "./app.scss";
import { Container } from "react-bootstrap";

const App: React.FC = () => {
  return (
    <>
      <Container fluid>
        <Routes />
        <ReactQueryDevtools />
      </Container>
    </>
  );
};

export default App;
