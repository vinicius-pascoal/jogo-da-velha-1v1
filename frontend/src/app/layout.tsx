import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jogo da Velha Online",
  description: "Jogo da velha multiplayer em tempo real",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
