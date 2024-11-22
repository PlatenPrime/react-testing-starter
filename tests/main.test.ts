import { Product } from "./../src/entities";
import { it, expect, describe } from "vitest";
import { faker } from "@faker-js/faker";
import { db } from "./mocks/db";

describe("group", () => {
  it("should", () => {
    const product = db.product.create();
    console.log(product);
    console.log(db.product.getAll());
    console.log(db.product.delete({ where: { id: { equals: product.id } } }));
  });
});
