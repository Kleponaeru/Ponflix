"use client";

import { useParams } from "react-router-dom";
import MangaDetail from "./MangaDetail";

export default function Chapter() {
  const { id, chapterId } = useParams<{ id: string; chapterId: string }>();

  return (
    <>
      <main className="min-h-screen bg-black text-white pt-16">
        <h1 className="text-2xl font-bold px-6">Chapter: {chapterId}</h1>

        <p className="px-6 text-gray-400 mt-2">Chapter reader will go here.</p>
      </main>
    </>
  );
}
