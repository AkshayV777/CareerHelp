import React from 'react';
import '../styles/globals.css';

export const metadata = { title: 'AI Career Coach' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
