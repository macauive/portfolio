interface TechBadgeProps {
  technology: string;
}

export default function TechBadge({ technology }: TechBadgeProps) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-background-subtle text-text-secondary">
      {technology}
    </span>
  );
}
