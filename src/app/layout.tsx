import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { GamificationProvider } from "@/context/GamificationContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import AmbientBackground from "@/components/AmbientBackground";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "ExamNova — AI Placement Coach",
  description: "An AI-powered placement preparation platform helping students improve resumes, aptitude, coding, communication, interviews, and placement readiness.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon.png", type: "image/png", sizes: "256x256" },
      { url: "/logo.jpg", type: "image/jpeg" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <body
        className="min-h-screen font-sans bg-transparent"
        style={{ fontFamily: "Inter, system-ui, sans-serif" }}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <ToastProvider>
            <AuthProvider>
              <GamificationProvider>
                <NotificationProvider>
                  <ErrorBoundary>
                    <AmbientBackground />
                    {children}
                  </ErrorBoundary>
                </NotificationProvider>
              </GamificationProvider>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
