'use client';

import {
	DeleteOutlined,
	EditOutlined,
	MoreOutlined,
	SearchOutlined,
	ShareAltOutlined,
} from '@ant-design/icons';
import {
	Conversations,
	type ConversationItemType,
	type ConversationsProps,
} from '@ant-design/x';
import type { MenuProps } from 'antd';
import { Button, Input, message } from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import Image from 'next/image';
import {
	CHAT_FIRST_USER_MESSAGE_EVENT,
	SIDEBAR_ACTIVE_CONVERSATION_EVENT,
	SIDEBAR_NEW_CONVERSATION_EVENT,
	type ChatFirstUserMessageDetail,
} from './chatEvents';
import threeBars from '@/app/three-bars.png';

type ConversationRecord = {
	key: string;
	title: string;
	createdAt: string;
};

const INITIAL_CONVERSATIONS: ConversationRecord[] = [
	{
		key: 'conv-1',
		title: '前端设计系统架构讨论',
		createdAt: '2026-03-28T18:42:00',
	},
	{
		key: 'conv-2',
		title: 'Tailwind CSS 与 Styled Components 对比',
		createdAt: '2026-03-28T14:15:00',
	},
	{
		key: 'conv-3',
		title: 'React Server Components 入门',
		createdAt: '2026-03-20T10:30:00',
	},
	{
		key: 'conv-4',
		title: '大模型推理性能优化策略',
		createdAt: '2026-03-18T16:20:00',
	},
];

function formatConversationTime(isoString: string) {
	const date = new Date(isoString);
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	const hour = String(date.getHours()).padStart(2, '0');
	const minute = String(date.getMinutes()).padStart(2, '0');

	return `${year}-${month}-${day} ${hour}:${minute}`;
}

function toConversationTitle(text: string, maxLength = 28) {
	const normalized = text.replace(/\s+/g, ' ').trim();
	if (!normalized) {
		return '新对话';
	}
	return normalized.length > maxLength
		? `${normalized.slice(0, maxLength)}...`
		: normalized;
}

export default function Sidebar() {
	// 侧边栏收缩状态
	const [isOpen, setIsOpen] = useState(true);
	const [keyword, setKeyword] = useState('');
	const [conversations, setConversations] = useState<ConversationRecord[]>(
		INITIAL_CONVERSATIONS,
	);
	const [activeKey, setActiveKey] = useState<string | undefined>(
		INITIAL_CONVERSATIONS[0]?.key,
	);
	const idRef = useRef(INITIAL_CONVERSATIONS.length + 1);
	const pendingConversationRef = useRef<{
		key: string;
		createdAt: string;
	} | null>(null);

	const createConversation = useCallback(() => {
		const nextId = idRef.current;
		idRef.current += 1;
		const nowIso = new Date().toISOString();
		const nextKey = `conv-${nextId}`;
		pendingConversationRef.current = {
			key: nextKey,
			createdAt: nowIso,
		};
		setActiveKey(nextKey);
		window.dispatchEvent(
			new CustomEvent(SIDEBAR_NEW_CONVERSATION_EVENT, {
				detail: { key: nextKey },
			}),
		);
	}, []);

	useEffect(() => {
		const handleFirstMessage = (event: Event) => {
			const customEvent = event as CustomEvent<ChatFirstUserMessageDetail>;
			const text = customEvent.detail?.text?.trim();
			if (!text) return;

			const pending = pendingConversationRef.current;
			if (!pending) return;

			const nextConversation: ConversationRecord = {
				key: pending.key,
				title: toConversationTitle(text),
				createdAt: pending.createdAt,
			};

			setConversations((prev) => [nextConversation, ...prev]);
			setActiveKey(pending.key);
			pendingConversationRef.current = null;
		};

		window.addEventListener(CHAT_FIRST_USER_MESSAGE_EVENT, handleFirstMessage);
		return () => {
			window.removeEventListener(
				CHAT_FIRST_USER_MESSAGE_EVENT,
				handleFirstMessage,
			);
		};
	}, []);

	const filteredConversations = useMemo(() => {
		const text = keyword.trim().toLowerCase();
		return conversations
			.filter((item) => item.title.toLowerCase().includes(text))
			.sort(
				(a, b) =>
					new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
			);
	}, [conversations, keyword]);

	const conversationItems = useMemo<ConversationsProps['items']>(() => {
		return filteredConversations.map((item) => {
			return {
				key: item.key,
				label: (
					<div className='flex min-w-0 flex-col py-1'>
						<span className='text-sm font-medium truncate text-[var(--app-text)]'>
							{item.title}
						</span>
						<span className='text-[11px] text-[var(--app-muted)]'>
							{formatConversationTime(item.createdAt)}
						</span>
					</div>
				),
			};
		});
	}, [filteredConversations]);

	const handleShare = useCallback(async (record: ConversationRecord) => {
		const shareText = `${record.title} (${formatConversationTime(record.createdAt)})`;
		try {
			if (navigator.share) {
				await navigator.share({ text: shareText });
			} else if (navigator.clipboard) {
				await navigator.clipboard.writeText(shareText);
				message.success('会话内容已复制，可直接分享。');
			} else {
				message.info('当前环境不支持系统分享。');
			}
		} catch {
			message.info('已取消分享。');
		}
	}, []);

	const handleDelete = useCallback((key: string) => {
		setConversations((prev) => {
			const nextList = prev.filter((item) => item.key !== key);
			setActiveKey((prevActive) =>
				prevActive === key ? nextList[0]?.key : prevActive,
			);
			return nextList;
		});
	}, []);

	const conversationMenu = useCallback(
		(value: ConversationItemType) => ({
			trigger: (
				<Button
					type='text'
					size='small'
					className='sidebar-action-btn'
					icon={<MoreOutlined />}
					aria-label='会话操作菜单'
				/>
			),
			items: [
				{ key: 'share', label: '分享', icon: <ShareAltOutlined /> },
				{
					key: 'delete',
					label: '删除',
					danger: true,
					icon: <DeleteOutlined />,
				},
			],
			onClick: (info: Parameters<NonNullable<MenuProps['onClick']>>[0]) => {
				const { key } = info;
				const record = conversations.find((item) => item.key === value.key);
				if (!record) return;

				if (key === 'share') {
					void handleShare(record);
					return;
				}

				if (key === 'delete') {
					handleDelete(record.key);
				}
			},
		}),
		[conversations, handleDelete, handleShare],
	);

	const handleActiveConversationChange = useCallback((key: string) => {
		setActiveKey(key);
		window.dispatchEvent(
			new CustomEvent(SIDEBAR_ACTIVE_CONVERSATION_EVENT, {
				detail: { key },
			}),
		);
	}, []);

	// 监听窗口大小变化，自动调整侧边栏状态
	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth < 768) {
				setIsOpen(false);
			} else {
				setIsOpen(true);
			}
		};

		// 初始检查
		handleResize();
		window.addEventListener('resize', handleResize);

		// 在组件被卸载（Unmount）销毁的时候（比如跳转页面），或者下一次这个 useEffect 重新执行之前才会跑return，清除之前的事件监听，避免内存泄漏和重复绑定事件
		return () => window.removeEventListener('resize', handleResize);
		// [] 表示不依赖任何随时会变化的变量。函数只会在这个组件第一次挂载到页面上（Mount）时执行一次
	}, []);

	return (
		<nav
			id='sidebar'
			className={`flex flex-shrink-0 flex-col [background:var(--app-sidebar)] border-r border-[rgba(255,255,255,0.1)] transition-all duration-300 overflow-hidden ${
				isOpen ? 'w-[260px]' : 'w-[68px]'
			}`}
		>
			<div
				className={`py-4 flex items-center transition-all duration-300 ${isOpen ? 'px-4 justify-between' : 'justify-center'}`}
			>
				{/* logo */}
				<div
					className={`h-8 w-8 rounded-full bg-white items-center justify-center flex-shrink-0 ${isOpen ? 'flex' : 'hidden'}`}
				>
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
				{/* Toggle Button */}
				<button
					className='cursor-pointer w-6 h-6 text-[#a4a4a4] hover:bg-[var(--app-hover)] transition-colors '
					onClick={() => setIsOpen(!isOpen)}
				>
					<Image
						src={threeBars}
						alt='sidebar toggle'
						className='theme-adaptive-icon'
					/>
				</button>
			</div>

			{isOpen && (
				<>
					<div className='px-3 pb-3 space-y-2'>
						<Button
							block
							type='default'
							icon={<EditOutlined />}
							onClick={createConversation}
							className='!h-10 !rounded-lg !border-[var(--app-border)] !bg-transparent !text-[var(--app-text)] hover:!bg-[var(--app-hover)]'
						>
							新增对话
						</Button>
						<Input
							allowClear
							value={keyword}
							onChange={(event) => setKeyword(event.target.value)}
							prefix={<SearchOutlined />}
							placeholder='搜索对话'
							className='sidebar-search'
						/>
					</div>
					<div>
						{/* 历史会话 */}
						<Conversations
							className='sidebar-conversations'
							items={conversationItems}
							activeKey={activeKey}
							onActiveChange={(value) => handleActiveConversationChange(value)}
							menu={conversationMenu}
						/>
					</div>

					{/* 登陆注册 */}
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
