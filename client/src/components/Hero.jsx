import React from 'react'; 
import { Play, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <div className="relative h-[56.25vw] min-h-[400px] max-h-[80vh]">
      {/* Hero Background Image */}
      <div
        className="absolute top-0 left-0 w-full h-full bg-cover bg-center"
        style={{
          backgroundImage: "url('/placeholder.svg?height=800&width=1600')",
          backgroundPosition: "center 20%",
        }}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/25 to-black"></div>
      </div>

      {/* Content */}
      <div className="absolute bottom-[20%] md:bottom-[30%] left-0 right-0 px-4 md:px-16 flex flex-col gap-4 z-10">
        {/* Title Logo */}
        <div className="w-[70%] md:w-[40%] max-w-[400px]">
          <img
            src="/placeholder.svg?height=150&width=400"
            alt="Featured Title"
            className="w-full"
          />
        </div>

        {/* Description */}
        <div className="text-white max-w-[80%] md:max-w-[50%] lg:max-w-[40%] text-shadow">
          <p className="text-sm md:text-base lg:text-lg">
            When a young boy vanishes, a small town uncovers a mystery involving
            secret experiments, terrifying supernatural forces, and one strange
            little girl.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-2">
          <Button className="flex items-center gap-2 bg-white text-black hover:bg-white/90">
            <Play className="h-5 w-5" />
            <span>Play</span>
          </Button>
          <Button
            variant="secondary"
            className="flex items-center gap-2 bg-gray-500/70 text-white hover:bg-gray-500/50"
          >
            <Info className="h-5 w-5" />
            <span>More Info</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
