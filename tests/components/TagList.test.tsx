import { render, screen, waitFor } from "@testing-library/react";
import TagList from "../../src/components/TagList";

describe("TagList", () => {
  it("should render tags", async () => {
    render(<TagList />);

    //   await  waitFor(() => {
    //       const listOfItems = screen.getAllByRole("listitem");
    //       expect(listOfItems.length).toBeGreaterThan(0);
    //     });

    const listOfItems = await screen.findAllByRole("listitem");
    expect(listOfItems.length).toBeGreaterThan(0);
  });
});
