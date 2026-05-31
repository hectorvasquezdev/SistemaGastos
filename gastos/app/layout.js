import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const font = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
});

export const metadata = {
  title: 'GASTOS — Tu plata, bajo control',
  description: 'Controla tus gastos de Yape y efectivo, visualiza gráficos y ahorra más cada mes.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={font.className}>{children}</body>
    </html>
  );
}
