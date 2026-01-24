// Root Layout - Thai School LMS

import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { AuthProvider } from '@/components/providers/auth-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';

export const metadata: Metadata = {
    title: {
        default: 'ระบบจัดการการเรียนการสอน',
        template: '%s | Thai School LMS',
    },
    description: 'แพลตฟอร์มการเรียนการสอนสำหรับโรงเรียนไทย (ป.1 - ม.6)',
    keywords: ['LMS', 'โรงเรียน', 'การศึกษา', 'ระบบจัดการการเรียน', 'Thai School'],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="th" suppressHydrationWarning>
            <body className="min-h-screen antialiased">
                <ThemeProvider
                    attribute="class"
                    defaultTheme="light"
                    enableSystem
                    disableTransitionOnChange
                >
                    <QueryProvider>
                        <AuthProvider>
                            {children}
                            <Toaster />
                        </AuthProvider>
                    </QueryProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
