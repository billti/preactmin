/// <reference types="mocha" />

// Mocha APIs will be abailable in the global scope
// See https://mochajs.org/ for usage details

import { render, waitFor, fireEvent, screen } from "@testing-library/preact";
import { MyElem } from "../MyElem.js";

describe("Test", () => {
  it("should pass", () => {
    console.log("Test passed");
  });
});

describe("Component", () => {
  it("should render", async () => {
    const { getByText } = render(<MyElem name="Bill" />);
    const button = getByText("Update");
    fireEvent.click(button);
    await waitFor(() => {
      const text = screen.getByText("Hello, Bills");
      if (!text) {
        throw new Error("Text not found");
      } else {
        console.log("Text found");
      }
    });
  });
});

describe("Failure", () => {
  it("should fail", () => {
    throw new Error("Test failed");
  });
});
