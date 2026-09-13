interface ScoreBarProps {
  score: number
  maxScore?: number
  label?: string
  explanation?: string
  size?: 'sm' | 'md'
}

function scoreColor(ratio: number): string {
  if (ratio >= 0.8) return 'bg-green-500'
  if (ratio >= 0.6) return 'bg-blue-500'
  if (ratio >= 0.4) return 'bg-yellow-500'
  return 'bg-red-400'
}

export function ScoreBar({ score, maxScore = 100, label, explanation, size = 'md' }: ScoreBarProps) {
  const ratio = Math.min(score / maxScore, 1)
  const barHeight = size === 'sm' ? 'h-1.5' : 'h-2'

  return (
    <div className="space-y-1">
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700 font-medium">{label}</span>
          <span className="text-sm font-semibold text-gray-900 tabular-nums">
            {score}
            <span className="text-gray-400 font-normal">/{maxScore}</span>
          </span>
        </div>
      )}
      <div className={`w-full bg-gray-100 rounded-full ${barHeight} overflow-hidden`}>
        <div
          className={`${barHeight} rounded-full score-bar-fill ${scoreColor(ratio)}`}
          style={{ width: `${ratio * 100}%` }}
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={maxScore}
          aria-label={label}
        />
      </div>
      {explanation && <p className="text-xs text-gray-500 leading-relaxed">{explanation}</p>}
    </div>
  )
}

interface OverallScoreProps {
  score: number
}

export function OverallScore({ score }: OverallScoreProps) {
  const color =
    score >= 80
      ? 'text-green-600'
      : score >= 60
      ? 'text-blue-600'
      : score >= 40
      ? 'text-yellow-600'
      : 'text-red-500'

  return (
    <div className="text-center">
      <div className={`text-5xl font-bold tabular-nums ${color}`}>{score}</div>
      <div className="text-sm text-gray-500 mt-1">out of 100</div>
    </div>
  )
}
