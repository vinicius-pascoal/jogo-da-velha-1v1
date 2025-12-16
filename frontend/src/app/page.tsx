"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  function goToLobby() {
    router.push("/lobby");
  }

  return (
    <main className="h-screen flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-2">Jogo da Velha Online</h1>
        <p className="text-gray-600 text-lg">Multiplayer em tempo real</p>
      </div>

      <button
        onClick={goToLobby}
        className="px-8 py-4 bg-black text-white rounded-lg hover:bg-gray-800 transition font-semibold text-lg shadow-lg"
      >
        Entrar no Lobby
      </button>

    </main>
  );
}
