import { cn } from '@/lib/utils';

interface CircleProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  textClassName?: string;
  showText?: boolean;
  label?: string;
  labelClassName?: string;
}

export default function CircleProgress({
  value,
  size = 120,
  strokeWidth = 8,
  className,
  textClassName,
  showText = true,
  label,
  labelClassName
}: CircleProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted stroke-[#e6e6e6]"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-primary transition-all duration-500 ease-in-out"
        />
      </svg>
      {showText && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("text-3xl font-bold", textClassName)}>
            {value}
          </span>
          {label && (
            <span className={cn("text-xs mt-1 text-muted-foreground", labelClassName)}>
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
