import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import { SessionProvider } from "@/components/providers/session-provider";
import { ToastProvider } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

// Several pages read live Prisma data and authenticated session state. They
// must render when the application has its runtime database configuration,
// not while a Docker image is being built.
export const dynamic = "force-dynamic";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const sourceSerif = Source_Serif_4({ subsets: ["latin"], variable: "--font-serif", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "GC Career Studio — Career Strategy & Job Search Guidance",
    template: "%s | GC Career Studio",
  },
  description:
    "GC Career Studio helps graduates, working professionals, and career switchers build a structured career strategy, prepare for interviews, and search with a real plan.",
  openGraph: {
    title: "GC Career Studio",
    description:
      "Structured career strategy, resume, and interview preparation for graduates, professionals, and career switchers.",
    type: "website",
  },
  metadataBase: new URL(process.env.AUTH_URL || "http://localhost:3000"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${sourceSerif.variable}`}>
      <body>
        <SessionProvider>
          <ToastProvider>
            {children}
            <Toaster />
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
