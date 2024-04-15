import "./globals.css";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Filter System",
  description:
    "Simplify the shopping experience and boost customer satisfaction with this intuitive product filtering system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased hydrated">
      <body
        className={cn(
          inter.className,
          "scrollbar-thumb-gray scrollbar-thumb-rounded scrollbar-track-gray-lighter scrollbar-w-4 scrolling-touch"
        )}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
