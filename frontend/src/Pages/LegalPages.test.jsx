/**
 * Tests for the public information pages.
 *
 * The one that earns its place is the index/clause agreement check. Each legal
 * page declares its contents in a SECTIONS array and its body as separate
 * <Clause> elements; nothing links the two. Add a section to the list and
 * forget the clause and you ship a contents entry whose anchor goes nowhere —
 * which no build step would catch.
 */

import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import About from './About';
import Terms from './Terms';
import Privacy from './Privacy';

const draw = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe.each([
  ['Terms', Terms],
  ['Privacy', Privacy],
])('%s', (name, Page) => {
  it('gives every contents entry a clause to link to', () => {
    const { container } = draw(<Page />);
    const index = screen.getByRole('navigation', { name: 'Sections' });

    const anchors = within(index).getAllByRole('link');
    expect(anchors.length).toBeGreaterThan(0);

    for (const a of anchors) {
      const id = a.getAttribute('href').replace('#', '');
      expect(
        container.querySelector(`#${id}`),
        `contents lists "${a.textContent.trim()}" but no clause has id "${id}"`
      ).not.toBeNull();
    }
  });

  it('numbers its clauses from one, without gaps', () => {
    const { container } = draw(<Page />);
    const index = screen.getByRole('navigation', { name: 'Sections' });
    const count = within(index).getAllByRole('link').length;

    // Clause headings carry their number; the last must equal the count.
    const headings = container.querySelectorAll('main h2');
    expect(headings.length).toBe(count);
    expect(headings[0].textContent).toMatch(/^1/);
    expect(headings[count - 1].textContent).toMatch(new RegExp(`^${count}`));
  });

  it('states when it takes effect', () => {
    draw(<Page />);
    expect(screen.getByText('Version in force from')).toBeInTheDocument();
    expect(screen.getByText('Last updated')).toBeInTheDocument();
  });

  it('links to the other public pages', () => {
    draw(<Page />);
    const footer = screen.getByRole('contentinfo');
    for (const label of ['About', 'Terms', 'Privacy']) {
      expect(within(footer).getByRole('link', { name: label })).toBeInTheDocument();
    }
  });
});

describe('About', () => {
  it('adds the worked example up correctly', () => {
    // The ledger is the page's central claim. If the rows and the total ever
    // disagree, the page is arguing against itself in public.
    draw(<About />);
    const rows = [20, 10, 10, 4, 3];
    const total = rows.reduce((a, b) => a + b, 0);

    for (const n of new Set(rows)) {
      expect(screen.getAllByText(`+${n}`).length).toBeGreaterThan(0);
    }
    expect(screen.getByText(String(total))).toBeInTheDocument();
  });

  it('describes the badge without overstating it', () => {
    draw(<About />);
    expect(screen.getByText(/not a qualification/i)).toBeInTheDocument();
  });

  it('offers a way to sign up', () => {
    draw(<About />);
    expect(screen.getAllByRole('link', { name: /create an account/i }).length).toBeGreaterThan(0);
  });
});
