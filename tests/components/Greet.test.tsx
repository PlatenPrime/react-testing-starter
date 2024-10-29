
import { render, screen } from '@testing-library/react'
import Greet from "../../src/components/Greet";


describe("group", () => {
  it(" should render Hello with the name when name is provided", () => {
    render(<Greet name="Platen" />);

    const heading = screen.getByRole("heading");

    expect(heading).toHaveTextContent(/platen/i);
    expect(heading).toBeInTheDocument();
  });
});




describe("group", () => {
    it(" should render button Login if name is not provided", () => {
      render(<Greet  />);
  
      const button = screen.getByRole("button");
  
      expect(button).toHaveTextContent(/login/i);
      expect(button).toBeInTheDocument();
    });
  });
  