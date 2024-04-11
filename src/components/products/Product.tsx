import type { Product as TProduct } from "@/db";

const Product = ({ product }: { product: TProduct }) => {
  return (
    <div className="group relative">
      <div className="aspect-square w-full overflow-hidden rounded-md bg-gray-200 group-hover:opacity-75 lg:h-80">
        <img
          alt="product image"
          src={product.imageId}
          className="h-full w-full object-cover object-center"
        />
      </div>

      <div className="flex justify-between mt-4">
        <div>
          <h3 className="text-sm text-gray-700">{product.name}</h3>

          <p className="text-sm text-gray-500">
            Size {product.size.toUpperCase()}, {product.color}
          </p>
        </div>

        <p className="text-sm font-medium text-gray-900">{product.price}</p>
      </div>
    </div>
  );
};

export default Product;
