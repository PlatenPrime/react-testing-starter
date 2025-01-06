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
      addToCartButton: screen.getByRole("button", { name: /add to cart/i }),
      user: userEvent.setup(),
      getDecrementButton: () => screen.getByRole("button", { name: "-" }),
      getIncrementButton: () => screen.getByRole("button", { name: "+" }),
      getQuantity: () => screen.getByRole("status"),
    };
  };

  it("should render the Add to Cart button ", () => {
    const { addToCartButton } = renderComponent();

    expect(addToCartButton).toBeInTheDocument();
  });

  it("should add the product to the cart", async () => {
    const {
      addToCartButton,
      user,
      getDecrementButton,
      getIncrementButton,
      getQuantity,
    } = renderComponent();

    await user.click(addToCartButton);

    expect(getQuantity()).toHaveTextContent("1");
    expect(getDecrementButton()).toBeInTheDocument();
    expect(getIncrementButton()).toBeInTheDocument();
    expect(addToCartButton).not.toBeInTheDocument();
  });
});
