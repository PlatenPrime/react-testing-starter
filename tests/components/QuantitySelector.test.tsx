import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import QuantitySelector from "../../src/components/QuantitySelector";
import { Product } from "../../src/entities";
import { CartProvider } from "../../src/providers/CartProvider";

describe("QuantitySelector", () => {
  const renderComponent = () => {
    const product: Product = {
      id: 1,
      name: "Product 1",
      price: 10,
      categoryId: 1,
    };

    render(
      <CartProvider>
        <QuantitySelector product={product} />
      </CartProvider>
    );

    return {
      getAddToCartButton: () =>
        screen.queryByRole("button", { name: /add to cart/i }),
      user: userEvent.setup(),
      getQuantityControls: () => ({
        decrementButton: screen.queryByRole("button", { name: "-" }),
        incrementButton: screen.queryByRole("button", { name: "+" }),
        quantity: screen.queryByRole("status"),
      }),
    };
  };

  it("should render the Add to Cart button ", () => {
    const { getAddToCartButton } = renderComponent();

    expect(getAddToCartButton()).toBeInTheDocument();
  });

  it("should add the product to the cart", async () => {
    const { getAddToCartButton, user, getQuantityControls } = renderComponent();

    await user.click(getAddToCartButton()!);

    const { decrementButton, incrementButton, quantity } =
      getQuantityControls();

    expect(quantity).toHaveTextContent("1");
    expect(decrementButton).toBeInTheDocument();
    expect(incrementButton).toBeInTheDocument();
    expect(getAddToCartButton()).not.toBeInTheDocument();
  });

  it("should increment product quantity", async () => {
    const { getAddToCartButton, user, getQuantityControls } = renderComponent();
    await user.click(getAddToCartButton()!);

    const { incrementButton, quantity } = getQuantityControls();

    await user.click(incrementButton!);

    expect(quantity).toHaveTextContent("2");
  });
  it("should decrement product quantity", async () => {
    const { getAddToCartButton, user, getQuantityControls } = renderComponent();
    await user.click(getAddToCartButton()!);
    const { incrementButton, decrementButton, quantity } =
      getQuantityControls();
    await user.click(incrementButton!);

    await user.click(decrementButton!);

    expect(quantity).toHaveTextContent("1");
  });

  it("should remove product out the cart", async () => {
    const { getAddToCartButton, user, getQuantityControls } = renderComponent();
    await user.click(getAddToCartButton()!);
    const { incrementButton, decrementButton, quantity } =
      getQuantityControls();

    await user.click(decrementButton!);

    expect(quantity).not.toBeInTheDocument();
    expect(decrementButton).not.toBeInTheDocument();
    expect(incrementButton).not.toBeInTheDocument();

    screen.debug();

    expect(getAddToCartButton()).toBeInTheDocument();
  });
});
