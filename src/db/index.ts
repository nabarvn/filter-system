import * as dotenv from "dotenv";
import { Index } from "@upstash/vector";

dotenv.config();

export type Product = {
  id: string;
  name: string;
  imageId: string;
  price: number;
  size: "S" | "M" | "L";
  color: "white" | "beige" | "blue" | "green" | "purple";
};

export const db = new Index<Product>();
