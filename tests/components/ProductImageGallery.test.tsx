import { render, screen } from "@testing-library/react";
import ProductImageGallery from "../../src/components/ProductImageGallery";

describe("ProductImageGallery", () => {
  it("should render nothing when the imageUrls array is empty", () => {
    // my solution
    // render(<ProductImageGallery imageUrls={[]} />);
    // const ulElement = screen.queryByRole("list");
    // expect(ulElement).toBeNull();

    // mosh solution
    const { container } = render(<ProductImageGallery imageUrls={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("should render a list of images", () => {
    const imageUrls = [
      "https://sharik.ua/upload/elements_big-webp/product-detail-1101-0001_m1.webp",
      "https://sharik.ua/upload/elements_big-webp/product-detail-1101-0002_m1.webp",
      "https://sharik.ua/upload/elements_big-webp/product-detail-1101-0003_m1.webp",
    ];

    render(<ProductImageGallery imageUrls={imageUrls} />);

    const images = screen.getAllByRole("img");

    expect(images).toHaveLength(imageUrls.length);

    images.forEach((image, index) => {
      expect(image).toHaveAttribute("src", imageUrls[index]);
    });
  });
});
