import "preact/debug"; // TODO: Remove this line from production builds

import { render } from "preact";
import { useState } from "preact/hooks";

import { Table } from "./table";

function MyElem(props: { name: string }) {
  const [name, setName] = useState(props.name);
  const onClick = () => setName(name + "s");

  return (
    <>
      <h1>Preact minimal sample</h1>
      <div>{"Hello, " + name}</div>
      <br />
      <button type="button" onClick={onClick}>
        Update
      </button>
      <Table
        columns={["Name", "Age", "State", "Company"]}
        rows={[
          ["Bill", 20, "WA", "Microsoft"],
          ["Joe", 30, "CA", "Apple"],
          ["Dave", 50, "CA", "Facebook"],
        ]}
      />
    </>
  );
}

document.addEventListener("DOMContentLoaded", () =>
  render(<MyElem name="Bill"></MyElem>, document.body)
);
