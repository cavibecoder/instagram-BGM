import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Instagram BGM',
    description: 'Manage your BGM tracks',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
                    <header className="bg-white shadow-sm sticky top-0 z-10">
                        <div className="container flex items-center justify-between py-4">
                            <a href="/" className="text-xl font-bold text-[var(--color-primary)] no-underline">
                                Instagram BGM
                            </a>
                        </div>
                    </header>
                    <main className="container py-6">
                        {children}
                    </main>
                </div>
            </body>
        </html>
    );
}
