import { db } from "@/db";
import { NextRequest } from "next/server";
import { ProductFilterValidator } from "@/lib/validators/product-filter";

class Filter {
  private filters: Map<string, string[]> = new Map();

  hasFilter() {
    return this.filters.size > 0;
  }

  add(key: string, operator: string, value: string | number) {
    const filter = this.filters.get(key) || [];

    filter.push(
      `${key} ${operator} ${typeof value === "number" ? value : `"${value}"`}`
    );

    this.filters.set(key, filter);
  }

  addRaw(key: string, rawFilter: string) {
    this.filters.set(key, [rawFilter]);
  }

  get() {
    const parts: string[] = [];

    this.filters.forEach((filter) => {
      const groupedValues = filter.join(" OR ");
      parts.push(`(${groupedValues})`);
    });

    return parts.join(" AND ");
  }
}

const AVG_PRODUCT_PRICE = 25;
const MAX_PRODUCT_PRICE = 50;

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();

    const {
      sort,
      color,
      size,
      price: { range },
    } = ProductFilterValidator.parse(body.filters);

    const filter = new Filter();

    if (color.length > 0) {
      color.forEach((color) => filter.add("color", "=", color));
    } else if (color.length === 0) {
      filter.addRaw("color", `color = ""`);
    }

    if (size.length > 0) {
      size.forEach((size) => filter.add("size", "=", size));
    } else if (size.length === 0) {
      filter.addRaw("size", `size = ""`);
    }

    filter.addRaw("price", `price >= ${range[0]} AND price <= ${range[1]}`);

    const products = await db.query({
      topK: 12,
      vector: [
        0,
        0,
        sort === "none"
          ? AVG_PRODUCT_PRICE
          : sort === "price-asc"
          ? 0
          : MAX_PRODUCT_PRICE,
      ],
      includeMetadata: true,
      filter: filter.hasFilter() ? filter.get() : undefined,
    });

    return new Response(JSON.stringify(products));
  } catch (err) {
    // i.e., log error to sentry
    console.error(err);

    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
    });
  }
};

{
  /********

Code flow for different combinations of empty, two colors, and three colors in both the color and size arrays, along with random price combinations:


  Example 1: Color and Size arrays are empty

    Initialize an empty filters Map
    filters: {}

    Add raw filter conditions for color and size with empty strings
    filters: { "color": ["color = ""], "size": ["size = ""], "price": ["price >= 20 AND price <= 30"] }

    Perform a database query with the constructed filters produced using get() method


  Example 2: Color array has two colors and Size array is empty

    Initialize an empty filters Map
    filters: {}

    Add filter conditions for each color in the color array
    filters: { "color": ["color = "purple"", "color = "white""] }

    Add raw filter condition for size with an empty string
    filters: { "color": ["color = "purple"", "color = "white""] , "size": ["size = ""], "price": ["price >= 10 AND price <= 40"] }
    
    Perform a database query with the constructed filters produced using get() method


  Example 3: Color array has three colors and Size array has two sizes

    Initialize an empty filters Map
    filters: {}

    Add filter conditions for each color in the color array
    filters: { "color": ["color = "purple"", "color = "white"", "color = "green""] }

    Add filter conditions for each size in the size array
    filters: { "color": ["color = "purple"", "color = "white"", "color = "green""] , "size": ["size = "S"", "size = "M""], "price": ["price >= 5 AND price <= 25"] }
    
    Perform a database query with the constructed filters produced using get() method

  *********/
}
