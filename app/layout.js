import { League_Spartan, Manrope } from "next/font/google";
import "./globals.css";

const display = League_Spartan({
  variable: "--nf-display",
  subsets: ["latin"],
  weight: "variable",
});

const body = Manrope({
  variable: "--nf-body",
  subsets: ["latin"],
  weight: "variable",
});

export const metadata = {
  title: "Sanket — Creative Developer",
  description: "Immersive websites, WebGL experiences and interactive campaigns.",
};

export const viewport = {
  themeColor: "#000000",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
