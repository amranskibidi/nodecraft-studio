import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "NodeCraft Studio - Game Engine Feature Mapper",
  description: "Visual node mapping tool for game developers and architects",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${jakarta.variable} ${jetbrains.variable} font-sans antialiased bg-[#0f172a] text-slate-100 overflow-hidden select-none`}>
        {children}
      </body>
    </html>
  );
}