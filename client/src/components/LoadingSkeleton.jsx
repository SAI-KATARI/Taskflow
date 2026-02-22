function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Statistics Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-3"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
              </div>
              <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Search Bar Skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 mb-8 border border-gray-100 dark:border-gray-700">
        <div className="flex gap-4">
          <div className="flex-1 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          <div className="w-40 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          <div className="w-40 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        </div>
      </div>

      {/* Kanban Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((col) => (
          <div key={col} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-6"></div>
            <div className="space-y-4">
              {[1, 2].map((card) => (
                <div key={card} className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4">
                  <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LoadingSkeleton;