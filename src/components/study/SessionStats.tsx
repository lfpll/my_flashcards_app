/**
 * SessionStats Component
 * Shows statistics after completing a study session
 */

import { H3, Body } from '../ui/Typography';

export default function SessionStats({ stats }) {
  const { cardsReviewed, duration, averageRating, streak } = stats;

  // Format duration (seconds to minutes:seconds)
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  // Get encouraging message based on performance
  const getEncouragingMessage = () => {
    if (averageRating >= 4.5) {
      return "Outstanding! You're crushing it! 🌟";
    } else if (averageRating >= 4) {
      return "Excellent work! Keep it up! 💪";
    } else if (averageRating >= 3) {
      return "Good progress! You're learning! 📚";
    } else {
      return "Keep practicing! Every review helps! 💡";
    }
  };

  return (
    <div className="bg-theme-card rounded-xl p-6 border border-theme-lighter">
      <H3 className="mb-4 text-center">Session Statistics</H3>
      
      <div className="space-y-4">
        {/* Encouraging message */}
        <div className="text-center py-3 px-4 bg-accent-primary/10 rounded-lg border border-accent-primary/30">
          <Body className="text-accent-light font-medium">
            {getEncouragingMessage()}
          </Body>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Cards reviewed */}
          <div className="text-center p-4 bg-theme-lighter rounded-lg">
            <div className="text-3xl font-bold text-accent-primary mb-1">
              {cardsReviewed}
            </div>
            <div className="text-sm text-theme-textDim">
              Cards Reviewed
            </div>
          </div>

          {/* Time spent */}
          <div className="text-center p-4 bg-theme-lighter rounded-lg">
            <div className="text-3xl font-bold text-info mb-1">
              {formatDuration(duration)}
            </div>
            <div className="text-sm text-theme-textDim">
              Time Spent
            </div>
          </div>

          {/* Average rating */}
          <div className="text-center p-4 bg-theme-lighter rounded-lg">
            <div className="text-3xl font-bold text-success mb-1">
              {averageRating.toFixed(1)}
            </div>
            <div className="text-sm text-theme-textDim">
              Avg Rating
            </div>
          </div>

          {/* Streak */}
          {streak > 0 && (
            <div className="text-center p-4 bg-theme-lighter rounded-lg">
              <div className="text-3xl font-bold text-warning mb-1">
                {streak} 🔥
              </div>
              <div className="text-sm text-theme-textDim">
                Day Streak
              </div>
            </div>
          )}
        </div>

        {/* Performance breakdown */}
        <div className="text-xs text-theme-textDim text-center pt-2">
          Average time per card: {formatDuration(Math.round(duration / cardsReviewed))}
        </div>
      </div>
    </div>
  );
}
