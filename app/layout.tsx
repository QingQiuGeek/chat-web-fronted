import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { cookies } from 'next/headers';
import { AntdRegistry } from '@ant-design/nextjs-registry';
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

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const cookieStore = await cookies();
	const themeCookie = cookieStore.get('theme')?.value;
	const isDark = themeCookie !== 'light';
	const htmlClassName = `${inter.variable} h-full antialiased${isDark ? ' dark' : ''}`;

	return (
		<html
			lang='en'
			className={htmlClassName}
			suppressHydrationWarning
		>
			<body className='h-full w-full m-0 p-0 overflow-hidden'>
				<AntdRegistry>{children}</AntdRegistry>
			</body>
		</html>
	);
}
