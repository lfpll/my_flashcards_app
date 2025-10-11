/**
 * StreakIndicator Component
 * Displays the current study streak in a subtle, centered format
 */

interface StreakIndicatorProps {
  streak: number;
}

export default function StreakIndicator({ streak }: StreakIndicatorProps) {
  if (streak === 0) return null;

  return (
    <div className="flex justify-center mb-12">
      <div className="flex items-center gap-2 text-gray-600">
        <span className="text-2xl">🔥</span>
        <span className="text-base font-medium">{streak} day streak</span>
      </div>
    </div>
  );
}

