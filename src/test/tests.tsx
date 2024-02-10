/// <reference types="jasmine" />

// See testing APIs at:
// - https://jasmine.github.io/api/edge/global
// - https://preactjs.com/guide/v10/preact-testing-library

import { render, waitFor, fireEvent, screen } from "@testing-library/preact";
import { MyElem } from "../MyElem.js";

import "./gate.tests.js";

describe("Component", () => {
  it("should update on click", async () => {
    const { getByText } = render(<MyElem name="Bill" />);
    const button = getByText("Update");
    fireEvent.click(button);
    await waitFor(() => {
      const text = screen.getByText("Hello, Bills");
      expect(text).toBeDefined();
    });
  });
});
