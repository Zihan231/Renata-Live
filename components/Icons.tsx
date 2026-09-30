type P = { className?: string };

export const QuizIcon = ({ className }: P) => (
  <svg viewBox="0 0 48 48" className={className} fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8a8 8 0 0 0-8 8v1a7 7 0 0 0-2 12 7 7 0 0 0 5 11 6 6 0 0 0 11 0V12a5 5 0 0 0-6-4Z" />
    <path d="M30 8a8 8 0 0 1 8 8v1a7 7 0 0 1 2 12 7 7 0 0 1-5 11 6 6 0 0 1-11 0" />
    <path d="M24 18h5m-5 10h7m-19-6h5" />
  </svg>
);

export const GameIcon = ({ className }: P) => (
  <svg viewBox="0 0 48 48" className={className} fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 14h18a10 10 0 0 1 9.8 12l-1.6 8a5 5 0 0 1-8.7 2.3L29 32H19l-3.5 4.3A5 5 0 0 1 6.8 34l-1.6-8A10 10 0 0 1 15 14Z" />
    <path d="M15 20v8m-4-4h8" />
    <circle cx="31" cy="21.5" r="1.6" fill="currentColor" />
    <circle cx="35" cy="26" r="1.6" fill="currentColor" />
  </svg>
);

export const CricketIcon = ({ className }: P) => (
  <svg viewBox="0 0 48 48" className={className} fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
    <path d="m8 40 4 4 22-22-4-4Z" />
    <path d="m30 18 8-8m-2-4 6 6" />
    <circle cx="36" cy="36" r="5" />
    <path d="M32.5 32.5c1.5 1 3 3 3.5 5.5" />
  </svg>
);

export const ArrowIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14m-6-6 6 6-6 6" />
  </svg>
);
