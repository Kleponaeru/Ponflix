import React from "react";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function UnderConstruction() {
  const handleBackToDashboard = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-950/20 via-black to-black"></div>

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px),
                         linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      ></div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl w-full text-center space-y-8">
        {/* Icon with glow effect */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-red-600 blur-3xl opacity-30 animate-pulse"></div>
            <AlertCircle
              className="w-24 h-24 text-red-600 relative"
              strokeWidth={1.5}
            />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight">
            Under Construction
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 font-light">
            We're working on something amazing
          </p>
        </div>

        {/* Description */}
        <p className="text-gray-500 text-lg max-w-md mx-auto leading-relaxed">
          This page is currently being built. Check back soon for an incredible
          experience.
        </p>

        {/* Button */}
        <div className="pt-4">
          <button
            onClick={handleBackToDashboard}
            className="group relative inline-flex items-center gap-3 px-6 py-3 bg-white text-black font-semibold text-lg rounded-md overflow-hidden transition-all duration-300 hover:bg-red-600 hover:text-white hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            <span>Back to Dashboard</span>

            {/* Shine effect on hover */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          </button>
        </div>

        {/* Progress indicator */}
        <div className="pt-8 space-y-3">
          <div className="flex justify-center gap-2">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-red-600 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-2 h-2 bg-red-600 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
          <p className="text-gray-600 text-sm">Building your experience...</p>
        </div>
      </div>

      {/* Bottom fade effect */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent"></div>
    </div>
  );
}
