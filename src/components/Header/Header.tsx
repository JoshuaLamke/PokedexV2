import React from "react";
import { Col, Row } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import Breadcrumbs from "../Breadcrumb/Breadcrumbs";
import GeneralSearch from "../GeneralSearch/GeneralSearch";

const Header = ({}) => {
  const location = useLocation();
  return (
    <>
      {location.pathname !== "/" ? (
        <Row className="my-4">
          <Col xs={12} md={5}>
            <Breadcrumbs />
          </Col>
          <Col xs={12} md={7} className="d-flex justify-content-center">
            <GeneralSearch />
          </Col>
        </Row>
      ) : null}
    </>
  );
};

export default Header;
