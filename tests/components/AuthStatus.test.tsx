import { render, screen } from "@testing-library/react";
import AuthStatus from "../../src/components/AuthStatus";
import { mockAuthState } from "../utils";

describe("AuthStatus", () => {
  it(" should render the loading message while fetching the auth status", () => {
    mockAuthState({
      user: undefined,
      isAuthenticated: false,
      isLoading: true,
    });
    render(<AuthStatus />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it(" should render the login button if the user is not authenticated", () => {
    mockAuthState({
      user: undefined,
      isAuthenticated: false,
      isLoading: false,
    });

    render(<AuthStatus />);

    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /log out/i })).not.toBeInTheDocument();
  });

  it("should render the user name if the user is authenticated", () => {
    mockAuthState({
      user: { name: "Platen" },
      isAuthenticated: true,
      isLoading: false,
    });

    render(<AuthStatus />);

    expect(screen.getByText(/platen/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log out/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /log in/i })).not.toBeInTheDocument();
  });
});
