import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AiReportCard } from '@/components/ai/AiReportCard';
import { COPY } from '@/lib/constants';
import type { AiReport } from '@/types/api';

function makeReport(overrides: Partial<AiReport>): AiReport {
  return {
    id: 'r1',
    entityType: 'MATCH',
    reportType: 'ANALYSIS',
    provider: 'NVIDIA',
    language: 'zh-Hant',
    status: 'DONE',
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('AiReportCard states', () => {
  it('renders the "not generated" copy when report is null', () => {
    render(<AiReportCard report={null} />);
    expect(screen.getByTestId('ai-report-card')).toHaveAttribute('data-state', 'idle');
    expect(screen.getByText(COPY.aiPending)).toBeInTheDocument();
  });

  it('renders pending state', () => {
    render(<AiReportCard report={makeReport({ status: 'PENDING' })} />);
    expect(screen.getByTestId('ai-report-card')).toHaveAttribute('data-state', 'pending');
    expect(screen.getByText('AI 分析產生中…')).toBeInTheDocument();
  });

  it('renders failed state', () => {
    render(<AiReportCard report={makeReport({ status: 'FAILED' })} />);
    expect(screen.getByTestId('ai-report-card')).toHaveAttribute('data-state', 'failed');
    expect(screen.getByText(COPY.aiFailed)).toBeInTheDocument();
  });

  it('renders done content with provider badge', () => {
    render(<AiReportCard report={makeReport({ status: 'DONE', content: '這是分析內容', model: 'llama' })} />);
    expect(screen.getByTestId('ai-report-card')).toHaveAttribute('data-state', 'done');
    expect(screen.getByText('這是分析內容')).toBeInTheDocument();
    expect(screen.getByText(/NVIDIA/)).toBeInTheDocument();
  });

  it('renders loading state', () => {
    render(<AiReportCard isLoading />);
    expect(screen.getByTestId('ai-report-card')).toHaveAttribute('data-state', 'loading');
  });

  it('treats a DONE report with no content/structured data as insufficient_data', () => {
    render(<AiReportCard report={makeReport({ status: 'DONE', content: '   ' })} />);
    expect(screen.getByTestId('ai-report-card')).toHaveAttribute(
      'data-state',
      'insufficient_data',
    );
    expect(screen.getByText(COPY.insufficientData)).toBeInTheDocument();
  });

  it('shows a confidence badge in the done state when a score is present', () => {
    render(
      <AiReportCard
        report={makeReport({ status: 'DONE', content: '分析內容', confidenceScore: 0.82 })}
      />,
    );
    expect(screen.getByTestId('ai-confidence-badge')).toHaveTextContent('可信度 82%');
  });

  it('never dumps raw JSON content — renders a readable summary instead', () => {
    const json = JSON.stringify({ summary: '這是分析摘要', keyFactors: ['因素一'] });
    render(<AiReportCard report={makeReport({ status: 'DONE', content: json })} />);
    expect(screen.getByText('這是分析摘要')).toBeInTheDocument();
    expect(screen.getByText('因素一')).toBeInTheDocument();
    expect(screen.queryByText(/"summary"/)).not.toBeInTheDocument();
  });

  it('falls back to structuredJson when content is empty', () => {
    render(
      <AiReportCard
        report={makeReport({ status: 'DONE', content: null, structuredJson: { summary: '結構化摘要' } })}
      />,
    );
    expect(screen.getByText('結構化摘要')).toBeInTheDocument();
  });
});
