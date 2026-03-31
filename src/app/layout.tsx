import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sanket Chougule | Creative Web Developer & Frontend Engineer",
  description:
    "Creative web developer based in Maharashtra, India. Specializing in frontend development, UI/UX design, React.js, Next.js, GSAP animations, and crafting immersive digital experiences.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
