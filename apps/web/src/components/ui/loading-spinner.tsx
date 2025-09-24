export function LoadingSpinner({ size = 24 }: { size?: number }) {
  const s = `${size}px`;
  return (
    <div
      aria-hidden
      className="animate-spin rounded-full border-primary border-b-2"
      style={{
        height: s,
        width: s,
        borderRadius: "9999px",
        borderBottomWidth: 2,
      }}
    />
  );
}
