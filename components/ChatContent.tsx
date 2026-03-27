export default function ChatContent() {
	return (
		<>
			<div className='flex-1 flex flex-col items-center justify-center px-4 overflow-y-auto pb-12'>
				<h1 className='text-2xl font-semibold leading-9 [color:var(--app-text)] text-center'>
					Search for an answer
				</h1>
			</div>

			<div className='w-full max-w-3xl mx-auto px-4 pb-6 pt-2'>
				<div className='[background:var(--app-panel)] rounded-[24px] px-3 py-3 flex items-end shadow-lg relative border [border-color:var(--app-border)]'>
					{/* + 上传文件 */}
					<button className='h-9 w-9 rounded-full hover:bg-[var(--app-hover)] flex items-center justify-center flex-shrink-0 [color:var(--app-text)] transition-colors mb-0.5'>
						<svg
							width='22'
							height='22'
							viewBox='0 0 24 24'
							fill='none'
							stroke='currentColor'
							strokeWidth='2'
							strokeLinecap='round'
							strokeLinejoin='round'
						>
							<line
								x1='12'
								y1='5'
								x2='12'
								y2='19'
							></line>
							<line
								x1='5'
								y1='12'
								x2='19'
								y2='12'
							></line>
						</svg>
					</button>
					{/* 输入框 */}
					<textarea
						rows={1}
						placeholder='Ask anything'
						className='flex-1 max-h-[200px] min-h-[40px] bg-transparent resize-none border-none focus:ring-0 [color:var(--app-text)] placeholder:[color:var(--app-muted)] px-3 py-2 m-0 outline-none text-base leading-relaxed'
					></textarea>
					{/* 发送 */}
					<button className='h-9 w-9 rounded-full [background:var(--app-text)] [color:var(--app-bg)] flex items-center justify-center flex-shrink-0 transition-opacity opacity-95 hover:opacity-100 mb-0.5'>
						<svg
							width='20'
							height='20'
							viewBox='0 0 24 24'
							fill='none'
							stroke='currentColor'
							strokeWidth='2.5'
							strokeLinecap='round'
							strokeLinejoin='round'
						>
							<line
								x1='12'
								y1='19'
								x2='12'
								y2='5'
							></line>
							<polyline points='5 12 12 5 19 12'></polyline>
						</svg>
					</button>
				</div>

				{/* 模式选择 */}
				<div className='flex items-center gap-3 mt-4 px-1'>
					<button className='glass-chip border-blue-purple px-4 py-1.5 rounded-full flex items-center gap-2 group'>
						<div className='w-1.5 h-1.5 rounded-full bg-[#3b82f6] shadow-[0_0_8px_#3b82f6]'></div>
						<span className='text-xs font-medium [color:var(--app-muted)] group-hover:[color:var(--app-text)] transition-colors'>
							深度思考
						</span>
					</button>
					<button className='glass-chip border-green-blue px-4 py-1.5 rounded-full flex items-center gap-2 group'>
						<div className='w-1.5 h-1.5 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981]'></div>
						<span className='text-xs font-medium [color:var(--app-muted)] group-hover:[color:var(--app-text)] transition-colors'>
							联网搜索
						</span>
					</button>
					<button className='glass-chip border-orange-pink px-4 py-1.5 rounded-full flex items-center gap-2 group'>
						<div className='w-1.5 h-1.5 rounded-full bg-[#f59e0b] shadow-[0_0_8px_#f59e0b]'></div>
						<span className='text-xs font-medium [color:var(--app-muted)] group-hover:[color:var(--app-text)] transition-colors'>
							Agent模式
						</span>
					</button>
				</div>

				{/* 免责声明 */}
				<div className='text-center text-xs [color:var(--app-muted)] mt-6'>
					AI can make mistakes. Check important info.
				</div>
			</div>
		</>
	);
}
