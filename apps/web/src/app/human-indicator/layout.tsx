import { type ReactNode } from 'react';
import { BottomNav } from '@/components/ui';
import ToastContainer from '@/components/ui/ToastContainer';

interface HumanIndicatorLayoutProps {
  children: ReactNode;
}

export default function HumanIndicatorLayout({ children }: HumanIndicatorLayoutProps) {
  return (
    <div className="flex flex-col flex-1 bg-[var(--bg-primary)]">
      <main className="flex-1 pb-20">{children}</main>
      <BottomNav />
      <ToastContainer />
    </div>
  );
}
