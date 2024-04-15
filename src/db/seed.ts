import * as dotenv from "dotenv";
import { type Product, db } from ".";

// helps the seeding script read from `.env`
// important for connecting to the database
dotenv.config();

const getRandomPrice = () => {
  const PRICES = [9.99, 19.99, 29.99, 39.99, 49.99];
  return PRICES[Math.floor(Math.random() * PRICES.length)];
};

const SIZES = ["S", "M", "L"] as const;
const COLORS = ["white", "beige", "blue", "green", "purple"] as const;

const seed = async () => {
  const products: Product[] = [];

  // 3 example products
  for (let i = 0; i < 3; i++) {
    // 3 example colors for each product
    for (let j = 0; j < COLORS.length; j++) {
      // 3 example sizes for each product color
      for (let k = 0; k < SIZES.length; k++) {
        const size = SIZES[k];
        const color = COLORS[j];

        products.push({
          id: `${color}-${size}-${i + 1}`,
          name: `${
            color.slice(0, 1).toUpperCase() + color.slice(1)
          } shirt ${i}`,
          imageId: `/${color}_${i + 1}.png`,
          price: getRandomPrice(),
          size,
          color,
        });
      }
    }
  }

  const SIZE_MAP = {
    S: 0,
    M: 1,
    L: 2,
  };

  const COLOR_MAP = {
    white: 0,
    beige: 1,
    blue: 2,
    green: 3,
    purple: 4,
  };

  await db.upsert(
    products.map((product) => ({
      id: product.id,
      vector: [COLOR_MAP[product.color], SIZE_MAP[product.size], product.price],
      metadata: product,
    }))
  );
};

seed();
