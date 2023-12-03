import "preact/debug"; // TODO: Remove this line from production builds

import { render } from "preact";
import { useState } from "preact/hooks";

import { Table } from "./table";

const rows = [
  ["Bill", 20, "WA", "Microsoft"],
  ["Joe", 30, "CA", "Apple"],
  ["Dave", 50, "CA", "Facebook"],
];

function MyElem(props: { name: string }) {
  function onRowSelected(rowId: string) {
    // Will fire with an empty string if the row is deselected
    console.log("Row selected: " + rowId);
  }

  function onRowDeleted(rowId: string) {
    const rowIdx = rows.findIndex((row) => row[0] === rowId);
    if (rowIdx >= 0) {
      rows.splice(rowIdx, 1);
    }
  }

  return (
    <>
      <h1>Preact minimal sample</h1>
      <Table
        columnNames={["Name", "Age", "State", "Company"]}
        rows={rows}
        initialColumns={[0, 1, 3]}
        onRowSelected={onRowSelected}
        onRowDeleted={onRowDeleted}
      />
    </>
  );
}

document.addEventListener("DOMContentLoaded", () =>
  render(<MyElem name="Bill"></MyElem>, document.body)
);
