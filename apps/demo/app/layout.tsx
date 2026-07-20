import { RootProvider } from "fumadocs-ui/provider/next";
import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";

const figtree = Figtree({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-figtree",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://toast.dominikkrakowiak.com"),
  title: {
    default: "Toast - React toast notifications",
    template: "%s | Toast",
  },
  description: "A modern, layered toast notification system for React.",
  applicationName: "Toast",
  keywords: [
    "React",
    "toast notifications",
    "TypeScript",
    "Tailwind CSS",
    "Framer Motion",
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Toast",
    title: "Toast - React toast notifications",
    description: "A modern, layered toast notification system for React.",
  },
  twitter: {
    card: "summary",
    title: "Toast - React toast notifications",
    description: "A modern, layered toast notification system for React.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${figtree.variable} flex min-h-screen flex-col`}>
        <RootProvider theme={{ defaultTheme: "dark", enableSystem: false }}>
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
