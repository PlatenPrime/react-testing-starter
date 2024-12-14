import { Select, Table } from "@radix-ui/themes";
import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import QuantitySelector from "../components/QuantitySelector";
import { Category, Product } from "../entities";
import { useQuery } from "react-query";

function BrowseProducts() {
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => axios.get<Category[]>("/categories").then((res) => res.data),
  });

  const [products, setProducts] = useState<Product[]>([]);

  const [isProductsLoading, setProductsLoading] = useState(false);

  const [errorProducts, setErrorProducts] = useState("");

  const [selectedCategoryId, setSelectedCategoryId] = useState<
    number | undefined
  >();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setProductsLoading(true);
        const { data } = await axios.get<Product[]>("/products");
        setProducts(data);
      } catch (error) {
        if (error instanceof AxiosError) setErrorProducts(error.message);
        else setErrorProducts("An unexpected error occurred");
      } finally {
        setProductsLoading(false);
      }
    };

  
    fetchProducts();
  }, []);

  if (errorProducts) return <div>Error: {errorProducts}</div>;

  const renderCategories = () => {
    if (categoriesQuery.isLoading)
      return (
        <div role="progressbar" aria-label="Loading categories">
          <Skeleton />
        </div>
      );
    if (categoriesQuery.isError) return null;
    return (
      <Select.Root
        onValueChange={(categoryId) =>
          setSelectedCategoryId(parseInt(categoryId))
        }
      >
        <Select.Trigger placeholder="Filter by Category" />
        <Select.Content>
          <Select.Group>
            <Select.Label>Category</Select.Label>
            <Select.Item value="all">All</Select.Item>
            {categoriesQuery.data?.map((category) => (
              <Select.Item key={category.id} value={category.id.toString()}>
                {category.name}
              </Select.Item>
            ))}
          </Select.Group>
        </Select.Content>
      </Select.Root>
    );
  };

  const renderProducts = () => {
    const skeletons = [1, 2, 3, 4, 5];

    if (errorProducts) return <div>Error: {errorProducts}</div>;

    const visibleProducts = selectedCategoryId
      ? products.filter((p) => p.categoryId === selectedCategoryId)
      : products;

    return (
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Price</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body
          role={isProductsLoading ? "progressbar" : undefined}
          aria-label="Loading products"
        >
          {isProductsLoading &&
            skeletons.map((skeleton) => (
              <Table.Row key={skeleton}>
                <Table.Cell>
                  <Skeleton />
                </Table.Cell>
                <Table.Cell>
                  <Skeleton />
                </Table.Cell>
                <Table.Cell>
                  <Skeleton />
                </Table.Cell>
              </Table.Row>
            ))}
          {!isProductsLoading &&
            visibleProducts.map((product) => (
              <Table.Row key={product.id}>
                <Table.Cell>{product.name}</Table.Cell>
                <Table.Cell>${product.price}</Table.Cell>
                <Table.Cell>
                  <QuantitySelector product={product} />
                </Table.Cell>
              </Table.Row>
            ))}
        </Table.Body>
      </Table.Root>
    );
  };

  return (
    <div>
      <h1>Products</h1>
      <div className="max-w-xs">{renderCategories()}</div>
      {renderProducts()}
    </div>
  );
}

export default BrowseProducts;
