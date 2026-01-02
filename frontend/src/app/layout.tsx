import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

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
  console.log('LAYOUT_RENDER', { timestamp: Date.now() });
  // #region agent log
  const logData = {
    location: 'layout.tsx:RootLayout',
    message: 'Rendering RootLayout',
    data: {
      env: process.env.NODE_ENV,
      nangoKey: process.env.NEXT_PUBLIC_NANGO_PUBLIC_KEY ? 'present' : 'missing'
    },
    timestamp: Date.now(),
    sessionId: 'debug-session',
    hypothesisId: '4'
  };
  fetch('http://127.0.0.1:7243/ingest/b4de5701-9876-47ce-aad5-7d358d247a66', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(logData)
  }).catch(() => {});
  // #endregion

  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-background text-foreground antialiased selection:bg-slate-700`}>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          
          {/* Main Content */}
          <main className="flex-1 overflow-y-auto bg-transparent relative">
            <div className="max-w-6xl mx-auto p-12 lg:p-20">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
