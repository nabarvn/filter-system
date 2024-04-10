"use client";

import { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// helps to keep track of api response data
const client = new QueryClient();

const Providers = ({ children }: PropsWithChildren) => {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

export default Providers;
