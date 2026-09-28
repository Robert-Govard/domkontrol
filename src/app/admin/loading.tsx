export default function AdminLoading() {
  return (
    <div className="animate-pulse space-y-10" aria-busy="true" aria-label="Загрузка">
      <div className="space-y-5">
        <div className="h-10 w-64 rounded-xl bg-line" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:grid-rows-2">
          <div className="col-span-2 h-72 rounded-3xl bg-ink/90 lg:row-span-2" />
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="card h-36" />
          ))}
        </div>
      </div>
      <div className="h-11 w-full max-w-xl rounded-full bg-line" />
      <div className="card h-96" />
    </div>
  );
}
