import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Markdown } from '@/components/ui/Markdown';

describe('Markdown', () => {
  it('renders headings, bold and lists', () => {
    render(
      <Markdown content={'## 冠軍預測\n\n**France** 具備最高奪冠傾向。\n\n- 攻擊火力強\n- 陣容深度足'} />,
    );

    // "## " → h3 (level+1).
    const heading = screen.getByRole('heading', { name: '冠軍預測' });
    expect(heading.tagName).toBe('H3');

    expect(screen.getByText('France').tagName).toBe('STRONG');

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('攻擊火力強');
  });

  it('renders ordered lists and links safely', () => {
    render(<Markdown content={'1. 第一\n2. 第二\n\n請見 [官網](https://example.com)。'} />);

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);

    const link = screen.getByRole('link', { name: '官網' });
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders plain prose as a paragraph', () => {
    render(<Markdown content="這是一段沒有標記的分析文字。" />);
    expect(screen.getByTestId('markdown')).toHaveTextContent('這是一段沒有標記的分析文字。');
  });
});
