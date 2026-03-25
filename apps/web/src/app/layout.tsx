import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Fredoka } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "침팬지픽 — 주식/코인 Up/Down 예측 배틀",
  description: "주식·코인·상식 UP/DOWN 예측 배틀! 소수파 보너스로 고득점을 노려보세요.",
  icons: { icon: "/favicon.ico" },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#191919",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${jetbrainsMono.variable} ${fredoka.variable} dark h-full`}
    >
      <body className="min-h-full flex flex-col bg-[var(--bg-primary)] text-[var(--fg-primary)] antialiased">
        {children}
      </body>
    </html>
  );
}
