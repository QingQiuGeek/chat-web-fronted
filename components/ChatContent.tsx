'use client';

import {
	LinkOutlined,
	RedoOutlined,
	ShareAltOutlined,
} from '@ant-design/icons';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

const ChatSender = dynamic(() => import('./ChatSender'), {
	ssr: false,
	loading: () => (
		<div
			className='w-full rounded-2xl'
			style={{ minHeight: 56 }}
		/>
	),
});

type ChatMessage = {
	key: string;
	role: 'user' | 'ai' | 'system';
	content: string;
	loading?: boolean;
	streaming?: boolean;
};

const AI_KEY_PREFIX = 'ai-';
const USER_KEY_PREFIX = 'user-';

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
	const conversationRef = useRef<HTMLDivElement | null>(null);
	const pendingScrollRef = useRef(false);
	const thinkTimeoutIdRef = useRef<number | null>(null);
	const streamStepTimeoutIdRef = useRef<number | null>(null);
	const streamFinalizeTimeoutIdRef = useRef<number | null>(null);
	const messageIdRef = useRef(0);
	const activeStreamTokenRef = useRef(0);

	const scrollToLatest = useCallback((behavior: ScrollBehavior = 'auto') => {
		const container = conversationRef.current;
		if (!container) return;
		container.scrollTo({
			top: container.scrollHeight,
			behavior,
		});
	}, []);

	const scheduleScrollToLatest = useCallback(
		(behavior: ScrollBehavior = 'auto') => {
			window.requestAnimationFrame(() => {
				window.requestAnimationFrame(() => {
					scrollToLatest(behavior);
				});
			});
		},
		[scrollToLatest],
	);

	const clearStreamTimers = useCallback(() => {
		if (thinkTimeoutIdRef.current !== null) {
			window.clearTimeout(thinkTimeoutIdRef.current);
			thinkTimeoutIdRef.current = null;
		}
		if (streamStepTimeoutIdRef.current !== null) {
			window.clearTimeout(streamStepTimeoutIdRef.current);
			streamStepTimeoutIdRef.current = null;
		}
		if (streamFinalizeTimeoutIdRef.current !== null) {
			window.clearTimeout(streamFinalizeTimeoutIdRef.current);
			streamFinalizeTimeoutIdRef.current = null;
		}
	}, []);

	const clearAllTimers = useCallback(() => {
		activeStreamTokenRef.current += 1;
		clearStreamTimers();
	}, [clearStreamTimers]);

	useEffect(() => {
		return () => {
			clearAllTimers();
		};
	}, [clearAllTimers]);

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

	const buildSourcesItems = useCallback(
		(query: string): SourcesProps['items'] => {
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
		},
		[],
	);

	const sendMessage = useCallback(
		(raw: string) => {
			const text = raw.trim();
			if (!text) return;
			if (generating) return;
			pendingScrollRef.current = true;

			clearAllTimers();

			const timeId = String(++messageIdRef.current);
			const streamToken = ++activeStreamTokenRef.current;
			const userKey = `${USER_KEY_PREFIX}${timeId}`;
			const aiKey = `${AI_KEY_PREFIX}${timeId}`;
			const fullReply = `关于"${text}"，我建议先从需求拆分、组件职责边界、数据流和交互状态管理四个层面设计。需要的话我可以继续给你产出可直接落地的代码版本。`;
			let streamFinished = false;

			const finishStream = (content: string) => {
				if (activeStreamTokenRef.current !== streamToken) return;
				if (streamFinished) return;
				streamFinished = true;
				setThinking(false);
				setGenerating(false);
				setMessages((prev) =>
					prev.map((item) =>
						item.key === aiKey
							? {
									...item,
									content,
									streaming: false,
								}
							: item,
					),
				);
				clearStreamTimers();
			};

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
			scheduleScrollToLatest('auto');

			streamFinalizeTimeoutIdRef.current = window.setTimeout(() => {
				finishStream(fullReply);
			}, 15000);

			const thinkTimeoutId = window.setTimeout(() => {
				if (activeStreamTokenRef.current !== streamToken) return;
				if (streamFinished) return;
				thinkTimeoutIdRef.current = null;
				setThinking(false);

				let index = 0;
				const chunkSize = Math.max(1, Math.ceil(fullReply.length / 36));

				const pushChunk = () => {
					if (activeStreamTokenRef.current !== streamToken) return;
					if (streamFinished) return;

					index = Math.min(fullReply.length, index + chunkSize);
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
					scheduleScrollToLatest('auto');

					if (isDone) {
						finishStream(fullReply);
						return;
					}

					streamStepTimeoutIdRef.current = window.setTimeout(pushChunk, 34);
				};

				pushChunk();
			}, 650);
			thinkTimeoutIdRef.current = thinkTimeoutId;
		},
		[
			buildSourcesItems,
			clearAllTimers,
			clearStreamTimers,
			generating,
			scheduleScrollToLatest,
		],
	);

	// 判断是否有用户消息（即是否开始对话）
	const hasUserMessage = messages.some((m) => m.role === 'user');

	useEffect(() => {
		if (!hasUserMessage) return;
		if (pendingScrollRef.current) {
			pendingScrollRef.current = false;
			scheduleScrollToLatest('smooth');
			return;
		}
		const rafId = window.requestAnimationFrame(() => {
			scrollToLatest('auto');
		});

		return () => {
			window.cancelAnimationFrame(rafId);
		};
	}, [hasUserMessage, messages, scrollToLatest, scheduleScrollToLatest]);

	const handleRetry = useCallback(
		(aiKey: string) => {
			if (generating) return;
			const sourceKey = aiKey.replace(/^ai-/, USER_KEY_PREFIX);
			const source = messages.find(
				(m) => m.key === sourceKey && m.role === 'user',
			);
			if (source?.content) {
				sendMessage(source.content);
			}
		},
		[generating, messages, sendMessage],
	);

	const handleShare = useCallback(async (text: string) => {
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
	}, []);

	const createAiActions = useCallback(
		(data: BubbleItemType): ActionsProps['items'] => {
			const aiKey = String(data.key);
			const text = String(data.content ?? '');

			return [
				{
					key: 'copy',
					actionRender: () => <Actions.Copy text={text} />,
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
		},
		[handleRetry, handleShare],
	);

	const bubbleRole = useMemo(
		() => ({
			ai: (data: BubbleItemType) => {
				const isCurrentAiMessage = String(data.key) === currentAiKey;
				const thoughtItems = isCurrentAiMessage
					? thoughtChainItems
					: completedThoughtChainItems;
				const isStreaming = Boolean(data.streaming);
				const isAiMessage = String(data.key).startsWith(AI_KEY_PREFIX);

				return {
					placement: 'start' as const,
					variant: 'outlined' as const,
					typing:
						isCurrentAiMessage && isStreaming
							? {
									effect: 'typing' as const,
									step: 1,
									interval: 22,
									keepPrefix: true,
								}
							: false,
					avatar: (
						<Avatar
							size={35}
							src={aiAvatar.src}
						/>
					),
					header: isAiMessage ? (
						<Think
							title={isCurrentAiMessage && thinking ? '思考中' : '思考完成'}
							loading={isCurrentAiMessage && thinking}
							defaultExpanded={false}
							style={{ marginBottom: 8 }}
						>
							<ThoughtChain
								line='dashed'
								items={thoughtItems}
								defaultExpandedKeys={[]}
							/>
						</Think>
					) : undefined,
					footer:
						isAiMessage && String(data.content ?? '') && !isStreaming ? (
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
		}),
		[
			completedThoughtChainItems,
			createAiActions,
			currentAiKey,
			sourcesMap,
			thinking,
			thoughtChainItems,
		],
	);

	const handleCancel = useCallback(() => {
		clearAllTimers();
		setThinking(false);
		setGenerating(false);
		setCurrentAiKey(null);
		const activeAiKey = currentAiKey;
		setMessages((prev) =>
			prev.map((item) =>
				item.key === activeAiKey
					? {
							...item,
							streaming: false,
						}
					: item,
			),
		);
	}, [clearAllTimers, currentAiKey]);

	return (
		<div className='flex-1 min-h-0 px-4 pb-4 flex flex-col gap-3'>
			{/* 内容区：包含 Prompts 或对话框 */}
			<div className='mx-auto flex flex-1 w-full max-w-md sm:max-w-2xl lg:max-w-4xl flex-col min-h-0'>
				{/* 未开始对话时：Prompts 垂直居中 */}
				{!hasUserMessage && <Prompt onItemClick={sendMessage} />}

				{/* 开始对话后：显示对话框 */}
				{hasUserMessage && (
					<div
						ref={conversationRef}
						className='conversation-scroll-area min-h-0 flex-1 overflow-y-auto rounded-2xl p-3 flex flex-col gap-4'
						style={{
							background: 'var(--app-panel)',
							scrollbarGutter: 'stable',
						}}
					>
						<Bubble.List
							items={messages}
							autoScroll={false}
							role={bubbleRole}
						/>
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
					onCancelAction={handleCancel}
				/>
			</div>
		</div>
	);
}
