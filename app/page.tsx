'use client';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import ChatContent from '@/components/ChatContent';
import { XProvider } from '@ant-design/x';

export default function Home() {
	return (
		<XProvider>
			<div className='flex h-screen w-full [background:var(--app-bg)] [color:var(--app-text)] antialiased overflow-hidden'>
				<Sidebar />
				<main className='flex-1 flex flex-col relative min-w-0 [background:var(--app-bg)]'>
					<Header />
					<ChatContent />
				</main>
			</div>
		</XProvider>
	);
}
