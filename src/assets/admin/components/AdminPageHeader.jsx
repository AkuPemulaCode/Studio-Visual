export default function AdminPageHeader({ title, description, action }) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-extrabold uppercase tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm text-gray-500 leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
