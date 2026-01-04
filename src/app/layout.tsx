import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/landing/header";
import Footer from "@/components/landing/footer";
import WhatsAppButton from "@/components/landing/whatsapp-button";
import DatabaseInitializer from "@/components/database-initializer";
import StorageMonitor from "@/components/storage-monitor";
import { AuthProvider } from "@/contexts/auth-context";
import { ErrorBoundary } from "@/components/error-boundary";
import "./globals.css";

export const metadata: Metadata = {
  title: "EDGEMAKERS Solutions",
  description: "Pioneering innovative solutions for a competitive edge.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="!scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased bg-background">
        <ErrorBoundary>
          <AuthProvider>
            <DatabaseInitializer />
            <StorageMonitor />
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-grow">{children}</main>
              <Footer />
            </div>
            <WhatsAppButton />
            <Toaster />
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
