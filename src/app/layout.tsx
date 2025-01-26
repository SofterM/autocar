import type { Metadata, Viewport } from "next";
import { Kanit } from "next/font/google";
import "./globals.css";
import PageTransition from "@/components/PageTransition";

const kanit = Kanit({
  subsets: ['latin', 'thai'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-kanit',
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${kanit.variable} font-kanit antialiased`} suppressHydrationWarning>
        <PageTransition>
          {children}
        </PageTransition>
      </body>
    </html>
  );
}