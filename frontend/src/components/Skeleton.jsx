export function SkeletonStats({ count = 4 }) {
  return (
    <div className="stat-grid" aria-busy="true" aria-label="Loading statistics">
      {Array.from({ length: count }).map((_, i) => (
        <div className="stat skeleton-card" key={i}>
          <div className="skeleton skeleton-line w-40" />
          <div className="skeleton skeleton-num" />
          <div className="skeleton skeleton-line w-60" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="panel skeleton-table" aria-busy="true" aria-label="Loading tickets">
      {Array.from({ length: rows }).map((_, i) => (
        <div className="skeleton-row" key={i}>
          <div className="skeleton skeleton-line w-50" />
          <div className="skeleton skeleton-pill" />
          <div className="skeleton skeleton-pill" />
          <div className="skeleton skeleton-line w-20" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonDetail() {
  return (
    <div className="detail" aria-busy="true" aria-label="Loading ticket details">
      <div className="panel">
        <div className="skeleton skeleton-line w-25" />
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-line w-80" />
        <div className="skeleton skeleton-line w-60" />
      </div>
      <div className="panel">
        <div className="skeleton skeleton-line w-30" />
        <div className="skeleton skeleton-block" />
      </div>
    </div>
  );
}
