import React from "react";
import "./Loader.css"; // For additional animations

export default function Loader() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-white to-blue-50 z-50">
      <div className="loader-ring">
        <div className="relative w-16 h-16">
            <div className="absolute top-0 left-0 w-4 h-4 bg-blue-600 rounded-full animate-ping" />
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-blue-400 rounded-full animate-ping delay-150" />
            <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-blue-300 rounded-full animate-pulse -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>
      <p className="mt-6 text-lg font-medium text-gray-700 animate-pulse">Loading graph data...</p>
    </div>
  );
};
