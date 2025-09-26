import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import ThemeProvider from "@/providers/ThemeProvider";

export const metadata: Metadata = {
  title: "Chat Service",
  description: "Chat application with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <ThemeProvider>
          <Header />
          <main style={{ minHeight: '100vh', backgroundColor: '#fafafa', paddingTop: '64px' }}>
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
