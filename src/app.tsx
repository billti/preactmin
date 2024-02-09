import "preact/debug"; // TODO: Remove this line from production builds

import { render } from "preact";
import { MyElem } from "./MyElem";

document.addEventListener("DOMContentLoaded", () =>
  render(<MyElem name="Bill"></MyElem>, document.body)
);
