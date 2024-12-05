import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { server } from "../mocks/server";
import { http, delay, HttpResponse } from "msw";
import BrowseProducts from "../../src/pages/BrowseProductsPage";
import { Theme } from "@radix-ui/themes";
import userEvent from "@testing-library/user-event";
import { db } from "../mocks/db";
import { Category, Product } from "../../src/entities";
import { CartProvider } from "../../src/providers/CartProvider";

describe("BrowseProductsPage", () => {
  const categories: Category[] = [];
  const products: Product[] = [];

  beforeAll(() =>
    [1, 2].forEach((item) => {
      const category = db.category.create({name: `Category ${item}`});
      categories.push(category);

      const product = db.product.create();
      products.push(product);
    })
  );

  afterAll(() => {
    const categoryIds = categories.map((c) => c.id);
    db.category.deleteMany({
      where: { id: { in: categoryIds } },
    });

    const productIds = products.map((p) => p.id);
    db.category.deleteMany({
      where: { id: { in: productIds } },
    });
  });

  const renderComponent = () =>
    render(
      <CartProvider>
        <Theme>
          <BrowseProducts />
        </Theme>
      </CartProvider>
    );

  it("should show a loading skeleton when fetching categories", () => {
    server.use(
      http.get("/categories", async () => {
        await delay();
        return HttpResponse.json([]);
      })
    );

    renderComponent();

    expect(
      screen.getByRole("progressbar", { name: /categories/i })
    ).toBeInTheDocument();
  });

  it("should hide a loading skeleton after categories are fetched", async () => {
    renderComponent();

    await waitForElementToBeRemoved(() =>
      screen.getByRole("progressbar", { name: /categories/i })
    );
  });

  it("should show a loading skeleton when fetching products", () => {
    server.use(
      http.get("/products", async () => {
        await delay();
        return HttpResponse.json([]);
      })
    );

    renderComponent();

    expect(
      screen.getByRole("progressbar", { name: /products/i })
    ).toBeInTheDocument();
  });

  it("should hide a loading skeleton after products are fetched", async () => {
    renderComponent();

    await waitForElementToBeRemoved(() =>
      screen.getByRole("progressbar", { name: /products/i })
    );
  });

  it("should not render an error if categories cannot be fetched", async () => {
    server.use(http.get("/categories", () => HttpResponse.error()));

    renderComponent();

    await waitForElementToBeRemoved(() =>
      screen.getByRole("progressbar", { name: /categories/i })
    );

    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("combobox", { name: /category/i })
    ).not.toBeInTheDocument();
  });

  it("should render an error if products cannot be fetched", async () => {
    server.use(http.get("/products", () => HttpResponse.error()));

    renderComponent();

    expect(await screen.findByText(/error/i)).toBeInTheDocument();
  });

  it("should render categories", async () => {
    renderComponent();

    const combobox = await screen.findByRole("combobox");
    expect(combobox).toBeInTheDocument();

    const user = userEvent.setup();

    await user.click(combobox);

    // const options = await screen.findAllByRole("option");
    // expect(options.length).toBeGreaterThan(0);
    // -------->
    expect(screen.getByRole("option", { name: /all/i })).toBeInTheDocument();
    categories.forEach((category) => {
      const option = screen.getByRole("option", { name: category.name });
      expect(option).toBeInTheDocument();
    });
  });

  it("should render products", async () => {
    renderComponent();

    await waitForElementToBeRemoved(() =>
      screen.getByRole("progressbar", { name: /products/i })
    );

    products.forEach((product) => {
      const productItem = screen.getByText(product.name);
      expect(productItem).toBeInTheDocument();
    });
  });
});
