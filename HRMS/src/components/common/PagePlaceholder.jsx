const PagePlaceholder = ({
  title,
  description,
}) => {
  return (
    <section className="space-y-3">
      <h1 className="text-2xl font-bold text-gray-900">
        {title}
      </h1>

      <p className="max-w-2xl text-sm text-gray-600">
        {description}
      </p>
    </section>
  );
};

export default PagePlaceholder;
