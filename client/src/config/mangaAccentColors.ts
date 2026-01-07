export type AccentColor = "red" | "blue" | "green" | "purple" | "orange";

export type AccentColorConfig = {
  title: string;
  gradient: string;
  seeMore: string;
  activeButton: string;
  button: string;
  scrollButton: string;
  glow: string;
  hover: string;
};

export const mangaAccentColors: Record<AccentColor, AccentColorConfig> = {
  red: {
    title: "text-red-500",
    gradient: "from-red-500/20 via-transparent to-transparent",
    seeMore: "text-red-400 hover:text-red-300",
    activeButton: "bg-gradient-to-r from-red-600 to-red-500",
    button: "text-red-400",
    scrollButton: "hover:bg-red-600/30 border-red-500/30",
    glow: "shadow-red-500/50",
    hover: "text-red-400",
  },
  blue: {
    title: "text-blue-500",
    gradient: "from-blue-500/20 via-transparent to-transparent",
    seeMore: "text-blue-400 hover:text-blue-300",
    activeButton: "bg-gradient-to-r from-blue-600 to-blue-500",
    button: "text-blue-400",
    scrollButton: "hover:bg-blue-600/30 border-blue-500/30",
    glow: "shadow-blue-500/50",
    hover: "text-blue-400",
  },
  green: {
    title: "text-green-500",
    gradient: "from-green-500/20 via-transparent to-transparent",
    seeMore: "text-green-400 hover:text-green-300",
    activeButton: "bg-gradient-to-r from-green-600 to-green-500",
    button: "text-green-400",
    scrollButton: "hover:bg-green-600/30 border-green-500/30",
    glow: "shadow-green-500/50",
    hover: "text-green-400",
  },
  purple: {
    title: "text-purple-500",
    gradient: "from-purple-500/20 via-transparent to-transparent",
    seeMore: "text-purple-400 hover:text-purple-300",
    activeButton: "bg-gradient-to-r from-purple-600 to-purple-500",
    button: "text-purple-400",
    scrollButton: "hover:bg-purple-600/30 border-purple-500/30",
    glow: "shadow-purple-500/50",
    hover: "text-purple-400",
  },
  orange: {
    title: "text-orange-500",
    gradient: "from-orange-500/20 via-transparent to-transparent",
    seeMore: "text-orange-400 hover:text-orange-300",
    activeButton: "bg-gradient-to-r from-orange-600 to-orange-500",
    button: "text-orange-400",
    scrollButton: "hover:bg-orange-600/30 border-orange-500/30",
    glow: "shadow-orange-500/50",
    hover: "text-orange-400",
  },
};
