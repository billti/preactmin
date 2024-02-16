import "preact/debug"; // TODO: Remove this line from production builds

import { render } from "preact";
import { MyElem } from "./MyElem";
import { Sphere } from "./Sphere";

document.addEventListener("DOMContentLoaded", () =>
  render(<>
    <Sphere></Sphere>
    <MyElem name="Bill"></MyElem>
  </>, document.body)
);
