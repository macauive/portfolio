import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-6xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">404</h1>
      <h2 className="text-2xl font-medium text-zinc-900 dark:text-zinc-50 mb-4">Page Not Found</h2>
      <p className="text-zinc-600 dark:text-zinc-400 mb-8">
        The page you are looking for does not exist.
      </p>
      <Link
        href="/"
        className="px-4 py-2 rounded-lg bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
      >
        Go Home
      </Link>
    </section>
  );
}
