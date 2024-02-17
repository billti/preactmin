import "preact/debug"; // TODO: Remove this line from production builds

import { render } from "preact";
import { MyElem } from "./MyElem";
import { Sphere } from "./Sphere";
import { Icosphere } from "./Icosphere";

document.addEventListener("DOMContentLoaded", () =>
  render(<>
    <Icosphere></Icosphere>
    <MyElem name="Bill"></MyElem>
  </>, document.body)
);
