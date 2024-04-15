"use client";

import { cn, absoluteUrl } from "@/lib/utils";
import { useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Filter } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/Dropdown";

import axios from "axios";
import { QueryResult } from "@upstash/vector";
import type { Product as TProduct } from "@/db";
import { EmptyState, Product, Skeleton } from "@/components/products";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";

import debounce from "lodash.debounce";
import { Slider } from "@/components/ui/Slider";
import { ProductFilterState } from "@/lib/validators/product-filter";

const SORT_OPTIONS = [
  { name: "None", value: "none" },
  { name: "Price: Low to High", value: "price-asc" },
  { name: "Price: High to Low", value: "price-desc" },
] as const;

const COLOR_FILTER = {
  id: "color",
  name: "Color",
  options: [
    { value: "white", label: "White" },
    { value: "beige", label: "Beige" },
    { value: "blue", label: "Blue" },
    { value: "green", label: "Green" },
    { value: "purple", label: "Purple" },
  ],
} as const;

const SIZE_FILTER = {
  id: "size",
  name: "Size",
  options: [
    { value: "S", label: "S" },
    { value: "M", label: "M" },
    { value: "L", label: "L" },
  ],
} as const;

const PRICE_FILTER = {
  id: "price",
  name: "Price",
  options: [
    { value: [0, 100], label: "Any price" },
    {
      value: [0, 20],
      label: "Under $20",
    },
    {
      value: [0, 40],
      label: "Under $40",
    },
    // custom option defined in JSX
  ],
} as const;

const SUBCATEGORIES = [
  { name: "T-Shirts", selected: true, href: "#" },
  { name: "Hoodies", selected: false, href: "#" },
  { name: "Sweatshirts", selected: false, href: "#" },
  { name: "Accessories", selected: false, href: "#" },
] as const;

const DEFAULT_CUSTOM_PRICE = [0, 100] as [number, number];

export default function Home() {
  const [filters, setFilters] = useState<ProductFilterState>({
    sort: "none",
    size: ["S", "M", "L"],
    color: ["beige", "blue", "green", "purple", "white"],
    price: { isCustom: false, range: DEFAULT_CUSTOM_PRICE },
  });

  const { data: products, refetch } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await axios.post<QueryResult<TProduct>[]>(
        absoluteUrl("/api/products"),
        {
          filters: {
            sort: filters.sort,
            color: filters.color,
            size: filters.size,
            price: filters.price,
          },
        }
      );

      return data;
    },
  });

  const onSubmit = () => refetch();

  // `useCallback` hook is used to memoize `debounce` function
  // memoized version of the callback function gets recreated only if one of the dependencies has changed
  // dependencies array [] is empty - meaning that the callback will only be created once when the component is initially rendered
  const debouncedSubmit = useCallback(debounce(onSubmit, 400), []);

  // check if the selected element is already in its respective array
  // yes -> remove it
  // no -> add it
  const applyArrayFilter = ({
    category,
    value,
  }: {
    category: keyof Omit<typeof filters, "price" | "sort">;
    value: string;
  }) => {
    // the 'as never' assertion is used to satisfy TypeScript's type checking
    // it assures TypeScript that the 'value' being compared is of the same type as the elements in the array
    // 'filters[category]' accesses the array associated with the specified category within the 'filters' object
    const isFilterApplied = filters[category].includes(value as never);

    if (isFilterApplied) {
      setFilters((prev) => ({
        ...prev,

        // filter method returns a new array excluding the value to be removed
        [category]: prev[category].filter((v) => v !== value),
      }));
    } else {
      setFilters((prev) => ({
        ...prev,

        // spread operator creates a new array with the existing values
        // then new value is added to the array
        [category]: [...prev[category], value],
      }));
    }

    debouncedSubmit();
  };

  const minPrice = Math.min(filters.price.range[0], filters.price.range[1]);
  const maxPrice = Math.max(filters.price.range[0], filters.price.range[1]);

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex items-start md:items-center justify-between border-b border-gray-200 gap-4 pb-6 pt-24">
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-gray-900">
          Premium Cotton Selection
        </h1>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="group inline-flex items-center justify-center text-sm font-medium text-gray-700 hover:text-gray-900 [&[data-state=open]>svg]:rotate-180 p-2">
              Sort
              <ChevronDown className="flex-shrink-0 text-gray-400 group-hover:text-gray-500 transition-transform duration-200 h-4 w-4 ml-1" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.name}
                  className={cn("text-left w-full block text-sm px-4 py-2", {
                    "text-gray-900 bg-gray-100": option.value === filters.sort,
                    "text-gray-500": option.value !== filters.sort,
                  })}
                  onClick={() => {
                    setFilters((prev) => ({
                      ...prev,
                      sort: option.value,
                    }));

                    debouncedSubmit();
                  }}
                >
                  {option.name}
                </button>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <button className="text-gray-400 hover:text-gray-500 lg:hidden -m-2 p-2">
            <Filter className="h-4 w-4" />
          </button>
        </div>
      </div>

      <section className="pb-24 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-x-8 gap-y-10">
          {/* filters */}
          <div className="hidden lg:block">
            <ul className="text-sm font-medium text-gray-900 border-b border-gray-200 space-y-4 pb-6">
              {SUBCATEGORIES.map((category) => (
                <li key={category.name}>
                  <button
                    disabled={!category.selected}
                    className="disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>

            <Accordion type="multiple" className="animate-none">
              {/* color filter */}
              <AccordionItem value="color">
                <AccordionTrigger className="text-sm text-gray-400 hover:text-gray-500 py-3">
                  <span className="font-medium text-gray-900">Color</span>
                </AccordionTrigger>

                <AccordionContent className="animate-none pt-6">
                  <ul className="space-y-4">
                    {COLOR_FILTER.options.map((option, i) => (
                      <li key={i} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`color-${i}`}
                          onChange={() =>
                            applyArrayFilter({
                              category: "color",
                              value: option.value,
                            })
                          }
                          checked={filters.color.includes(option.value)}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />

                        <label
                          htmlFor={`color-${i}`}
                          className="text-sm text-gray-600 ml-3"
                        >
                          {option.label}
                        </label>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              {/* size filter */}
              <AccordionItem value="size">
                <AccordionTrigger className="text-sm text-gray-400 hover:text-gray-500 py-3">
                  <span className="font-medium text-gray-900">Size</span>
                </AccordionTrigger>

                <AccordionContent className="animate-none pt-6">
                  <ul className="space-y-4">
                    {SIZE_FILTER.options.map((option, i) => (
                      <li key={i} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`size-${i}`}
                          onChange={() =>
                            applyArrayFilter({
                              category: "size",
                              value: option.value,
                            })
                          }
                          checked={filters.size.includes(option.value)}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />

                        <label
                          htmlFor={`size-${i}`}
                          className="text-sm text-gray-600 ml-3"
                        >
                          {option.label}
                        </label>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              {/* price filter */}
              <AccordionItem value="price">
                <AccordionTrigger className="text-sm text-gray-400 hover:text-gray-500 py-3">
                  <span className="font-medium text-gray-900">Price</span>
                </AccordionTrigger>

                <AccordionContent className="animate-none pt-6">
                  <ul className="space-y-4">
                    {PRICE_FILTER.options.map((option, i) => (
                      <li key={i} className="flex items-center">
                        <input
                          type="radio"
                          id={`price-${i}`}
                          onChange={() => {
                            setFilters((prev) => ({
                              ...prev,
                              price: {
                                isCustom: false,

                                // cast directly as the expected type since readonly type is incompatible
                                range: option.value as [number, number],
                              },
                            }));

                            debouncedSubmit();
                          }}
                          checked={
                            !filters.price.isCustom &&
                            // lower bound of the price filter range matches the lower bound of the current option value
                            filters.price.range[0] === option.value[0] &&
                            // upper bound of the price filter range matches the upper bound of the current option value
                            filters.price.range[1] === option.value[1]
                          }
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />

                        <label
                          htmlFor={`price-${i}`}
                          className="text-sm text-gray-600 ml-3"
                        >
                          {option.label}
                        </label>
                      </li>
                    ))}

                    <li className="flex flex-col justify-center gap-2">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id={`price-${PRICE_FILTER.options.length}`}
                          onChange={() => {
                            setFilters((prev) => ({
                              ...prev,
                              price: {
                                isCustom: true,
                                range: DEFAULT_CUSTOM_PRICE,
                              },
                            }));

                            debouncedSubmit();
                          }}
                          checked={filters.price.isCustom}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />

                        <label
                          htmlFor={`price-${PRICE_FILTER.options.length}`}
                          className="text-sm text-gray-600 ml-3"
                        >
                          Custom
                        </label>
                      </div>

                      <div
                        className={cn("flex flex-col gap-2 w-[252px] ml-auto", {
                          "opacity-50": !filters.price.isCustom,
                        })}
                      >
                        <div className="font-medium">
                          $&nbsp;
                          {filters.price.isCustom
                            ? minPrice.toFixed(0)
                            : DEFAULT_CUSTOM_PRICE[0].toFixed(0)}
                          &nbsp; - &nbsp;$&nbsp;
                          {filters.price.isCustom
                            ? maxPrice.toFixed(0)
                            : DEFAULT_CUSTOM_PRICE[1].toFixed(0)}
                        </div>

                        <Slider
                          step={5}
                          min={DEFAULT_CUSTOM_PRICE[0]}
                          max={DEFAULT_CUSTOM_PRICE[1]}
                          defaultValue={DEFAULT_CUSTOM_PRICE}
                          disabled={!filters.price.isCustom}
                          value={
                            filters.price.isCustom
                              ? filters.price.range
                              : DEFAULT_CUSTOM_PRICE
                          }
                          onValueChange={(range) => {
                            const [currMin, currMax] = range;

                            setFilters((prev) => ({
                              ...prev,
                              price: {
                                isCustom: true,
                                range: [currMin, currMax],
                              },
                            }));

                            debouncedSubmit();
                          }}
                        />
                      </div>
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* product grid */}
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:col-span-3 gap-8">
            {products && products.length === 0 ? (
              <EmptyState />
            ) : products ? (
              products?.map((product, i) => (
                <Product key={i} product={product.metadata as TProduct} />
              ))
            ) : (
              new Array(12).fill(null).map((_, i) => <Skeleton key={i} />)
            )}
          </ul>
        </div>
      </section>
    </main>
  );
}
