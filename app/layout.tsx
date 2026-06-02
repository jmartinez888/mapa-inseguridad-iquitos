import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mapa de Inseguridad Ciudadana - Perú",
  description: "Plataforma de reporte ciudadano anónimo para Iquitos, Punchana, Belén y San Juan.",
  icons: {
    icon: "/icono.png?v=1",
  },
};

// Configuración maestra para evitar que los celulares fuercen márgenes o escalas incorrectas
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col m-0 p-0 overflow-x-hidden w-full bg-slate-50">
        {children}
      </body>
    </html>
  );
}