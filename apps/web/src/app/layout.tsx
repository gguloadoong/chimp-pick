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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL ?? "https://chimp-pick.vercel.app"
  ),
  title: "침팬지픽 — 예측 배틀 게임",
  description: "주식·코인 UP/DOWN을 예측하고 바나나코인을 모아라! 🦍",
  icons: { icon: "/favicon.ico" },
  manifest: "/manifest.json",
  openGraph: {
    title: "침팬지픽 — 예측 배틀 게임",
    description: "나도 한 번 맞춰볼까? 주식·코인 UP/DOWN 예측 게임",
    url: "/",
    siteName: "침팬지픽",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "침팬지픽 — 예측 배틀 게임",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "침팬지픽 — 예측 배틀 게임",
    description: "나도 한 번 맞춰볼까?",
    images: ["/og-image.png"],
  },
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
