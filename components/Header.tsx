export default function Header() {
	return (
		<header className='flex items-center justify-between px-4 h-14 sticky top-0 z-10 bg-[#212121]'>
			<div className='flex items-center'>
				<button className='flex items-center gap-1.5 hover:bg-[rgba(255,255,255,0.1)] px-3 py-2 rounded-xl transition-colors text-[18px] font-semibold text-[#ececec]'>
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
						className='text-[rgba(255,255,255,0.58)]'
					>
						<polyline points='6 9 12 15 18 9'></polyline>
					</svg>
				</button>
			</div>
			<div className='flex items-center gap-3'>
				<button className='theme-toggle group'>
					<div className='theme-toggle-knob transition-transform duration-300'>
						<svg
							width='14'
							height='14'
							viewBox='0 0 24 24'
							fill='#f59e0b'
							stroke='#f59e0b'
							strokeWidth='2'
							strokeLinecap='round'
							strokeLinejoin='round'
							className='text-amber-500'
						>
							<circle
								cx='12'
								cy='12'
								r='5'
							></circle>
							<line
								x1='12'
								y1='1'
								x2='12'
								y2='3'
							></line>
							<line
								x1='12'
								y1='21'
								x2='12'
								y2='23'
							></line>
							<line
								x1='4.22'
								y1='4.22'
								x2='5.64'
								y2='5.64'
							></line>
							<line
								x1='18.36'
								y1='18.36'
								x2='19.78'
								y2='19.78'
							></line>
							<line
								x1='1'
								y1='12'
								x2='3'
								y2='12'
							></line>
							<line
								x1='21'
								y1='12'
								x2='23'
								y2='12'
							></line>
							<line
								x1='4.22'
								y1='19.78'
								x2='5.64'
								y2='18.36'
							></line>
							<line
								x1='18.36'
								y1='5.64'
								x2='19.78'
								y2='4.22'
							></line>
						</svg>
					</div>
				</button>

				<button className='w-9 h-9 rounded-full flex items-center justify-center hover:bg-[rgba(255,255,255,0.1)] text-[#a4a4a4] transition-colors'>
					<svg
						width='20'
						height='20'
						viewBox='0 0 24 24'
						fill='none'
						stroke='currentColor'
						strokeWidth='2'
						strokeLinecap='round'
						strokeLinejoin='round'
					>
						<circle
							cx='12'
							cy='12'
							r='10'
						></circle>
						<path d='M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3'></path>
						<line
							x1='12'
							y1='17'
							x2='12.01'
							y2='17'
						></line>
					</svg>
				</button>
				<button className='border border-[rgba(255,255,255,0.15)] text-[#ececec] hover:bg-[rgba(255,255,255,0.1)] rounded-full px-4 py-2 text-sm font-medium transition-colors'>
					Sign up for free
				</button>
				<button className='bg-white text-[#171717] hover:bg-gray-200 rounded-full px-4 py-2 text-sm font-medium transition-colors'>
					Log in
				</button>
			</div>
		</header>
	);
}
