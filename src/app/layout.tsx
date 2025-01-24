// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PageTransition from "@/components/PageTransition";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL('https://autocar2.vercel.app/'),
  title: {
    default: 'AutoCar - ระบบจัดการซ่อมบำรุงยานพาหนะ',
    template: '%s | AutoCar'
  },
  description: 'ยกระดับการบริหารจัดการยานพาหนะด้วยระบบอัตโนมัติ',
  openGraph: {
    type: 'website',
    locale: 'th_TH',
    url: 'https://autocar2.vercel.app/',
    siteName: 'AutoCar',
    title: 'AutoCar - ระบบจัดการซ่อมบำรุงยานพาหนะ',
    description: 'ยกระดับการบริหารจัดการยานพาหนะด้วยระบบอัตโนมัติ',
    images: [
      {
        url: '/LOGO.png',
        width: 800,
        height: 600,
        alt: 'AutoCar Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AutoCar - ระบบจัดการซ่อมบำรุงยานพาหนะ',
    description: 'ยกระดับการบริหารจัดการยานพาหนะด้วยระบบอัตโนมัติ',
    images: ['/LOGO.png'],
  },
  icons: {
    icon: '/LOGO.png',
    apple: '/LOGO.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        <PageTransition>
          {children}
        </PageTransition>
      </body>
    </html>
  );
}