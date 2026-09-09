interface ErrorBannerProps {
  message: string;
  onDismiss: () => void;
  variant?: "danger";
}

export function ErrorBanner({ message, onDismiss, variant = "danger" }: ErrorBannerProps) {
  // Only one variant exists today, but kept as a prop (rather than
  // hardcoding danger-soft-* classes directly) so a future "info" or
  // "warning" banner doesn't require reworking this component's shape.
  const variantClass =
    variant === "danger" ? "bg-danger-soft-bg text-danger-soft-text" : "";

  return (
    <div
      className={`mb-4 flex items-center justify-between rounded-[10px] px-4 py-3 text-[13px] font-semibold ${variantClass}`}
    >
      <span>{message}</span>
      <button
        onClick={onDismiss}
        className="cursor-pointer font-bold transition hover:opacity-70"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}