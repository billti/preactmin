/// <reference types="jasmine" />

import { render, waitFor, fireEvent, screen } from "@testing-library/preact";
import { MyElem } from "../MyElem.js";

describe("Test", () => {
  it("should pass", () => {
    expect(!false).toBe(true);
  });
});

describe("Component", () => {
  it("should render", async () => {
    const { getByText } = render(<MyElem name="Bill" />);
    const button = getByText("Update");
    fireEvent.click(button);
    await waitFor(() => {
      const text = screen.getByText("Hello, Bills");
      expect(text).toBeDefined();
    });
  });
});
