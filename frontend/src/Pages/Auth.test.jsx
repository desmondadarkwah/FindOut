/**
 * Tests for the sign-in and sign-up screens.
 *
 * Most of these guard removals rather than features. A dead control is easy to
 * put back by accident — it looks like a missing feature to anyone who did not
 * know it never worked — so the absence of the Google button and of the
 * profile-picture input is asserted rather than assumed.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LoginUser from './LoginUser';
import RegisterUser from './RegisterUser';
import { ProfileContext } from '../Context/ProfileContext';
import { SuggestionsContext } from '../Context/SuggestionsContext';

const drawLogin = () =>
  render(
    <MemoryRouter>
      <ProfileContext.Provider value={{ fetchUserDetails: vi.fn() }}>
        <SuggestionsContext.Provider value={{ fetchSuggestions: vi.fn() }}>
          <LoginUser />
        </SuggestionsContext.Provider>
      </ProfileContext.Provider>
    </MemoryRouter>
  );

const drawRegister = () =>
  render(<MemoryRouter><RegisterUser /></MemoryRouter>);

describe.each([
  ['Log in', drawLogin],
  ['Sign up', drawRegister],
])('%s', (name, draw) => {
  it('offers no Google sign-in', () => {
    // There is no OAuth route in the backend; the button never had anything
    // to call.
    const { container } = draw();
    expect(container.textContent).not.toMatch(/google/i);
  });

  it('labels every input with a real label element', () => {
    const { container } = draw();
    const inputs = [...container.querySelectorAll('input')];
    expect(inputs.length).toBeGreaterThan(0);
    for (const input of inputs) {
      expect(
        container.querySelector(`label[for="${input.id}"]`),
        `input #${input.id || '(no id)'} has no label`
      ).not.toBeNull();
    }
  });

  it('hides the password until asked', async () => {
    const user = userEvent.setup();
    const { container } = draw();

    const password = container.querySelector('#password');
    expect(password).toHaveAttribute('type', 'password');

    await user.click(screen.getByRole('button', { name: /show password/i }));
    expect(password).toHaveAttribute('type', 'text');

    await user.click(screen.getByRole('button', { name: /hide password/i }));
    expect(password).toHaveAttribute('type', 'password');
  });

  it('links to the terms and privacy pages', () => {
    draw();
    expect(screen.getAllByRole('link', { name: /terms/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /privacy/i }).length).toBeGreaterThan(0);
  });
});

describe('Sign up', () => {
  it('asks for no profile picture', () => {
    // It was an unlabelled grey circle above the form, asking for a decision
    // before the account it belonged to existed. The server always treated it
    // as optional.
    const { container } = drawRegister();
    expect(container.querySelector('input[type="file"]')).toBeNull();
  });

  it('collects exactly a name, an email and a password', () => {
    const { container } = drawRegister();
    const ids = [...container.querySelectorAll('input')].map(i => i.id);
    expect(ids).toEqual(['name', 'email', 'password']);
  });

  it('sends people to log in, not to sign up again', () => {
    drawRegister();
    expect(screen.getByRole('link', { name: /^log in$/i })).toBeInTheDocument();
  });
});

describe('Log in', () => {
  it('asks for an email, not for a phone number or username', () => {
    // The old placeholder read "Phone number, username, or email". The server
    // authenticates on email alone, so two thirds of that was untrue.
    const { container } = drawLogin();
    const email = container.querySelector('#email');
    expect(email).toHaveAttribute('type', 'email');
    expect(container.textContent).not.toMatch(/phone number/i);
  });

  it('sends people to sign up, not to log in again', () => {
    drawLogin();
    expect(screen.getByRole('link', { name: /create an account/i })).toBeInTheDocument();
  });
});
