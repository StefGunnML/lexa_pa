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
