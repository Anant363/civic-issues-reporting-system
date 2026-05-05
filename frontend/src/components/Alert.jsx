export default function Alert({ type = 'error', message }) {
  if (!message) return null;

  const styles = {
    error: 'bg-red-50 text-red-700 border-red-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
  };

  const icons = {
    error: '⚠️',
    success: '✅',
    info: 'ℹ️',
    warning: '⚡',
  };

  return (
    <div
      className={`flex items-start gap-2 px-4 py-3 rounded-xl border text-sm font-medium animate-fade-in ${styles[type]}`}
    >
      <span>{icons[type]}</span>
      <span>{message}</span>
    </div>
  );
}
