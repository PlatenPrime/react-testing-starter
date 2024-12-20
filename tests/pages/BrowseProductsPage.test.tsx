import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Category, Product } from "../../src/entities";
import BrowseProducts from "../../src/pages/BrowseProductsPage";
import AllProviders from "../AllProviders";
import { db, getProductsByCategory } from "../mocks/db";
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
    const { selectCategory, expectProductsToBeInTheDocument } =
      renderComponent();

    const selectedCategory = categories[0];
    await selectCategory(selectedCategory.name);

    const products = getProductsByCategory(selectedCategory.id);

    expectProductsToBeInTheDocument(products);
  });

  it("should render all products if All category is selected", async () => {
    const { selectCategory, expectProductsToBeInTheDocument } =
      renderComponent();

    await selectCategory(/all/i);

    const products = db.product.getAll();

    expectProductsToBeInTheDocument(products);
  });
});

function renderComponent() {
  render(<BrowseProducts />, { wrapper: AllProviders });

  const getCategoriesSkeleton = () =>
    screen.getByRole("progressbar", { name: /categories/i });

  const getProductsSkeleton = () =>
    screen.getByRole("progressbar", { name: /products/i });

  const getCategoriesCombobox = () => screen.queryByRole("combobox");

  const selectCategory = async (name: RegExp | string) => {
    await waitForElementToBeRemoved(getCategoriesSkeleton);
    const combobox = getCategoriesCombobox();
    const user = userEvent.setup();
    await user.click(combobox!);

    const option = screen.getByRole("option", { name });
    await user.click(option);
  };

  const expectProductsToBeInTheDocument = (products: Product[]) => {
    const rows = screen.getAllByRole("row");
    const productsRows = rows.slice(1);
    expect(productsRows).toHaveLength(products.length);

    products.forEach((product) => {
      const productItem = screen.getByText(product.name);
      expect(productItem).toBeInTheDocument();
    });
  };

  return {
    getProductsSkeleton,
    getCategoriesSkeleton,
    getCategoriesCombobox,
    selectCategory,
    expectProductsToBeInTheDocument,
  };
}
