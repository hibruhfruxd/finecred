import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/frontend/providers/ThemeProvider";
import { ToastProvider } from "@/frontend/providers/ToastProvider";
import "@/frontend/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Finance Credibility — Financial responsibility, made visible",
    template: "%s · Finance Credibility",
  },
  description:
    "A synthetic-data demo that makes everyday payment responsibility visible through a transparent, experimental assessment. Not a credit bureau score.",
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#08080A",
};

const themeScript = `
  (function () {
    try {
      var stored = localStorage.getItem('finance-credibility-theme');
      var theme = stored === 'light' || stored === 'dark'
        ? stored
        : 'dark';
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
    } catch (error) {}
  })();
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <ThemeProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
