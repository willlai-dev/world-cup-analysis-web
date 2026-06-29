'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  useAdminUsers,
  useUpdateUserRole,
  useDeleteUser,
} from '@/features/admin/use-admin';
import type { AdminUserListParams } from '@/features/admin/admin-api';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants';
import { routes } from '@/lib/routes';
import { formatDate } from '@/lib/formatters';
import { PageHeading } from '@/components/layout/PageHeading';
import { FilterBar } from '@/components/ui/FilterBar';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/states';
import type { UserRole, UserStatus, User } from '@/types/api';

const ROLE_OPTIONS = [
  { label: 'USER', value: 'USER' },
  { label: 'PREMIUM', value: 'PREMIUM' },
  { label: 'ADMIN', value: 'ADMIN' },
];

export default function AdminAccountsPage() {
  const [filters, setFilters] = useState<AdminUserListParams>({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    search: '',
    role: '',
    status: '',
  });
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const query = useAdminUsers(filters);
  const updateRole = useUpdateUserRole();
  const deleteUser = useDeleteUser();

  const update = (patch: Partial<AdminUserListParams>) =>
    setFilters((prev) => ({ ...prev, ...patch, page: patch.page ?? 1 }));
  const pagination = query.data?.pagination;

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteUser.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
  };

  return (
    <div>
      <PageHeading
        title="帳號管理"
        description="管理所有使用者帳號的角色與狀態。"
        action={
          <Link href={routes.admin.createAccount}>
            <Button size="sm">新增帳號</Button>
          </Link>
        }
      />

      <FilterBar>
        <Input
          label="搜尋"
          placeholder="email 或名稱"
          value={filters.search ?? ''}
          onChange={(e) => update({ search: e.target.value })}
        />
        <Select
          label="角色"
          placeholder="全部角色"
          options={ROLE_OPTIONS}
          value={filters.role ?? ''}
          onChange={(e) => update({ role: e.target.value as UserRole | '' })}
        />
        <Select
          label="狀態"
          placeholder="全部狀態"
          options={[
            { label: 'ACTIVE', value: 'ACTIVE' },
            { label: 'DISABLED', value: 'DISABLED' },
          ]}
          value={filters.status ?? ''}
          onChange={(e) => update({ status: e.target.value as UserStatus | '' })}
        />
      </FilterBar>

      {query.isLoading ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : !query.data || query.data.users.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white">
          <Table>
            <THead>
              <TR>
                <TH>Email</TH>
                <TH>顯示名稱</TH>
                <TH>角色</TH>
                <TH>狀態</TH>
                <TH>建立時間</TH>
                <TH>操作</TH>
              </TR>
            </THead>
            <TBody>
              {query.data.users.map((user) => (
                <TR key={user.id}>
                  <TD className="font-medium text-slate-900">{user.email}</TD>
                  <TD>{user.displayName}</TD>
                  <TD>
                    <Select
                      options={ROLE_OPTIONS}
                      value={user.role}
                      aria-label={`變更 ${user.email} 的角色`}
                      onChange={(e) =>
                        updateRole.mutate({ userId: user.id, role: e.target.value as UserRole })
                      }
                    />
                  </TD>
                  <TD>
                    <Badge tone={user.status === 'ACTIVE' ? 'success' : 'danger'}>
                      {user.status}
                    </Badge>
                  </TD>
                  <TD>{formatDate(user.createdAt)}</TD>
                  <TD>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setDeleteTarget(user)}
                    >
                      刪除
                    </Button>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
          {pagination && (
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(page) => update({ page })}
            />
          )}
        </div>
      )}

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="刪除帳號"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>
              取消
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={deleteUser.isPending}
              onClick={confirmDelete}
            >
              確認刪除
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          確定要刪除帳號 <span className="font-medium">{deleteTarget?.email}</span> 嗎？此操作無法復原。
        </p>
      </Modal>
    </div>
  );
}
