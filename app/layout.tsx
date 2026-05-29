import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import PageTransition from "@/components/PageTransition";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CallSaathi — Real-Time Deepfake Voice Detector",
  description:
    "Is that voice real? CallSaathi monitors phone calls in real-time for AI-generated voices, detecting deepfake audio before scammers can act.",
  keywords: [
    "deepfake detection",
    "voice cloning",
    "scam call detector",
    "AI voice detection",
    "CallSaathi",
    "cybersecurity",
  ],
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎙</text></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }} className="flex flex-col min-h-screen">
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
