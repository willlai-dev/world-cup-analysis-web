'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

export type TabItem = { id: string; label: string; content: React.ReactNode };

export function Tabs({ items, initialId }: { items: TabItem[]; initialId?: string }) {
  const [active, setActive] = useState(initialId ?? items[0]?.id);
  const activeItem = items.find((item) => item.id === active) ?? items[0];

  return (
    <div>
      <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-slate-200">
        {items.map((item) => (
          <button
            key={item.id}
            role="tab"
            aria-selected={item.id === active}
            onClick={() => setActive(item.id)}
            className={cn(
              'shrink-0 whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors',
              item.id === active
                ? 'border-b-2 border-brand-600 text-brand-700'
                : 'text-slate-500 hover:text-slate-800',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="pt-4">
        {activeItem?.content}
      </div>
    </div>
  );
}
