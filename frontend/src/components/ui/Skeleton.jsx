export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-surface-container-high rounded ${className}`} />;
}

export function SkeletonRow() {
  return (
    <tr className="h-row-height border-b border-border-default">
      <td className="px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-surface-container-high animate-pulse" />
          <div className="h-3 bg-surface-container-high rounded animate-pulse w-32" />
        </div>
      </td>
      <td className="px-6"><div className="h-3 bg-surface-container-high rounded animate-pulse w-24" /></td>
      <td className="px-6"><div className="h-5 bg-surface-container-high rounded-full animate-pulse w-16" /></td>
      <td className="px-6"><div className="h-3 bg-surface-container-high rounded animate-pulse w-20" /></td>
      <td className="px-6"><div className="h-3 bg-surface-container-high rounded animate-pulse w-16" /></td>
      <td className="px-6">
        <div className="flex gap-2 justify-end">
          <div className="w-5 h-5 bg-surface-container-high rounded animate-pulse" />
          <div className="w-5 h-5 bg-surface-container-high rounded animate-pulse" />
        </div>
      </td>
    </tr>
  );
}
