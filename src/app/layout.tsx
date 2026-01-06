import React from 'react';
import '../styles/index.css';
import NavigationProviderWrapper from '@/components/providers/NavigationProviderWrapper';
import FloatingAIChatbot from '@/components/common/FloatingAIChatbot';
import { AuthProvider } from '@/contexts/AuthContext';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata = {
  title: 'GtsAlpha MCP - ระบบวิเคราะห์ซัพพลายเชน',
  description: 'ระบบวิเคราะห์และติดตามซัพพลายเชนแบบเรียลไทม์',
  icons: {
    icon: [
      { url: '/favicon.ico', type: 'image/x-icon' }
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body>
        <AuthProvider>
          <NavigationProviderWrapper>
            {children}
          </NavigationProviderWrapper>
          <FloatingAIChatbot />
        </AuthProvider>
        <script type="module" defer src="https://static.rocket.new/rocket-shot.js?v=0.0.1" />
      
      <script type="module" async src="https://static.rocket.new/rocket-web.js?_cfg=https%3A%2F%2Fsupplychai9497back.builtwithrocket.new&_be=https%3A%2F%2Fapplication.rocket.new&_v=0.1.12" />
      <script type="module" defer src="https://static.rocket.new/rocket-shot.js?v=0.0.2" /></body>
    </html>
  );
}