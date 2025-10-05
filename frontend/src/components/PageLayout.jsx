function PageLayout({ 
  title, 
  subtitle, 
  children, 
  headerActions 
}) {
  return (
    <div className="min-h-screen bg-dark-950 text-white">
      <div className="max-w-[1600px] mx-auto px-8 py-10 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-light-200 bg-clip-text text-transparent">
              {title}
            </h1>
            {subtitle && (
              <p className="text-light-300 text-lg">{subtitle}</p>
            )}
          </div>
          
          {headerActions && (
            <div className="flex gap-4">
              {headerActions}
            </div>
          )}
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  );
}

export default PageLayout;
