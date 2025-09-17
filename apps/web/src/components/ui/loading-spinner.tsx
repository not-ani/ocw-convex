export function LoadingSpinner({ size = 24 }: { size?: number }) {
  const s = `${size}px`;
  return (
    <div
      style={{
        height: s,
        width: s,
        borderRadius: "9999px",
        borderBottomWidth: 2,
      }}
      className="animate-spin rounded-full border-b-2 border-primary"
      aria-hidden
    />
  );
}
