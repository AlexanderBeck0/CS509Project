import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Auction House",
  description: "Auction House for our CS 509 project at WPI",
  icons: {
    "icon": "favicon/favicon.ico",
    "apple": "favicon/apple-touch-icon.png",
  },
  manifest: "favicon/site.webmanifest",
  authors: [
    { name: "Alexander Beck", url: "https://github.com/AlexanderBeck0" },
    { name: "Emilia Krum", url: "https://github.com/MurkingtonWizard" },
    { name: "Nate Prickitt", url: "https://github.com/prickittn" },
    { name: "Brent Weiffenbach", url: "https://github.com/BrentWeiffenbach" }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
