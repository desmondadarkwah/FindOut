/**
 * Tests for the availability indicator.
 *
 * Availability is one of the two inputs the matching algorithm consumes, so
 * what this component displays has to correspond to what the server stores.
 * The contexts it depends on are replaced with doubles so the component can be
 * rendered in isolation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

const fetchUserDetails = vi.fn();
let userData = {};

vi.mock('../Context/EditUserContext', () => ({
  useEditUser: () => ({ userData, fetchUserDetails }),
}));

const setOpenManageUser = vi.fn();

vi.mock('../Context/SettingsContext', async () => {
  const React = await import('react');
  return {
    SettingsContext: React.createContext({ setOpenManageUser }),
  };
});

// Imported after the mocks so the component picks them up.
const { default: StatusUpdate } = await import('./StatusUpdate');
const { SettingsContext } = await import('../Context/SettingsContext');

const renderWith = (data) => {
  userData = data;
  return render(
    <SettingsContext.Provider value={{ setOpenManageUser }}>
      <StatusUpdate />
    </SettingsContext.Provider>
  );
};

describe('StatusUpdate', () => {
  beforeEach(() => {
    fetchUserDetails.mockClear();
    setOpenManageUser.mockClear();
  });

  it('fetches the user on mount, so the display reflects stored state', () => {
    renderWith({ status: 'Ready To Learn' });
    expect(fetchUserDetails).toHaveBeenCalled();
  });

  it('shows the teaching label for a teacher', () => {
    renderWith({ status: 'Ready To Teach' });
    expect(screen.getByText(/ready to teach/i)).toBeInTheDocument();
  });

  it('shows the learning label for a learner', () => {
    renderWith({ status: 'Ready To Learn' });
    expect(screen.getByText(/ready to learn/i)).toBeInTheDocument();
  });

  it('describes the consequence of each availability, not just its name', () => {
    renderWith({ status: 'Ready To Teach' });
    expect(screen.getByText(/shown to learners/i)).toBeInTheDocument();
  });

  it('warns that an unavailable user will not be suggested', () => {
    renderWith({ status: 'Later' });
    expect(screen.getByText(/not appear in match suggestions/i)).toBeInTheDocument();
  });

  it('falls back to unavailable when no status is stored', () => {
    renderWith({});
    expect(screen.getByText(/not available/i)).toBeInTheDocument();
  });

  it('falls back to unavailable for an unrecognised status', () => {
    // Guards against a value written by an older client or a migration.
    renderWith({ status: 'Something Else' });
    expect(screen.getByText(/not available/i)).toBeInTheDocument();
  });

  it('offers a control that opens the profile panel', async () => {
    const user = userEvent.setup();
    renderWith({ status: 'Ready To Learn' });

    const change = screen.getByRole('button', { name: /change/i });
    await user.click(change);

    expect(setOpenManageUser).toHaveBeenCalledWith(true);
  });

  it('presents the control as an enabled button', () => {
    // It was previously three disabled buttons that looked interactive.
    renderWith({ status: 'Ready To Learn' });
    expect(screen.getByRole('button', { name: /change/i })).toBeEnabled();
  });
});
