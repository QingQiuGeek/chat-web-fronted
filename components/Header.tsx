'use client';

import Image from 'next/image';
import questionIcon from '@/app/question.png';

export default function Header() {
	// 主题切换函数
	const toggleTheme = () => {
		const html = document.documentElement;
		const nextIsDark = !html.classList.contains('dark');
		html.classList.toggle('dark', nextIsDark);
		localStorage.setItem('theme', nextIsDark ? 'dark' : 'light');
		document.cookie = `theme=${nextIsDark ? 'dark' : 'light'}; path=/; max-age=31536000`;
		const metaThemeColor = document.querySelector('meta[name="theme-color"]');
		if (metaThemeColor) {
			metaThemeColor.setAttribute(
				'content',
				nextIsDark ? '#212121' : '#ffffff',
			);
		}
	};

	return (
		<header className='flex items-center justify-between px-4 h-14 sticky top-0 z-10 [background:var(--app-panel)]'>
			{/* model list */}
			<div className='flex items-center'>
				<button className='flex items-center gap-1.5 hover:bg-[var(--app-hover)] px-3 py-2 rounded-xl transition-colors text-[18px] font-semibold [color:var(--app-text)]'>
					ChatGPT
					<svg
						width='16'
						height='16'
						viewBox='0 0 24 24'
						fill='none'
						stroke='currentColor'
						strokeWidth='2'
						strokeLinecap='round'
						strokeLinejoin='round'
						className='[color:var(--app-muted)]'
					>
						<polyline points='6 9 12 15 18 9'></polyline>
					</svg>
				</button>
			</div>
			<div className='flex items-center gap-3 '>
				{/* Theme Toggle */}
				<button
					onClick={toggleTheme}
					className='cursor-pointer w-9 h-9 rounded-full border-none outline-none ring-0 hover:bg-[var(--app-hover)] [color:var(--app-muted)] transition-colors'
				>
					<span className='theme-icon-moon'>🌙</span>
					<span className='theme-icon-sun'>☀️</span>
				</button>

				{/* User Actions */}
				<button
					aria-label='Help'
					className='cursor-pointer w-9 h-9 rounded-full flex items-center justify-center hover:bg-[var(--app-hover)] [color:var(--app-muted)] transition-colors'
				>
					<Image
						src={questionIcon}
						alt='Help'
						width={18}
						height={18}
						className='theme-adaptive-icon'
					/>
				</button>

				{/* Sign Up/in */}
				<button className='cursor-pointer border [border-color:var(--app-border)] [color:var(--app-text)] hover:bg-[var(--app-hover)] rounded-full px-4 py-2 text-sm font-medium transition-colors'>
					Sign up for free
				</button>
				<button className='cursor-pointer [background:var(--app-text)] [color:var(--app-bg)] rounded-full px-4 py-2 text-sm font-medium transition-colors opacity-95 hover:opacity-100'>
					Log in
				</button>
			</div>
		</header>
	);
}
