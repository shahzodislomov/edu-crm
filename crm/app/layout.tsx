import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EduCRM Portal",
  description: "Advanced Education Management Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
