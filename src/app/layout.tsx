import { Outfit } from 'next/font/google';
import './globals.css';

import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import RegisterSW from '@/components/pwa/RegisterSW';

const outfit = Outfit({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Manifest pour la PWA */}
        <link rel="manifest" href="/manifest.json" />
        {/* Couleur du thème pour mobile */}
        <meta name="theme-color" content="#2563eb" />
        {/* iOS PWA support */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/images/logo/auth-logo.png" />
        {/* Favicon */}
        <link rel="icon" href="/images/logo/logo-icon.svg" />
      </head>
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ThemeProvider>
          <SidebarProvider>
            <RegisterSW />
            {children}
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
