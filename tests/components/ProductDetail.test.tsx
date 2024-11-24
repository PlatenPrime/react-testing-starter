import { render, screen } from "@testing-library/react";
import ProductDetail from "../../src/components/ProductDetail";
import { products } from "../mocks/data";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import { db } from "../mocks/db";

describe("ProductDetail", () => {
  let productId: number;

  beforeAll(() => {
    const product = db.product.create();
    productId = product.id;
  });

  afterAll(() => {
    db.product.delete({ where: { id: { equals: productId } } });
  });

  it("should render product details", async () => {
    const product = db.product.findFirst({
      where: { id: { equals: productId } },
    });

    render(<ProductDetail productId={productId} />);
    expect(
      await screen.findByText(new RegExp(product!.name))
    ).toBeInTheDocument();
    expect(
      await screen.findByText(new RegExp(product!.price.toString()))
    ).toBeInTheDocument();
  });

  it("should render message if product is not found", async () => {
    server.use(
      http.get("/products/1234", () => {
        return HttpResponse.json(null);
      })
    );

    render(<ProductDetail productId={1234} />);
    expect(await screen.findByText(/not found/i)).toBeInTheDocument();
  });

  it("should render error for invalid product id", async () => {
    render(<ProductDetail productId={0} />);

    expect(await screen.findByText(/invalid/i)).toBeInTheDocument();
  });

  it("should render error message when there is an error", async () => {
    server.use(
      http.get("/products/123", () => {
        return HttpResponse.error();
      })
    );

    render(<ProductDetail productId={123} />);

    expect(await screen.findByText(/error/i)).toBeInTheDocument();
  });
});
