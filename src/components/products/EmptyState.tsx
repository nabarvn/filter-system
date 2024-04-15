import { XCircle } from "lucide-react";

const EmptyState = () => {
  return (
    <div className="relative flex flex-col items-center justify-center col-span-full h-80 w-full bg-gray-50 p-12">
      <XCircle className="h-8 w-8 text-red-500" />
      <h3 className="font-semibold text-xl">No Products Found</h3>

      <p className="text-zinc-500 text-sm">
        We found no search results matching the applied filters.
      </p>
    </div>
  );
};

export default EmptyState;
