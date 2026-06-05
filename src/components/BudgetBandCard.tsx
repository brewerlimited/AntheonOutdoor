type BudgetBandCardProps = {
  title: string;
  range: string;
  description: string;
  selected?: boolean;
  onSelect?: () => void;
};

export function BudgetBandCard({
  title,
  range,
  description,
  selected,
  onSelect,
}: BudgetBandCardProps) {
  return (
    <button
      className={`budget-card ${selected ? "selected" : ""}`}
      type="button"
      onClick={onSelect}
    >
      <span>{title}</span>
      <strong>{range}</strong>
      <p>{description}</p>
    </button>
  );
}
