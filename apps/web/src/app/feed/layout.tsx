import { type ReactNode } from 'react';
import { BottomNav } from '@/components/ui';
import ToastContainer from '@/components/ui/ToastContainer';

interface FeedLayoutProps {
  children: ReactNode;
}

export default function FeedLayout({ children }: FeedLayoutProps) {
  return (
    <div className="flex flex-col flex-1 bg-[var(--bg-primary)]">
      <main className="flex-1 pb-20">{children}</main>
      <BottomNav />
      <ToastContainer />
    </div>
  );
}
