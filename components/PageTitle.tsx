import Link from "next/link";

export default function PageTitle({
  eyebrow,
  title,
  subtitle,
  back = "/home",
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
  back?: string;
}) {
  return (
    <div className="mb-8 sm:mb-10">
      <Link href={back} className="mb-6 inline-flex items-center gap-2 text-sm text-white/60 transition hover:text-white">
        <span aria-hidden>←</span> Back
      </Link>
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-cyan">{eyebrow}</p>
      <h1 className="font-display text-3xl font-bold leading-tight sm:text-5xl">{title}</h1>
      {subtitle && <p className="mt-3 max-w-2xl text-white/65 sm:text-lg">{subtitle}</p>}
    </div>
  );
}
