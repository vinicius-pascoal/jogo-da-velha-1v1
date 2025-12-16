"use client";

import { useState, useEffect, useRef } from "react";

interface ShareModalProps {
  gameUrl: string;
  isOpen: boolean;
}

export default function ShareModal({ gameUrl, isOpen }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (gameUrl && isOpen && canvasRef.current) {
      import("qrcode").then((QRCode) => {
        QRCode.toCanvas(
          canvasRef.current!,
          gameUrl,
          {
            width: 200,
            margin: 2,
            color: {
              dark: "#000000",
              light: "#FFFFFF",
            },
          },
          (error) => {
            if (error) console.error("Erro ao gerar QR code:", error);
          }
        );
      });
    }
  }, [gameUrl, isOpen]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(gameUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Erro ao copiar:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 max-w-md w-full mx-4 shadow-2xl border border-gray-200 dark:border-gray-700 animate-slide-up">
        <div className="text-center mb-6">
          <div className="text-4xl sm:text-5xl mb-4 animate-bounce-subtle">⏳</div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900 dark:text-white">
            Aguardando Jogador
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
            Compartilhe o link ou QR code para convidar alguém
          </p>
        </div>

        {/* Link com botão de copiar */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Link da Partida
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={gameUrl}
              readOnly
              className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl text-sm font-mono truncate"
            />
            <button
              onClick={copyToClipboard}
              className={`w-full sm:w-auto px-4 py-3 sm:px-6 rounded-xl font-bold transition-all duration-300 ${copied
                  ? "bg-green-500 text-white"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                }`}
            >
              {copied ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Copiado!
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Copiar
                </span>
              )}
            </button>
          </div>
        </div>

        {/* QR Code */}
        <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 flex flex-col items-center">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Escaneie o QR Code
          </p>
          <div className="bg-white p-2 sm:p-4 rounded-lg">
            <canvas ref={canvasRef} className="max-w-full" />
          </div>
        </div>

        {/* Indicador de espera */}
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span>Aguardando conexão...</span>
        </div>
      </div>
    </div>
  );
}
