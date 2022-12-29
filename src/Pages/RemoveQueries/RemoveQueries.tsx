import { useQueryClient } from "@tanstack/react-query";
import React from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const RemoveQueries = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return (
    <div
      style={{ height: "70vh" }}
      className="d-flex flex-column justify-content-center align-items-center"
    >
      <Button
        onClick={() => {
          queryClient.removeQueries();
          navigate("/");
        }}
        variant="primary"
      >
        Remove Queries
      </Button>
    </div>
  );
};

export default RemoveQueries;
