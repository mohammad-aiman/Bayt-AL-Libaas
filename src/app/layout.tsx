import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from '@/components/providers/Providers';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'Bayt Al Libaas - Premium Women\'s Clothing',
  description: 'Discover premium women\'s clothing collection at Bayt Al Libaas. Shop the latest trends in fashion with secure payments and fast delivery.',
  keywords: 'women clothing, fashion, premium, online shopping, bangladesh, bayt al libaas',
  authors: [{ name: 'Bayt Al Libaas' }],
  openGraph: {
    title: 'Bayt Al Libaas - Premium Women\'s Clothing',
    description: 'Discover premium women\'s clothing collection at Bayt Al Libaas',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bayt Al Libaas - Premium Women\'s Clothing',
    description: 'Discover premium women\'s clothing collection at Bayt Al Libaas',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
} 