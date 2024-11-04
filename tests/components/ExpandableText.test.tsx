import { render, screen } from "@testing-library/react";
import ExpandableText from "../../src/components/ExpandableText";
import userEvent from "@testing-library/user-event";

describe("group", () => {
  const limit = 255;
  const longText = "a".repeat(300);
  const truncatedText = longText.slice(0, limit) + "...";

  it("should render only text when its shorter or equal to the limit", () => {
    const text = "Short text";

    render(<ExpandableText text={text} />);

    expect(screen.getByText(text)).toBeInTheDocument();
  });

  it("should truncate text when its longer than the limit", () => {
    render(<ExpandableText text={longText} />);

    expect(screen.getByText(truncatedText)).toBeInTheDocument();

    const button = screen.getByRole("button");
    expect(button).toHaveTextContent(/more/i);
  });

  it("should expand text when button Show More is clicked", async () => {
    render(<ExpandableText text={longText} />);

    const button = screen.getByRole("button");
    const user = userEvent.setup();
    await user.click(button);

    expect(screen.getByText(longText)).toBeInTheDocument();
    expect(button).toHaveTextContent(/less/i);
  });

  it("should collapse the text when button Show Less is clicked", async () => {
    render(<ExpandableText text={longText} />);

    const showMoreButton = screen.getByRole("button", { name: /more/i });
    const user = userEvent.setup();
    await user.click(showMoreButton);

    const showLessButton = screen.getByRole("button", { name: /less/i });
    await user.click(showLessButton);

    expect(screen.getByText(truncatedText)).toBeInTheDocument();
    expect(showLessButton).toHaveTextContent(/more/i);
  });
});
