'use client';

import {
	LinkOutlined,
	RedoOutlined,
	ShareAltOutlined,
} from '@ant-design/icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Actions, Bubble, Sources, Think, ThoughtChain } from '@ant-design/x';
import type {
	ActionsFeedbackProps,
	ActionsProps,
	BubbleItemType,
	SourcesProps,
	ThoughtChainItemType,
} from '@ant-design/x';
import { Avatar } from 'antd';
import aiAvatar from '../app/ai.jpg';
import Prompt from './Prompt';
import ChatSender from './ChatSender';

type ChatMessage = {
	key: string;
	role: 'user' | 'ai' | 'system';
	content: string;
	loading?: boolean;
	streaming?: boolean;
};

export default function ChatContent() {
	const [value, setValue] = useState('');
	const [thinking, setThinking] = useState(false);
	const [generating, setGenerating] = useState(false);
	const [currentAiKey, setCurrentAiKey] = useState<string | null>(null);
	const [feedbackMap, setFeedbackMap] = useState<
		Record<string, ActionsFeedbackProps['value']>
	>({});
	const [sourcesMap, setSourcesMap] = useState<
		Record<string, SourcesProps['items']>
	>({});
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const timeoutIdsRef = useRef<number[]>([]);
	const streamTimeoutIdRef = useRef<number | null>(null);
	const messageIdRef = useRef(0);
	const activeStreamTokenRef = useRef(0);

	const clearAllTimers = () => {
		activeStreamTokenRef.current += 1;
		timeoutIdsRef.current.forEach((id) => window.clearTimeout(id));
		timeoutIdsRef.current = [];
		if (streamTimeoutIdRef.current !== null) {
			window.clearTimeout(streamTimeoutIdRef.current);
			streamTimeoutIdRef.current = null;
		}
	};

	useEffect(() => {
		return () => {
			clearAllTimers();
		};
	}, []);

	const thoughtChainItems = useMemo<ThoughtChainItemType[]>(
		() => [
			{
				key: 'tc-1',
				title: '意图识别',
				description: '解析用户输入并识别任务目标',
				status: 'success' as const,
				collapsible: true,
				content: '已识别为“前端实现 + 组件集成”任务。',
			},
			{
				key: 'tc-2',
				title: '信息检索',
				description: '检索组件 API 与示例模式',
				status: thinking ? 'loading' : 'success',
				collapsible: true,
				content: thinking
					? '正在检索 Welcome / Prompts / Sender / Think / ThoughtChain 的配置项...'
					: '组件结构与属性已确认。',
			},
			{
				key: 'tc-3',
				title: '生成回答',
				description: '组织输出并生成可执行建议',
				status: generating ? 'loading' : 'success',
				collapsible: true,
				content: generating
					? '正在组织最终回答...'
					: '回答已生成，可以继续追问细节。',
			},
		],
		[thinking, generating],
	);

	const completedThoughtChainItems = useMemo<ThoughtChainItemType[]>(
		() => [
			{
				key: 'tc-1',
				title: '意图识别',
				description: '解析用户输入并识别任务目标',
				status: 'success',
				collapsible: true,
				content: '已识别为“前端实现 + 组件集成”任务。',
			},
			{
				key: 'tc-2',
				title: '信息检索',
				description: '检索组件 API 与示例模式',
				status: 'success',
				collapsible: true,
				content: '组件结构与属性已确认。',
			},
			{
				key: 'tc-3',
				title: '生成回答',
				description: '组织输出并生成可执行建议',
				status: 'success',
				collapsible: true,
				content: '回答已生成，可以继续追问细节。',
			},
		],
		[],
	);

	const sendMessage = (raw: string) => {
		const text = raw.trim();
		if (!text) return;
		if (generating) return;

		clearAllTimers();

		const timeId = String(++messageIdRef.current);
		const streamToken = ++activeStreamTokenRef.current;
		const userKey = `user-${timeId}`;
		const aiKey = `ai-${timeId}`;
		const fullReply = `关于"${text}"，我建议先从需求拆分、组件职责边界、数据流和交互状态管理四个层面设计。需要的话我可以继续给你产出可直接落地的代码版本。`;

		setValue('');
		setThinking(true);
		setGenerating(true);
		setCurrentAiKey(aiKey);
		setSourcesMap((prev) => ({
			...prev,
			[aiKey]: buildSourcesItems(text),
		}));
		// 先添加用户消息和 AI 占位消息（用于承载思考过程）
		setMessages((prev) => [
			...prev,
			{ key: userKey, role: 'user', content: text },
			{ key: aiKey, role: 'ai', content: '', streaming: true },
		]);

		const thinkTimeout = window.setTimeout(() => {
			if (activeStreamTokenRef.current !== streamToken) return;
			setThinking(false);

			let index = 0;
			const chunkSize = 2;

			const pushChunk = () => {
				if (activeStreamTokenRef.current !== streamToken) return;

				index += chunkSize;
				const nextContent = fullReply.slice(0, index);
				const isDone = index >= fullReply.length;

				setMessages((prev) =>
					prev.map((item) =>
						item.key === aiKey
							? {
									...item,
									content: nextContent,
									streaming: !isDone,
								}
							: item,
					),
				);

				if (isDone) {
					streamTimeoutIdRef.current = null;
					setGenerating(false);
					return;
				}

				streamTimeoutIdRef.current = window.setTimeout(pushChunk, 36);
			};

			pushChunk();
		}, 1400);
		timeoutIdsRef.current.push(thinkTimeout);
	};

	// 判断是否有用户消息（即是否开始对话）
	const hasUserMessage = messages.some((m) => m.role === 'user');

	// 找最后一个用户消息的索引
	const lastUserMsgIdx = messages.findLastIndex((m) => m.role === 'user');
	// 之前的消息（最后一个用户消息之前的所有消息）
	const previousMessages =
		lastUserMsgIdx > 0 ? messages.slice(0, lastUserMsgIdx) : [];
	// 最新一轮的消息（最后一个用户消息及之后的）
	const latestRoundMessages =
		lastUserMsgIdx >= 0 ? messages.slice(lastUserMsgIdx) : [];

	const handleRetry = (aiKey: string) => {
		if (generating) return;
		const sourceKey = aiKey.replace(/^ai-/, 'user-');
		const source = messages.find(
			(m) => m.key === sourceKey && m.role === 'user',
		);
		if (source?.content) {
			sendMessage(source.content);
		}
	};

	const handleShare = async (text: string) => {
		if (!text) return;
		try {
			if (navigator.share) {
				await navigator.share({ text });
				return;
			}
		} catch {
			// Ignore native share cancel/error and fallback to clipboard.
		}
		if (navigator.clipboard) {
			await navigator.clipboard.writeText(text);
		}
	};

	const buildSourcesItems = (query: string): SourcesProps['items'] => {
		const encoded = encodeURIComponent(query);
		return [
			{
				key: 's-1',
				title: 'Ant Design X 组件总览',
				url: 'https://ant-design-x.antgroup.com/components/overview-cn',
				icon: <LinkOutlined />,
				description: '官方组件入口与能力清单',
			},
			{
				key: 's-2',
				title: 'Bubble 对话气泡',
				url: 'https://ant-design-x.antgroup.com/components/bubble-cn',
				icon: <LinkOutlined />,
				description: '消息结构、流式传输、角色与插槽',
			},
			{
				key: 's-3',
				title: `搜索：${query}`,
				url: `https://www.bing.com/search?q=${encoded}`,
				icon: <LinkOutlined />,
				description: '外部检索结果（示例来源）',
			},
		];
	};

	const createAiActions = (data: BubbleItemType): ActionsProps['items'] => {
		const aiKey = String(data.key);
		const feedback = feedbackMap[aiKey] ?? 'default';
		const text = String(data.content ?? '');

		return [
			{
				key: 'copy',
				actionRender: () => <Actions.Copy text={text} />,
			},
			{
				key: 'feedback',
				actionRender: () => (
					<Actions.Feedback
						value={feedback}
						styles={{
							liked: {
								color: '#ff4d4f',
							},
							disliked: {
								color: '#000000',
							},
						}}
						onChange={(val) => {
							setFeedbackMap((prev) => ({
								...prev,
								[aiKey]: val,
							}));
						}}
					/>
				),
			},
			{
				key: 'retry',
				icon: <RedoOutlined />,
				label: '重试',
				onItemClick: () => handleRetry(aiKey),
			},
			{
				key: 'share',
				icon: <ShareAltOutlined />,
				label: '分享',
				onItemClick: () => {
					void handleShare(text);
				},
			},
		];
	};

	const bubbleRole = {
		ai: (data: BubbleItemType) => {
			const isCurrentAiMessage = String(data.key) === currentAiKey;
			const thoughtItems = isCurrentAiMessage
				? thoughtChainItems
				: completedThoughtChainItems;

			return {
				placement: 'start' as const,
				variant: 'outlined' as const,
				avatar: (
					<Avatar
						size={45}
						src={aiAvatar.src}
					/>
				),
				header: String(data.key).startsWith('ai-') ? (
					<Think
						title={isCurrentAiMessage && thinking ? '思考中' : '思考完成'}
						loading={isCurrentAiMessage && thinking}
						defaultExpanded={false}
						style={{ marginBottom: 8 }}
					>
						<ThoughtChain
							line='dashed'
							items={thoughtItems}
							defaultExpandedKeys={['tc-1', 'tc-2', 'tc-3']}
						/>
					</Think>
				) : undefined,
				footer:
					String(data.key).startsWith('ai-') && String(data.content ?? '') ? (
						<div className='flex flex-col gap-2'>
							<Actions
								items={createAiActions(data)}
								variant='borderless'
								fadeInLeft
							/>
							<Sources
								title={`Used ${sourcesMap[String(data.key)]?.length ?? 0} sources`}
								items={sourcesMap[String(data.key)] ?? []}
								defaultExpanded={false}
								expandIconPosition='end'
							/>
						</div>
					) : undefined,
				footerPlacement: 'outer-start' as const,
			};
		},
		user: { placement: 'end' as const, variant: 'filled' as const },
		system: { variant: 'borderless' as const },
	};

	return (
		<div className='flex-1 min-h-0 px-4 pb-4 flex flex-col gap-3'>
			{/* 内容区：包含 Prompts 或对话框 */}
			<div className='mx-auto flex flex-1 w-full max-w-md sm:max-w-2xl lg:max-w-4xl flex-col min-h-0'>
				{/* 未开始对话时：Prompts 垂直居中 */}
				{!hasUserMessage && <Prompt onItemClick={sendMessage} />}

				{/* 开始对话后：显示对话框 */}
				{hasUserMessage && (
					<div
						className='min-h-0 flex-1 overflow-y-auto rounded-2xl p-3 flex flex-col gap-4'
						style={{
							background: 'var(--app-panel)',
						}}
					>
						{/* 之前的对话 */}
						{previousMessages.length > 0 && (
							<Bubble.List
								items={previousMessages}
								role={bubbleRole}
							/>
						)}

						{/* 最新一轮消息 */}
						{latestRoundMessages.length > 0 && (
							<Bubble.List
								items={latestRoundMessages}
								autoScroll
								role={bubbleRole}
							/>
						)}
					</div>
				)}
			</div>

			{/* 输入框固定在底部 */}
			<div
				className='mx-auto w-full max-w-md sm:max-w-2xl lg:max-w-4xl rounded-2xl p-2 flex-shrink-0 border [border-color:var(--app-border)]'
				style={{
					background: 'var(--app-panel)',
				}}
			>
				<ChatSender
					value={value}
					onChangeAction={setValue}
					onSubmitAction={sendMessage}
					loading={generating}
					onCancelAction={() => {
						clearAllTimers();
						setThinking(false);
						setGenerating(false);
						setCurrentAiKey(null);
						setMessages((prev) =>
							prev.map((item) =>
								item.key === currentAiKey
									? {
											...item,
											streaming: false,
										}
									: item,
							),
						);
					}}
				/>
			</div>
		</div>
	);
}
