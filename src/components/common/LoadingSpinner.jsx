export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-gray-200"></div>
        <div className="w-12 h-12 rounded-full border-t-4 border-blue-600 animate-spin absolute top-0 left-0"></div>
      </div>
      <span className="ml-3 text-gray-600">Loading...</span>
    </div>
  );
}
