/**
 * Tests for the FindOut mark.
 *
 * The one that matters is the unique-id test. The mark paints its two arcs
 * with SVG gradients referenced by id. Hard-code that id and the second mark
 * on a page points at the first one's <defs>; move or unmount the first and
 * the second loses its paint. Since the mark appears twice on several screens
 * — masthead and footer, page header and sidebar — that is a live risk.
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrandMark, BrandLockup } from './BrandMark';
import FindOutLoader from '../Loader/FindOutLoader';

const gradientIds = (container) =>
  [...container.querySelectorAll('linearGradient')].map(g => g.id);

describe('BrandMark', () => {
  it('gives every instance its own gradient ids', () => {
    const { container } = render(
      <>
        <BrandMark />
        <BrandMark />
        <BrandMark />
      </>
    );
    const ids = gradientIds(container);
    expect(ids).toHaveLength(6);
    expect(new Set(ids).size).toBe(6);
  });

  it('points each arc at a gradient that exists in its own svg', () => {
    const { container } = render(<><BrandMark /><BrandMark /></>);

    for (const svg of container.querySelectorAll('svg')) {
      const defined = new Set([...svg.querySelectorAll('linearGradient')].map(g => g.id));
      const referenced = [...svg.querySelectorAll('path')]
        .map(p => p.getAttribute('stroke').replace(/^url\(#|\)$/g, ''));

      expect(referenced).toHaveLength(2);
      for (const ref of referenced) expect(defined).toContain(ref);
    }
  });

  it('is hidden from assistive technology unless given a title', () => {
    const { container } = render(<BrandMark />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('is announced when given a title', () => {
    const { container } = render(<BrandMark title="FindOut" />);
    const svg = container.querySelector('svg');
    expect(svg).not.toHaveAttribute('aria-hidden');
    expect(svg).toHaveAttribute('role', 'img');
    expect(container.querySelector('title')).toHaveTextContent('FindOut');
  });

  it('draws the tile only when asked', () => {
    const { container: without } = render(<BrandMark />);
    expect(without.querySelector('rect')).toBeNull();

    const { container: with_ } = render(<BrandMark tile />);
    expect(with_.querySelector('rect')).not.toBeNull();
  });

  it('scales', () => {
    const { container } = render(<BrandMark size={64} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '64');
    // The viewBox is fixed, so the geometry never has to be recalculated.
    expect(svg).toHaveAttribute('viewBox', '0 0 32 32');
  });
});

describe('BrandLockup', () => {
  it('pairs the mark with the wordmark', () => {
    const { container, getByText } = render(<BrandLockup />);
    expect(container.querySelector('svg')).not.toBeNull();
    expect(getByText('FindOut')).toBeInTheDocument();
  });
});

describe('FindOutLoader', () => {
  it('spins the mark rather than a generic ring', () => {
    // The loader is the most-seen brand moment in the app, and it is on
    // screens no other test mounts.
    const { container } = render(<FindOutLoader />);
    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.querySelector('.animate-spin')).not.toBeNull();
  });

  it('stands still for a reader who has asked for less motion', () => {
    const { container } = render(<FindOutLoader />);
    expect(container.querySelector('.motion-reduce\\:animate-none')).not.toBeNull();
  });

  it('renders at every size it offers', () => {
    for (const size of ['small', 'medium', 'large']) {
      const { container } = render(<FindOutLoader size={size} />);
      expect(container.querySelector('svg')).not.toBeNull();
    }
  });
});
