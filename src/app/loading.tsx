export default function Loading() {
  return (
    <div className="container-x flex min-h-[50vh] items-center justify-center py-20">
      <div className="flex items-center gap-3 text-ink-700">
        <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-gold-500" />
        <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-gold-500 [animation-delay:120ms]" />
        <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-gold-500 [animation-delay:240ms]" />
        <span className="ml-2 text-sm">Chargement...</span>
      </div>
    </div>
  );
}
