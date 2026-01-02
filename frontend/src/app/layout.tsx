import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import React, { useEffect } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Compass | Chief of Staff",
  description: "Strategic Intelligence for Startup Founders",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // #region agent log
  useEffect(() => {
    fetch('http://127.0.0.1:7243/ingest/b4de5701-9876-47ce-aad5-7d358d247a66', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'layout.tsx:RootLayout',
        message: 'OpenAI Aesthetic Build Check',
        data: {
          version: 'v3-openai-aesthetic',
          timestamp: Date.now(),
          git_commit: 'eb4279a' // The latest commit on develop
        },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        hypothesisId: 'H1'
      })
    }).catch(() => {});
  }, []);
  // #endregion

  return (
    <html lang="en" className="dark">
          <body className={`${inter.className} bg-[#fdfdfd] text-[#1a1a1a] antialiased selection:bg-[#1a1a1a] selection:text-white`}>
            <div className="flex h-screen overflow-hidden">
              <Sidebar />
              
              {/* Main Content */}
              <main className="flex-1 overflow-y-auto bg-transparent relative">
                <div className="max-w-6xl mx-auto p-12 lg:p-24">
                  {children}
                </div>
              </main>
            </div>
          </body>
    </html>
  );
}
