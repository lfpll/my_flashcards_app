/**
 * DailyGoalDots Component
 * Simple visual representation of daily progress
 */

interface DailyGoalDotsProps {
  cardsStudiedToday: number;
  dailyGoal: number;
}

export default function DailyGoalDots({ cardsStudiedToday, dailyGoal }: DailyGoalDotsProps) {
  const totalDots = 5;
  const filledDots = Math.min(Math.floor((cardsStudiedToday / dailyGoal) * totalDots), totalDots);

  return (
    <div className="flex flex-col items-center gap-3 mb-8">
      <p className="text-sm text-gray-600">
        Daily goal: {cardsStudiedToday}/{dailyGoal} cards
      </p>
      <div className="flex items-center gap-2">
        {Array.from({ length: totalDots }).map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index < filledDots ? 'bg-emerald-500' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}



















