import { Progress } from "./ui/progress";

interface MacroItemProps {
  label: string;
  value: number;
  percentage: number;
  color: string;
}

export const MacroItem: React.FC<MacroItemProps> = ({
  label,
  value,
  percentage,
  color,
}) => (
  <div>
    <div className="flex justify-between items-center mb-1">
      <span className="text-sm font-medium">{label}</span>
      <span className="text-sm font-medium">{value.toFixed(1)}g</span>
    </div>
    <Progress value={percentage} className={`h-2 bg-${color}-100`} />
    <div className="text-xs text-right mt-1">{percentage.toFixed(1)}%</div>
  </div>
);
