const StatCard = ({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) => {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm text-foreground">
      <div className="text-sm text-muted-foreground mb-1">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
      {sub ? (
        <div className="text-xs text-muted-foreground mt-1">{sub}</div>
      ) : null}
    </div>
  );
};

export default StatCard;
