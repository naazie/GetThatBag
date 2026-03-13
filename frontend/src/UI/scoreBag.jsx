// src/UI/scoreBag.jsx
export default function ScoreBadge({ score }) {
  const styles = score >= 80 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                 score >= 60 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                 'bg-rose-500/10 text-rose-400 border-rose-500/20';

  return (
    <div className={`px-3 py-1 rounded-lg border font-mono font-bold text-lg ${styles}`}>
      {score}%
    </div>
  );
}