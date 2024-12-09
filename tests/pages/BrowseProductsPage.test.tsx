import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { server } from "../mocks/server";
import { http, HttpResponse } from "msw";
import BrowseProducts from "../../src/pages/BrowseProductsPage";
import { Theme } from "@radix-ui/themes";
import userEvent from "@testing-library/user-event";
import { db } from "../mocks/db";
import { Category, Product } from "../../src/entities";
import { CartProvider } from "../../src/providers/CartProvider";
import { simulateDalay, simulateError } from "../utils";

describe("BrowseProductsPage", () => {
  const categories: Category[] = [];
  const products: Product[] = [];

  beforeAll(() =>
    [1, 2].forEach(() => {
      const category = db.category.create();
      categories.push(category);

      [1, 2].forEach(() => {
        const product = db.product.create({ categoryId: category.id });
        products.push(product);
      });
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

  const renderComponent = () => {
    render(
      <CartProvider>
        <Theme>
          <BrowseProducts />
        </Theme>
      </CartProvider>
    );

    return {
      getProductsSkeleton: () =>
        screen.getByRole("progressbar", { name: /products/i }),
      getCategoriesSkeleton: () =>
        screen.getByRole("progressbar", { name: /categories/i }),
      getCategoriesCombobox: () => screen.queryByRole("combobox"),
    };
  };

  it("should show a loading skeleton when fetching categories", () => {
    simulateDalay("/categories");

    const { getCategoriesSkeleton } = renderComponent();

    expect(getCategoriesSkeleton()).toBeInTheDocument();
  });

  it("should hide a loading skeleton after categories are fetched", async () => {
    const { getCategoriesSkeleton } = renderComponent();

    await waitForElementToBeRemoved(getCategoriesSkeleton);
  });

  it("should show a loading skeleton when fetching products", () => {
    simulateDalay("/products");

    const { getProductsSkeleton } = renderComponent();

    expect(getProductsSkeleton()).toBeInTheDocument();
  });

  it("should hide a loading skeleton after products are fetched", async () => {
    const { getProductsSkeleton } = renderComponent();

    await waitForElementToBeRemoved(getProductsSkeleton);
  });

  it("should not render an error if categories cannot be fetched", async () => {
    simulateError("/categories");

    const { getCategoriesSkeleton, getCategoriesCombobox } = renderComponent();

    await waitForElementToBeRemoved(getCategoriesSkeleton);

    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    expect(getCategoriesCombobox()).not.toBeInTheDocument();
  });

  it("should render an error if products cannot be fetched", async () => {
    simulateError("/products");

    renderComponent();

    expect(await screen.findByText(/error/i)).toBeInTheDocument();
  });

  it("should render categories", async () => {
    const { getCategoriesSkeleton, getCategoriesCombobox } = renderComponent();

    await waitForElementToBeRemoved(getCategoriesSkeleton);

    const combobox = getCategoriesCombobox();
    expect(combobox).toBeInTheDocument();

    const user = userEvent.setup();

    await user.click(combobox!);

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
    const { getProductsSkeleton } = renderComponent();

    await waitForElementToBeRemoved(getProductsSkeleton);

    products.forEach((product) => {
      const productItem = screen.getByText(product.name);
      expect(productItem).toBeInTheDocument();
    });
  });

  it("should filter products by category", async () => {
    const { getCategoriesSkeleton, getCategoriesCombobox } = renderComponent();

    // Arrange
    await waitForElementToBeRemoved(getCategoriesSkeleton);
    const combobox = getCategoriesCombobox();
    const user = userEvent.setup();
    await user.click(combobox!);

    //Act
    const selectedCategory = categories[0];
    const option = screen.getByRole("option", { name: categories[0].name });
    await user.click(option);

    //Assert
    const products = db.product.findMany({
      where: { categoryId: { equals: selectedCategory.id } },
    });

    const rows = screen.getAllByRole("row");
    const productsRows = rows.slice(1);
    expect(productsRows).toHaveLength(products.length);

    products.forEach((product) => {
      const productItem = screen.getByText(product.name);
      expect(productItem).toBeInTheDocument();
    });
  });

  it("should render all products if All category is selected", async () => {
    const { getCategoriesSkeleton, getCategoriesCombobox } = renderComponent();

    // Arrange
    await waitForElementToBeRemoved(getCategoriesSkeleton);
    const combobox = getCategoriesCombobox();
    const user = userEvent.setup();
    await user.click(combobox!);

    //Act

    const option = screen.getByRole("option", { name: /all/i });
    await user.click(option);

    //Assert
    const products = db.product.getAll();

    const rows = screen.getAllByRole("row");
    const productsRows = rows.slice(1);
    expect(productsRows).toHaveLength(products.length);

    products.forEach((product) => {
      const productItem = screen.getByText(product.name);
      expect(productItem).toBeInTheDocument();
    });
  });
});
