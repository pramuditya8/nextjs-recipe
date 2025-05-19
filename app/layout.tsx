import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/navbar";

export const metadata: Metadata = {
  title: "Recipe App",
  description: "App for sharing recipe",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <html lang="en">
        <body>
          <div className="max-w-md w-full mx-auto">{children}</div>
        </body>
      </html>
    </>
  );
}
