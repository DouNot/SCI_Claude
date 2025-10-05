function Skeleton({ className = '', count = 1, variant = 'default' }) {
  const variants = {
    default: 'h-4',
    text: 'h-4',
    title: 'h-8',
    card: 'h-64',
    circle: 'rounded-full w-12 h-12'
  };

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-gradient-to-r from-gray-800 via-gray-750 to-gray-800 bg-[length:200%_100%] rounded-lg ${variants[variant]} ${className}`}
          style={{
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite, shimmer 2s linear infinite',
          }}
        />
      ))}
    </>
  );
}

export default Skeleton;