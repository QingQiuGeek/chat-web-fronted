'use client';

import {
	ApiOutlined,
	AudioOutlined,
	CloudUploadOutlined,
	PaperClipOutlined,
	SearchOutlined,
	OpenAIOutlined,
	AntDesignOutlined,
} from '@ant-design/icons';
import { Attachments, type AttachmentsProps, Sender } from '@ant-design/x';
import {
	Button,
	Divider,
	Flex,
	message,
	theme,
	type GetProp,
	type GetRef,
} from 'antd';
import { useEffect, useRef, useState } from 'react';

type SpeechRecognitionResultLike = {
	transcript?: string;
};

type SpeechRecognitionEventLike = {
	results?: ArrayLike<ArrayLike<SpeechRecognitionResultLike>>;
};

type SpeechRecognitionLike = {
	lang: string;
	continuous: boolean;
	interimResults: boolean;
	onstart: (() => void) | null;
	onend: (() => void) | null;
	onerror: (() => void) | null;
	onresult: ((event: SpeechRecognitionEventLike) => void) | null;
	start: () => void;
	stop: () => void;
};

type WindowWithSpeechRecognition = Window & {
	SpeechRecognition?: new () => SpeechRecognitionLike;
	webkitSpeechRecognition?: new () => SpeechRecognitionLike;
};

interface ChatSenderProps {
	value: string;
	onChangeAction: (value: string) => void;
	onSubmitAction: (value: string) => void;
	onCancelAction?: () => void;
	loading?: boolean;
}

export default function ChatSender({
	value,
	onChangeAction,
	onSubmitAction,
	onCancelAction,
	loading = false,
}: ChatSenderProps) {
	const { token } = theme.useToken();

	const [deepThinking, setDeepThinking] = useState(false);
	const [webSearch, setWebSearch] = useState(false);
	const [agentMode, setAgentMode] = useState(false);
	const [isRecording, setIsRecording] = useState(false);

	const [open, setOpen] = useState(false);
	const [attachments, setAttachments] = useState<
		GetProp<AttachmentsProps, 'items'>
	>([]);

	const senderRef = useRef<GetRef<typeof Sender>>(null);
	const attachmentsRef = useRef<GetRef<typeof Attachments>>(null);
	const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
	const valueRef = useRef(value);
	const objectUrlMapRef = useRef<Map<string, string>>(new Map());

	const iconStyle = {
		fontSize: 15,
		color: token.colorText,
	};

	const getAttachmentUid = (
		item: NonNullable<GetProp<AttachmentsProps, 'items'>>[number],
	) => String(item.uid ?? item.name ?? 'unknown');

	const revokeAllObjectUrls = () => {
		objectUrlMapRef.current.forEach((url) => {
			URL.revokeObjectURL(url);
		});
		objectUrlMapRef.current.clear();
	};

	const cleanupRemovedObjectUrls = (
		nextList: GetProp<AttachmentsProps, 'items'> = [],
	) => {
		const activeUids = new Set(nextList.map((item) => getAttachmentUid(item)));
		objectUrlMapRef.current.forEach((url, uid) => {
			if (!activeUids.has(uid)) {
				URL.revokeObjectURL(url);
				objectUrlMapRef.current.delete(uid);
			}
		});
	};

	useEffect(() => {
		valueRef.current = value;
	}, [value]);

	useEffect(() => {
		if (typeof window === 'undefined') return;
		const speechWindow = window as WindowWithSpeechRecognition;

		const SpeechRecognitionCtor =
			speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;

		if (!SpeechRecognitionCtor) {
			return;
		}

		const recognition = new SpeechRecognitionCtor();
		recognition.lang = 'zh-CN';
		recognition.continuous = false;
		recognition.interimResults = false;

		recognition.onstart = () => {
			setIsRecording(true);
		};

		recognition.onend = () => {
			setIsRecording(false);
		};

		recognition.onerror = () => {
			setIsRecording(false);
			message.warning('语音识别启动失败，请检查麦克风权限。');
		};

		recognition.onresult = (event: SpeechRecognitionEventLike) => {
			const transcript = event?.results?.[0]?.[0]?.transcript?.trim?.();
			if (!transcript) return;

			const nextValue = valueRef.current
				? `${valueRef.current} ${transcript}`
				: transcript;
			onChangeAction(nextValue);
		};

		recognitionRef.current = recognition;

		return () => {
			recognitionRef.current?.stop?.();
			recognitionRef.current = null;
		};
	}, [onChangeAction]);

	useEffect(() => {
		return () => {
			revokeAllObjectUrls();
		};
	}, []);

	const normalizeAttachmentItems = (
		fileList: GetProp<AttachmentsProps, 'items'> = [],
	): GetProp<AttachmentsProps, 'items'> =>
		fileList.map((item) => {
			const uid = getAttachmentUid(item);
			const mimeType = item.type ?? '';
			const isImage = mimeType.startsWith('image/');

			if (!isImage) {
				return item;
			}

			let src = item.thumbUrl ?? item.url;

			if (!src && item.originFileObj instanceof Blob) {
				const cached = objectUrlMapRef.current.get(uid);
				if (cached) {
					src = cached;
				} else {
					const objectUrl = URL.createObjectURL(item.originFileObj);
					objectUrlMapRef.current.set(uid, objectUrl);
					src = objectUrl;
				}
			}

			return {
				...item,
				cardType: 'image',
				src,
				imageProps: {
					preview: true,
					style: {
						width: '100%',
						height: 220,
						objectFit: 'cover',
					},
				},
			};
		});

	const handleVoiceClick = () => {
		if (!recognitionRef.current) {
			message.info('当前浏览器不支持语音识别，请使用 Chrome 或 Edge。');
			return;
		}

		try {
			if (isRecording) {
				recognitionRef.current.stop();
				return;
			}
			recognitionRef.current.start();
		} catch {
			message.warning('无法启动语音识别，请检查麦克风权限。');
		}
	};

	const handleSubmit = (nextValue: string) => {
		if (loading) return;
		const text = (nextValue ?? valueRef.current ?? '').trim();
		if (!text) return;

		recognitionRef.current?.stop?.();
		setIsRecording(false);
		onSubmitAction(text);
		revokeAllObjectUrls();
		setAttachments([]);
		setOpen(false);
	};

	const senderHeader = (
		<Sender.Header
			title='Attachments'
			open={open}
			onOpenChange={setOpen}
			forceRender
			styles={{
				content: {
					padding: 0,
				},
			}}
		>
			<Attachments
				ref={attachmentsRef}
				beforeUpload={() => false}
				multiple
				items={attachments}
				overflow='wrap'
				onChange={({ fileList }) => {
					const normalized = normalizeAttachmentItems(fileList);
					cleanupRemovedObjectUrls(normalized);
					setAttachments(normalized);
				}}
				placeholder={(type) =>
					type === 'drop'
						? {
								title: 'Drop file here',
							}
						: {
								icon: <CloudUploadOutlined />,
								title: 'Upload files',
								description: 'Click or drag files to this area to upload',
							}
				}
				getDropContainer={() => senderRef.current?.nativeElement}
			/>
		</Sender.Header>
	);

	return (
		<Sender
			className='chat-sender'
			ref={senderRef}
			header={senderHeader}
			value={value}
			disabled={loading}
			loading={loading}
			onChange={(nextValue) => {
				valueRef.current = nextValue;
				onChangeAction(nextValue);
			}}
			suffix={false}
			autoSize={{ minRows: 1, maxRows: 6 }}
			placeholder='请输入内容，回车发送'
			submitType='enter'
			onPasteFile={(files) => {
				for (const file of files) {
					attachmentsRef.current?.upload(file);
				}
				setOpen(true);
			}}
			onSubmit={handleSubmit}
			onCancel={() => {
				recognitionRef.current?.stop?.();
				setIsRecording(false);
				onCancelAction?.();
				setOpen(false);
			}}
			footer={(actionsNode) => {
				return (
					<Flex
						justify='space-between'
						align='center'
						gap='small'
						wrap
					>
						<Flex
							gap='small'
							align='center'
							wrap
						>
							<Sender.Switch
								icon={<OpenAIOutlined />}
								value={deepThinking}
								onChange={setDeepThinking}
							>
								Deep Thinking
							</Sender.Switch>
							<Divider orientation='vertical' />
							<Sender.Switch
								icon={<SearchOutlined />}
								value={webSearch}
								onChange={setWebSearch}
							>
								Web Search
							</Sender.Switch>
							<Divider orientation='vertical' />
							<Sender.Switch
								icon={<AntDesignOutlined />}
								value={agentMode}
								onChange={setAgentMode}
							>
								Agent Mode
							</Sender.Switch>
						</Flex>
						<Flex
							align='center'
							gap='small'
						>
							<Sender.Switch
								icon={<ApiOutlined />}
								style={iconStyle}
							>
								Skill & MCP
							</Sender.Switch>
							<Divider orientation='vertical' />

							<Button
								style={iconStyle}
								type='text'
								icon={<PaperClipOutlined />}
								onClick={() => setOpen((prev) => !prev)}
							/>
							<Divider orientation='vertical' />
							<Button
								type='text'
								style={{
									...iconStyle,
									color: isRecording ? '#ff4d4f' : iconStyle.color,
								}}
								icon={<AudioOutlined />}
								onClick={handleVoiceClick}
							/>
							<Divider orientation='vertical' />
							{actionsNode}
						</Flex>
					</Flex>
				);
			}}
		/>
	);
}
