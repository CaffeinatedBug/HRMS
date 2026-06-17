const Loader = ({
  label = "Loading",
}) => {
  return (
    <div className="flex min-h-[120px] flex-col items-center justify-center gap-4">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-black" />

      <p className="text-sm font-medium text-gray-600">
        {label}
      </p>
    </div>
  );
};

export default Loader;
