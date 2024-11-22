import { render, screen } from "@testing-library/react";
import ProductList from "../../src/components/ProductList";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import { db } from "../mocks/db";

describe("ProductList", () => {

const productIds: number[] = [];

  beforeAll(() => {
    [1, 2, 3].forEach(() => {
     const product = db.product.create();
     productIds.push(product.id);
    });
  });

  afterAll(() => {
    db.product.deleteMany({ where: { id: { in: productIds } } });
  });

  it("should render a list of products", async () => {
    render(<ProductList />);

    const listOfItems = await screen.findAllByRole("listitem");
    expect(listOfItems.length).toBeGreaterThan(0);
  });

  it("should render no products available if no product is found", async () => {
    server.use(
      http.get("/products", () => {
        return HttpResponse.json([]);
      })
    );

    render(<ProductList />);
    const message = await screen.findByText(/no products/i);
    expect(message).toBeInTheDocument();
  });
});
