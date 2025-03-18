import Hero from "./components/Hero";
import MovieRow from "./components/MovieRow";
import Navbar from "./components/Navbar";

export default function App() {
  // Categories with sample movie data
  const categories = [
    {
      title: "Popular on Netflix",
      movies: [
        {
          id: 1,
          title: "Stranger Things",
          imageUrl: "/placeholder.svg?height=169&width=300",
        },
        {
          id: 2,
          title: "The Crown",
          imageUrl: "/placeholder.svg?height=169&width=300",
        },
        {
          id: 3,
          title: "Money Heist",
          imageUrl: "/placeholder.svg?height=169&width=300",
        },
        {
          id: 4,
          title: "Squid Game",
          imageUrl: "/placeholder.svg?height=169&width=300",
        },
        {
          id: 5,
          title: "Wednesday",
          imageUrl: "/placeholder.svg?height=169&width=300",
        },
        {
          id: 6,
          title: "Dark",
          imageUrl: "/placeholder.svg?height=169&width=300",
        },
      ],
    },
    {
      title: "Trending Now",
      movies: [
        {
          id: 7,
          title: "Bridgerton",
          imageUrl: "/placeholder.svg?height=169&width=300",
        },
        {
          id: 8,
          title: "Ozark",
          imageUrl: "/placeholder.svg?height=169&width=300",
        },
        {
          id: 9,
          title: "The Witcher",
          imageUrl: "/placeholder.svg?height=169&width=300",
        },
        {
          id: 10,
          title: "Lupin",
          imageUrl: "/placeholder.svg?height=169&width=300",
        },
        {
          id: 11,
          title: "Queen's Gambit",
          imageUrl: "/placeholder.svg?height=169&width=300",
        },
        {
          id: 12,
          title: "Narcos",
          imageUrl: "/placeholder.svg?height=169&width=300",
        },
      ],
    },
    {
      title: "Watch Again",
      movies: [
        {
          id: 13,
          title: "Breaking Bad",
          imageUrl: "/placeholder.svg?height=169&width=300",
        },
        {
          id: 14,
          title: "Peaky Blinders",
          imageUrl: "/placeholder.svg?height=169&width=300",
        },
        {
          id: 15,
          title: "Black Mirror",
          imageUrl: "/placeholder.svg?height=169&width=300",
        },
        {
          id: 16,
          title: "The Last Kingdom",
          imageUrl: "/placeholder.svg?height=169&width=300",
        },
        {
          id: 17,
          title: "Better Call Saul",
          imageUrl: "/placeholder.svg?height=169&width=300",
        },
        {
          id: 18,
          title: "Mindhunter",
          imageUrl: "/placeholder.svg?height=169&width=300",
        },
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <Hero />
      <div className="mt-[-100px] md:mt-[-150px] relative z-10 pb-10">
        {categories.map((category) => (
          <MovieRow
            key={category.title}
            title={category.title}
            movies={category.movies}
          />
        ))}
      </div>
    </main>
  );
}
