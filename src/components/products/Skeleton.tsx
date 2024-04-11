const Skeleton = () => {
  return (
    <div className="relative animate-pulse">
      <div className="aspect-square w-full overflow-hidden rounded-md bg-gray-200 lg:h-80">
        <div className="h-full w-full bg-gray-200" />
      </div>

      <div className="flex flex-row justify-between mt-4">
        <div className="flex flex-col gap-2">
          <div className="bg-gray-200 h-4 w-24" />
          <div className="bg-gray-200 h-4 w-24" />
        </div>

        <div className="bg-gray-200 h-4 w-10" />
      </div>
    </div>
  );
};

export default Skeleton;
