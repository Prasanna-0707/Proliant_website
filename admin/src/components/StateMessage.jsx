// Shared loading / error / empty placeholders for data pages.

export function LoadingState({ text = "Loading..." }) {
  return (
    <p className="py-12 text-center text-sm text-gray-500" role="status">
      {text}
    </p>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="py-12 text-center" role="alert">
      <p className="text-sm text-red-600">{message}</p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-lg border border-red-500 px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-500 hover:text-white"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ text }) {
  return <p className="py-12 text-center text-sm text-gray-500">{text}</p>;
}

// Renders the right placeholder, or the children when data is ready.
export default function DataState({ loading, error, onRetry, children }) {
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;

  return children;
}
