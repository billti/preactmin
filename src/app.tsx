import "preact/debug"; // TODO: Remove this line from production builds

import { render } from "preact";
import { useState } from "preact/hooks";

import { Table } from "./table";

function MyElem(props: { name: string }) {
  function onRowSelected(rowId: string) {
    // Will fire with an empty string if the row is deselected
    console.log("Row selected: " + rowId);
  }

  return (
    <>
      <h1>Preact minimal sample</h1>
      <Table
        columnNames={["Name", "Age", "State", "Company"]}
        rows={[
          ["Bill", 20, "WA", "Microsoft"],
          ["Joe", 30, "CA", "Apple"],
          ["Dave", 50, "CA", "Facebook"],
        ]}
        initialColumns={[0, 1, 2, 3]}
        onRowSelected={onRowSelected}
      />
    </>
  );
}

document.addEventListener("DOMContentLoaded", () =>
  render(<MyElem name="Bill"></MyElem>, document.body)
);
