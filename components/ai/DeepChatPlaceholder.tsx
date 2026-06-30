'use client';

import { PremiumGate } from '@/components/auth/RoleGate';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

// PREMIUM-only deep-chat entry point. Wiring lands in Phase 3; Phase 1 only
// proves role-gated visibility. USER sees a plain "can't use" notice.
export function DeepChatPlaceholder({ context }: { context: string }) {
  return (
    <PremiumGate feature="深層 AI 問答">
      <Card data-testid="deep-chat-panel">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>深層 AI 問答</CardTitle>
          <Badge tone="premium">PREMIUM</Badge>
        </CardHeader>
        <CardBody>
          <p className="text-sm text-slate-500">
            針對「{context}」的深層問答將於 Phase 3 開放。
          </p>
        </CardBody>
      </Card>
    </PremiumGate>
  );
}
