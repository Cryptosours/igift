import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "RealDeal Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface-100">
      <nav className="bg-surface-900 text-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-bold text-lg">RealDeal Admin</span>
          <a href="/admin" className="text-surface-300 hover:text-white text-sm">
            Moderation
          </a>
          <a href="/admin/sources" className="text-surface-300 hover:text-white text-sm">
            Sources
          </a>
        </div>
        <a href="/" className="text-surface-400 hover:text-white text-xs">
          ← Back to site
        </a>
      </nav>
      <div className="max-w-7xl mx-auto px-6 py-8">{children}</div>
    </div>
  );
}
