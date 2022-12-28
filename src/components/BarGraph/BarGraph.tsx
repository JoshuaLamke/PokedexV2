import React from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import "./barGraph.scss";

interface Props {
  graphConfig: {
    title?: string;
    bars: {
      color: string;
      val: number;
      name: string;
    }[];
    min?: number;
    max?: number;
  };
}

const BarGraph = ({
  graphConfig: {
    bars,
    max = Math.max(...bars.map((bar) => bar.val)) + 20,
    title = "",
  },
}: Props) => {
  const statsTotal = bars.reduce((prev, curr) => prev + curr.val, 0);
  return (
    <div className="d-flex flex-column">
      <h3 className="text-center section-header">{title}</h3>
      <table className="table table-borderless stats-table">
        <tbody>
          {bars.map((bar) => (
            <tr key={bar.name}>
              <th style={{ whiteSpace: "nowrap" }}>{bar.name}</th>
              <OverlayTrigger
                placement="top"
                delay={{ show: 0, hide: 0 }}
                overlay={(props) => (
                  <Tooltip {...props}>
                    <h6>{bar.name}</h6>
                    <div className="d-flex align-items-center">
                      <div
                        style={{
                          height: "1em",
                          width: "1em",
                          border: ".5px solid white",
                          backgroundColor: bar.color,
                        }}
                      ></div>
                      <span className="ms-2">
                        Val: <b>{bar.val}</b>
                      </span>
                    </div>
                  </Tooltip>
                )}
              >
                <td style={{ verticalAlign: "middle", width: "100%" }}>
                  <div
                    style={{
                      width: "100%",
                      height: "1em",
                      border: `2px solid ${bar.color}`,
                    }}
                    className="d-flex align-items-center"
                  >
                    <div
                      style={{
                        width: `${(bar.val / max) * 100}%`,
                        height: ".5em",
                        backgroundColor: bar.color,
                      }}
                    ></div>
                  </div>
                </td>
              </OverlayTrigger>
              <td>{bar.val}</td>
            </tr>
          ))}
          <tr>
            <th>Total</th>
            <td></td>
            <td>{statsTotal}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default BarGraph;
