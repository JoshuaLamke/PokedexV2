import React from "react";
import { Breadcrumb } from "react-bootstrap";
import { Link, useLocation, Location } from "react-router-dom";
import { MdOutlineHome } from "react-icons/md";
import { Crumb } from "../../types";
import "./breadcrumb.scss";
import { v4 } from "uuid";

const Breadcrumbs = () => {
  const location = useLocation();

  if (!location.state?.crumbs) return null;

  const items: Crumb[] = location.state?.crumbs;
  return (
    <Breadcrumb
      style={{
        marginLeft: "clamp(0em, 0em + 2vw, 1.5em)",
        color: "var(--bs-primary)",
        fontSize: "1.5em",
      }}
      className="breadcrumb-container text-decoration-none"
    >
      <Breadcrumb.Item
        as={Link}
        active={location.pathname === "/" ? false : true}
        to="/"
        className="crumb"
      >
        <MdOutlineHome style={{ fill: "var(--bs-primary)" }} />
      </Breadcrumb.Item>
      {items.map((c, i) => (
        <Breadcrumb.Item
          as={Link}
          active={true}
          key={v4()}
          to={c.active ? c.to : "#"}
          state={{
            crumbs: items.slice(0, i + 1),
          }}
          className={`text-primary crumb ${c.active ? "" : ".pe-none"}`}
        >
          {c.content}
        </Breadcrumb.Item>
      ))}
    </Breadcrumb>
  );
};

export default Breadcrumbs;

export const calculateCrumbs = (location: Location, crumb: Crumb) => {
  const currentCrumbs: Crumb[] = (location.state?.crumbs || []).map(
    (c: Crumb) => ({
      ...c,
      active: true,
    })
  );

  const slicedCrumbs =
    currentCrumbs.length > 2 ? currentCrumbs.slice(-2) : currentCrumbs;

  // console.log(slicedCrumbs);
  // console.log("currentCrumbs: ", currentCrumbs);

  return {
    crumbs: [
      ...slicedCrumbs,
      {
        ...crumb,
        active: false,
      },
    ],
  };
};

export const removeCrumbs = (location: Location, numberToRemove: number) => {
  const currentCrumbs: Crumb[] = (location.state?.crumbs || []).map(
    (c: Crumb) => ({
      ...c,
      active: true,
    })
  );

  for (let i = 0; i < numberToRemove; i++) {
    currentCrumbs.pop();
  }

  // console.log("currentCrumbs: ", currentCrumbs);

  return currentCrumbs;
};
