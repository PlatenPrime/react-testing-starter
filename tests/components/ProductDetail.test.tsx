import { render, screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import ProductDetail from "../../src/components/ProductDetail";
import AllProviders from "../AllProviders";
import { db } from "../mocks/db";
import { server } from "../mocks/server";

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

    render(<ProductDetail productId={productId} />, { wrapper: AllProviders });
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
    render(<ProductDetail productId={1234} />, { wrapper: AllProviders });
    expect(await screen.findByText(/not found/i)).toBeInTheDocument();
  });

  it("should render invalid message for invalid product id", async () => {
  
    render(<ProductDetail productId={0} />, { wrapper: AllProviders });

    expect(await screen.findByText(/404/i)).toBeInTheDocument();
  });

  it("should render error message when there is an error", async () => {
    server.use(
      http.get("/products/123", () => {
        return HttpResponse.error();
      })
    );

    render(<ProductDetail productId={123}  />, { wrapper: AllProviders });

    expect(await screen.findByText(/error/i)).toBeInTheDocument();
  });
});
