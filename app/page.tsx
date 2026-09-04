export default function Home() {
  return (
    <main className="min-h-[100dvh] flex items-center justify-center p-8">
      <div className="w-full max-w-[460px] mx-auto text-center">
        <p className="text-muted text-xs tracking-wide mb-6">api.strueller.de</p>
        <h1 className="font-[family-name:var(--font-display)] text-[clamp(2.75rem,11vw,3.5rem)] font-semibold tracking-tight leading-none">
          api-engine
          <span className="text-accent font-normal" aria-hidden="true">
            _
          </span>
        </h1>
        <p className="text-muted text-sm mt-3.5 tracking-wide">
          REST API playground
        </p>
      </div>
    </main>
  );
}
