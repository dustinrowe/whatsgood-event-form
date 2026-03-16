import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Submit an Event",
  description: "Submit your event for listing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-white antialiased">{children}</body>
    </html>
  );
}
