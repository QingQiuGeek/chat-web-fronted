import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import ChatContent from '@/components/ChatContent';

export default function Home() {
	return (
		<div className='flex h-screen w-full bg-[#212121] text-[#ececec] antialiased overflow-hidden'>
			<Sidebar />
			<main className='flex-1 flex flex-col relative min-w-0 bg-[#212121]'>
				<Header />
				<ChatContent />
			</main>
		</div>
	);
}
