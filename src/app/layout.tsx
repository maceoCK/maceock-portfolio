import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Maceo Cardinale Kwik | Software Engineer",
  description: "Full Stack Software Engineer based in Brooklyn, NY. Building high-performance systems with TypeScript, Python, Go, and Rust.",
  openGraph: {
    title: "Maceo Cardinale Kwik | Software Engineer",
    description: "Full Stack Software Engineer based in Brooklyn, NY. Building high-performance systems with TypeScript, Python, Go, and Rust.",
    type: "website",
    images: ["/og-image.svg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Maceo Cardinale Kwik | Software Engineer",
    description: "Full Stack Software Engineer based in Brooklyn, NY",
    images: ["/og-image.svg"],
  },
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
