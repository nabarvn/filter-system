import { z } from "zod";

const AVAILABLE_SIZES = ["S", "M", "L"] as const;
const AVAILABLE_SORT = ["none", "price-asc", "price-desc"] as const;
const AVAILABLE_COLORS = ["beige", "blue", "green", "purple", "white"] as const;

export const ProductFilterValidator = z.object({
  sort: z.enum(AVAILABLE_SORT),
  size: z.array(z.enum(AVAILABLE_SIZES)),
  color: z.array(z.enum(AVAILABLE_COLORS)),
  price: z.object({
    isCustom: z.boolean(),
    range: z.tuple([z.number(), z.number()]),
  }),
});

export type ProductFilterState = z.infer<typeof ProductFilterValidator>;
