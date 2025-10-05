function Loader({ size = 'default' }) {
  const sizeClasses = {
    small: 'h-8 w-8 border-2',
    default: 'h-16 w-16 border-4',
    large: 'h-24 w-24 border-4'
  };

  const glowSizes = {
    small: 'h-4 w-4',
    default: 'h-8 w-8',
    large: 'h-12 w-12'
  };

  return (
    <div className="flex items-center justify-center h-full bg-[#0a0a0a] animate-fade-in">
      <div className="relative">
        {/* Spinner principal */}
        <div className={`${sizeClasses[size]} border-gray-800 border-t-amber-500 rounded-full animate-spin`}></div>
        
        {/* Glow central */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`${glowSizes[size]} bg-gradient-to-br from-amber-500 to-orange-600 rounded-full opacity-20 animate-pulse-glow`}></div>
        </div>
      </div>
    </div>
  );
}

export default Loader;