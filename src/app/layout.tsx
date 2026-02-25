import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CAP All-Hands - Team Collaboration',
  description: 'Internal team collaboration app',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        {/* global layout has no navigation; dashboard handles its own cards */}
        <main className="max-w-4xl mx-auto py-8">{children}</main>
      </body>
    </html>
  );
}
