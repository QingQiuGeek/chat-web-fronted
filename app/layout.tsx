import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { cookies } from 'next/headers';
import Script from 'next/script';
import './globals.css';

const inter = Inter({
	variable: '--font-inter',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: 'ChatAgent  - Premium Modes',
	description: 'ChatAgent built with Next.js',
};

// 主题
export async function generateViewport(): Promise<Viewport> {
	// 获取请求中的 cookie
	const cookieStore = await cookies();
	const themeCookie = cookieStore.get('theme')?.value;
	// 默认深色主题的颜色
	const color = themeCookie === 'light' ? '#ffffff' : '#212121';

	return {
		themeColor: color,
		colorScheme: themeCookie === 'light' ? 'light' : 'dark',
	};
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang='en'
			className={`${inter.variable} h-full antialiased`}
			suppressHydrationWarning
		>
			<body className='h-full w-full m-0 p-0 overflow-hidden'>
				<Script
					id='theme-init'
					strategy='beforeInteractive'
				>
					{`
						(function() {
							try {
								var theme = document.cookie.match(/(^| )theme=([^;]+)/);
								var isDark = theme ? theme[2] === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
								document.documentElement.classList.toggle('dark', isDark);
							} catch (e) {}
						})();
					`}
				</Script>
				{children}
			</body>
		</html>
	);
}
