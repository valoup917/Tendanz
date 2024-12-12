"use client"

import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    document.documentElement.classList.add('dark'); // Forcer le dark mode
  }, []);
  return (
    <div className="bg-background">
    </div>
  );
}
