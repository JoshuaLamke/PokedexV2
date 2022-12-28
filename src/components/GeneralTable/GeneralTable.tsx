import React from "react";
import { v4 } from "uuid";

type Cell = {
  isHeader?: boolean;
  content: React.ReactNode;
  className?: string;
  colSpan?: number;
};

type Row = {
  key?: string;
  className?: string;
  cells: Cell[];
};

interface Props {
  tableConfig: {
    headerRows?: Row[];
    bodyRows?: Row[];
    headClassName?: string;
    bodyClassName?: string;
  };
  wrapperClassName?: string;
  tableClassName?: string;
}

const GeneralTable = ({
  tableConfig,
  wrapperClassName,
  tableClassName,
}: Props) => {
  return (
    <div className={wrapperClassName || ""}>
      <table className={`table ${tableClassName || ""}`}>
        {tableConfig.headerRows && (
          <thead className={tableConfig.headClassName || ""}>
            {tableConfig.headerRows.map((row) => (
              <tr className={row.className || ""} key={v4()}>
                {row.cells.map((cell) => {
                  if (cell.isHeader) {
                    return (
                      <th
                        className={cell.className || ""}
                        colSpan={cell.colSpan === undefined ? 1 : cell.colSpan}
                        key={v4()}
                      >
                        {cell.content}
                      </th>
                    );
                  } else {
                    return (
                      <td
                        className={cell.className || ""}
                        colSpan={cell.colSpan === undefined ? 1 : cell.colSpan}
                        key={v4()}
                      >
                        {cell.content}
                      </td>
                    );
                  }
                })}
              </tr>
            ))}
          </thead>
        )}
        {tableConfig.bodyRows && (
          <tbody className={tableConfig.bodyClassName || ""}>
            {tableConfig.bodyRows.map((row) => (
              <tr className={row.className || ""} key={v4()}>
                {row.cells.map((cell) => {
                  if (cell.isHeader) {
                    return (
                      <th
                        className={cell.className || ""}
                        colSpan={cell.colSpan === undefined ? 1 : cell.colSpan}
                        key={v4()}
                      >
                        {cell.content}
                      </th>
                    );
                  } else {
                    return (
                      <td
                        className={cell.className || ""}
                        colSpan={cell.colSpan === undefined ? 1 : cell.colSpan}
                        key={v4()}
                      >
                        {cell.content}
                      </td>
                    );
                  }
                })}
              </tr>
            ))}
          </tbody>
        )}
      </table>
    </div>
  );
};

export default GeneralTable;
