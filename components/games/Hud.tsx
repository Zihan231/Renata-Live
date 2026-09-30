export default function Hud({ items }: { items: { label: string; value: React.ReactNode; accent?: boolean }[] }) {
  return (
    <div className="mb-4 grid gap-2" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
      {items.map((it) => (
        <div key={it.label} className="glass rounded-2xl px-3 py-2.5 text-center">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">{it.label}</p>
          <p className={`font-display text-xl font-bold tabular-nums sm:text-2xl ${it.accent ? "text-cyan" : ""}`}>{it.value}</p>
        </div>
      ))}
    </div>
  );
}
