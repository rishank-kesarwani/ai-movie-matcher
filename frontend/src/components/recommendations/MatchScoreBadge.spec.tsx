import React from 'react';
import { render, screen } from '@testing-library/react';
import { MatchScoreBadge } from './MatchScoreBadge';

describe('MatchScoreBadge', () => {
  it('should render score percentage text', () => {
    render(<MatchScoreBadge score={94} size="md" />);
    expect(screen.getByText('94% Match')).toBeInTheDocument();
  });

  it('should render correct class styling for high match score', () => {
    const { container } = render(<MatchScoreBadge score={95} size="lg" />);
    expect(container.firstChild).toHaveClass('from-emerald-500/20');
  });
});
