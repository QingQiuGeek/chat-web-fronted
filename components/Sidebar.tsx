'use client';

import { useState } from 'react';

export default function Sidebar() {
	const [isOpen, setIsOpen] = useState(true);

	return (
		<nav
			id='sidebar'
			className={`flex flex-shrink-0 flex-col bg-[#171717] border-r border-[rgba(255,255,255,0.1)] transition-all duration-300 ${
				isOpen ? 'w-[260px]' : 'w-0 overflow-hidden hidden'
			}`}
		>
			<div className='px-4 py-4 flex items-center justify-between'>
				<div className='h-8 w-8 rounded-full bg-white flex items-center justify-center flex-shrink-0'>
					<svg
						width='20'
						height='20'
						viewBox='0 0 24 24'
						fill='none'
						xmlns='http://www.w3.org/2000/svg'
					>
						<path
							d='M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2057 5.9847 5.9847 0 0 0 3.998-2.9001 6.0557 6.0557 0 0 0-.7478-7.0731zM13.0652 22.492c-.8782 0-1.7145-.3165-2.3855-.9041l.1424-.0835 4.2965-2.4828a1.6937 1.6937 0 0 0 .8488-1.4721V9.5915l2.4287 1.4027a1.6946 1.6946 0 0 1 .8492 1.4716v5.8275a4.3686 4.3686 0 0 1-4.3685 4.3685h-1.8116zm-8.8344-3.3283a4.3639 4.3639 0 0 1-1.258-3.0515v-5.827l2.4287-1.4028v7.9575a1.6955 1.6955 0 0 0 .8492 1.4716l4.2965 2.4828-.1428.0826-4.2965 2.4828a1.695 1.695 0 0 1-1.8771-.0011V20.892zm-1.0718-11.838c.671-.5875 1.5074-.904 2.3855-.904h1.8115l.1424.0835-4.2965 2.4828a1.694 1.694 0 0 0-.8488 1.4721v7.9575l-2.4287-1.4027A1.6946 1.6946 0 0 1 1.075 16.273V10.445a4.3686 4.3686 0 0 1 2.0838-3.1186zM18.845 3.3283a4.3639 4.3639 0 0 1 1.258 3.0515v5.827l-2.4287 1.4028V5.6521a1.6955 1.6955 0 0 0-.8492-1.4716L12.5286 1.6977l.1428-.0826 4.2965-2.4828a1.695 1.695 0 0 1 1.8771.0011v1.6565zm1.0718 11.838c-.671.5875-1.5074.904-2.3855.904h-1.8115l-.1424-.0835 4.2965-2.4828a1.694 1.694 0 0 0 .8488-1.4721V4.0744l2.4287 1.4027a1.6946 1.6946 0 0 1 .8492 1.4716v5.8275a4.3686 4.3686 0 0 1-2.0838 3.1186zm-6.6575-3.3283h-3.418v-1.9723l1.709-1.0028 1.709 1.0028v1.9723z'
							fill='#000'
						></path>
					</svg>
				</div>
				<button
					className='text-[#a4a4a4] hover:text-white transition-colors'
					onClick={() => setIsOpen(!isOpen)}
				>
					<svg
						width='24'
						height='24'
						viewBox='0 0 24 24'
						fill='none'
						stroke='currentColor'
						strokeWidth='2'
						strokeLinecap='round'
						strokeLinejoin='round'
					>
						<line
							x1='3'
							y1='12'
							x2='21'
							y2='12'
						></line>
						<line
							x1='3'
							y1='6'
							x2='21'
							y2='6'
						></line>
						<line
							x1='3'
							y1='18'
							x2='21'
							y2='18'
						></line>
					</svg>
				</button>
			</div>

			{isOpen && (
				<>
					<div className='px-3 pb-3 space-y-1'>
						<button className='w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[rgba(255,255,255,0.15)] transition-colors group text-[#ececec]'>
							<div className='text-[#a4a4a4] flex items-center justify-center w-5 h-5'>
								<svg
									width='18'
									height='18'
									viewBox='0 0 24 24'
									fill='none'
									stroke='currentColor'
									strokeWidth='2'
									strokeLinecap='round'
									strokeLinejoin='round'
								>
									<path d='M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7'></path>
									<path d='M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z'></path>
								</svg>
							</div>
							<span className='text-sm font-medium'>New chat</span>
							<span className='ml-auto text-xs text-[rgba(255,255,255,0.58)] font-medium'>
								⌘O
							</span>
						</button>
						<button className='w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[rgba(255,255,255,0.15)] transition-colors group text-[#ececec]'>
							<div className='text-[#a4a4a4] flex items-center justify-center w-5 h-5'>
								<svg
									width='18'
									height='18'
									viewBox='0 0 24 24'
									fill='none'
									stroke='currentColor'
									strokeWidth='2'
									strokeLinecap='round'
									strokeLinejoin='round'
								>
									<circle
										cx='11'
										cy='11'
										r='8'
									></circle>
									<line
										x1='21'
										y1='21'
										x2='16.65'
										y2='16.65'
									></line>
								</svg>
							</div>
							<span className='text-sm font-medium'>Search chats</span>
							<span className='ml-auto text-xs text-[rgba(255,255,255,0.58)] font-medium'>
								⌘K
							</span>
						</button>
					</div>

					<div className='flex-1 overflow-y-auto px-3 space-y-1 py-2 border-t border-[rgba(255,255,255,0.1)]'>
						<div className='px-3 py-2 text-[11px] font-semibold text-[rgba(255,255,255,0.4)] uppercase tracking-wider'>
							Yesterday
						</div>
						<button className='w-full flex flex-col gap-0.5 px-3 py-2.5 rounded-lg hover:bg-[rgba(255,255,255,0.1)] transition-colors text-left'>
							<span className='text-sm text-[#ececec] truncate'>
								Frontend design system architecture
							</span>
							<span className='text-[11px] text-[rgba(255,255,255,0.4)]'>
								6:42 PM
							</span>
						</button>
						<button className='w-full flex flex-col gap-0.5 px-3 py-2.5 rounded-lg hover:bg-[rgba(255,255,255,0.1)] transition-colors text-left'>
							<span className='text-sm text-[#ececec] truncate'>
								Tailwind CSS vs Styled Components
							</span>
							<span className='text-[11px] text-[rgba(255,255,255,0.4)]'>
								2:15 PM
							</span>
						</button>
						<div className='px-3 py-2 text-[11px] font-semibold text-[rgba(255,255,255,0.4)] uppercase tracking-wider mt-2'>
							Previous 7 Days
						</div>
						<button className='w-full flex flex-col gap-0.5 px-3 py-2.5 rounded-lg hover:bg-[rgba(255,255,255,0.1)] transition-colors text-left'>
							<span className='text-sm text-[#ececec] truncate'>
								React Server Components tutorial
							</span>
							<span className='text-[11px] text-[rgba(255,255,255,0.4)]'>
								Mar 14
							</span>
						</button>
						<button className='w-full flex flex-col gap-0.5 px-3 py-2.5 rounded-lg hover:bg-[rgba(255,255,255,0.1)] transition-colors text-left'>
							<span className='text-sm text-[#ececec] truncate'>
								Optimization strategies for LLMs
							</span>
							<span className='text-[11px] text-[rgba(255,255,255,0.4)]'>
								Mar 12
							</span>
						</button>
					</div>

					<div className='mt-auto p-3'>
						<div className='bg-[rgba(255,255,255,0.05)] rounded-2xl p-4 flex flex-col gap-3'>
							<h3 className='font-semibold text-[#ececec] text-sm'>
								Sign up or log in
							</h3>
							<p className='text-xs text-[rgba(255,255,255,0.7)] leading-5'>
								Save your chat history, share chats, and personalize your
								experience.
							</p>
							<button className='w-full bg-white text-[#171717] font-semibold rounded-2xl py-2.5 text-sm hover:bg-gray-200 transition-colors mt-1'>
								Log in
							</button>
							<button className='w-full bg-transparent border border-[rgba(255,255,255,0.15)] text-[#ececec] font-semibold rounded-2xl py-2.5 text-sm hover:bg-[rgba(255,255,255,0.1)] transition-colors'>
								Sign up
							</button>
						</div>
					</div>
				</>
			)}
		</nav>
	);
}
