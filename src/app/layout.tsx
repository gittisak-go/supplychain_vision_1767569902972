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
</body>
    </html>
  );
}