export default function ProgressBar({ value = 0 }) {
  return (
    <div className="w-full bg-muted/50 rounded-full h-2 overflow-hidden">
      <div
        className="h-2 bg-gradient-to-r from-primary/80 via-green-400 to-emerald-500 transition-all duration-700 ease-in-out"
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  );
}
