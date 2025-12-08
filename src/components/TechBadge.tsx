interface TechBadgeProps {
  technology: string;
}

export default function TechBadge({ technology }: TechBadgeProps) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
      {technology}
    </span>
  );
}
