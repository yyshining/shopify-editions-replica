import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title: "The Renaissance Edition · Winter ’26", description: 'An interactive study of Shopify Editions Winter 2026.', robots:{index:false,follow:false}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
