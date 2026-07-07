export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="flex flex-col items-center gap-8">
        {/* Animated Logo/Icon */}
        <div className="relative w-24 h-24">
          {/* Outer rotating circle */}
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 border-r-cyan-600 dark:border-t-blue-400 dark:border-r-cyan-400 animate-spin"></div>

          {/* Middle rotating circle (opposite direction) */}
          <div
            className="absolute inset-3 rounded-full border-3 border-transparent border-b-blue-500 border-l-cyan-500 dark:border-b-blue-300 dark:border-l-cyan-300 animate-spin"
            style={{ animationDirection: "reverse" }}
          ></div>

          {/* Inner pulse */}
          <div className="absolute inset-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 dark:from-blue-400 dark:to-cyan-400 animate-pulse"></div>

          {/* Center dot */}
          <div className="absolute inset-8 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400"></div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="text-center space-y-3">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            جاري التحميل
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            يرجى الانتظار قليلاً...
          </p>
        </div>

        {/* Animated Loading Bar */}
        <div className="w-64 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 dark:from-blue-400 dark:via-cyan-400 dark:to-blue-400 rounded-full animate-pulse"
            style={{
              animation: "shimmer 2s infinite",
            }}
          ></div>
        </div>

        {/* Floating dots */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-bounce"
              style={{
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0%, 100% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
