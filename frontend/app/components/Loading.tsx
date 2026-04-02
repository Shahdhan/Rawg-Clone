export default function Loading() {
  return (
    <div className="w-full h-screen flex items-center justify-center fixed top-0 left-0 bg-gray-950 z-50">
      <div className="flex items-end gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-2 bg-white rounded-full animate-bounce"
            style={{
              height: "40px",
              animationDelay: `${i * 0.15}s`,
              animationDuration: "0.8s",
            }}
          />
        ))}
      </div>
    </div>
  );
}
