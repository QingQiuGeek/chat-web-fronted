import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
	variable: '--font-inter',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: 'ChatGPT Clone - Premium Modes',
	description: 'ChatGPT Clone built with Next.js',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang='en'
			className={`${inter.variable} h-full antialiased`}
		>
			<body className='h-full w-full m-0 p-0 overflow-hidden'>{children}</body>
		</html>
	);
}
