/**
 * Tests for the post overflow menu.
 *
 * Every item in this menu was unreachable in the running application: the feed
 * held one `dropdownRef` for all posts, so it pointed at the last one, and a
 * mousedown inside any other post's menu counted as "outside". The menu closed
 * between mousedown and mouseup and the item's onClick never fired. These
 * tests pin the part that lives in this component — that each instance acts on
 * the id it was handed — and use real pointer events so a click that only
 * survives a synthetic `.click()` cannot pass.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PostSettings from './PostSettings';
import { PostContext } from '../Context/PostContext';
import { ChatContext } from '../Context/ChatContext';

const renderMenu = ({ postId = 'post-1', authorId = 'someone-else', userId = 'me', onClose = vi.fn() } = {}) => {
  render(
    <PostContext.Provider value={{ deletePost: vi.fn() }}>
      <ChatContext.Provider value={{ userId }}>
        <PostSettings postId={postId} authorId={authorId} onClose={onClose} />
      </ChatContext.Provider>
    </PostContext.Provider>
  );
  return { onClose };
};

describe('PostSettings', () => {
  let writeText;

  /**
   * userEvent.setup() installs its own clipboard stub, so ours has to go in
   * afterwards or every writeText assertion silently sees zero calls.
   */
  const setupUser = () => {
    const user = userEvent.setup();
    writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText }, configurable: true, writable: true,
    });
    return user;
  };

  beforeEach(() => {
    writeText = vi.fn().mockResolvedValue(undefined);
  });

  it('copies a link to the post it was given', async () => {
    const user = setupUser();
    renderMenu({ postId: 'abc123' });

    await user.click(screen.getByText('Copy link'));

    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/post/abc123`)
    );
  });

  it('uses each menu\'s own id, not a shared one', async () => {
    // The feed renders one of these per post. If identity leaked between them
    // — as it did through the shared ref — every menu would act on the same
    // post.
    const user = setupUser();
    const { unmount } = render(
      <PostContext.Provider value={{ deletePost: vi.fn() }}>
        <ChatContext.Provider value={{ userId: 'me' }}>
          <PostSettings postId="first" authorId="other" onClose={vi.fn()} />
        </ChatContext.Provider>
      </PostContext.Provider>
    );
    await user.click(screen.getByText('Copy link'));
    await waitFor(() =>
      expect(writeText).toHaveBeenLastCalledWith(`${window.location.origin}/post/first`)
    );
    unmount();

    render(
      <PostContext.Provider value={{ deletePost: vi.fn() }}>
        <ChatContext.Provider value={{ userId: 'me' }}>
          <PostSettings postId="second" authorId="other" onClose={vi.fn()} />
        </ChatContext.Provider>
      </PostContext.Provider>
    );
    await user.click(screen.getByText('Copy link'));
    await waitFor(() =>
      expect(writeText).toHaveBeenLastCalledWith(`${window.location.origin}/post/second`)
    );
  });

  it('confirms in place rather than through a blocking dialog', async () => {
    const user = setupUser();
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    renderMenu();

    await user.click(screen.getByText('Copy link'));

    expect(await screen.findByText('Link copied')).toBeInTheDocument();
    // An alert here fires behind the native share sheet on mobile.
    expect(alertSpy).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it('says so when the copy could not be made', async () => {
    const user = setupUser();
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined, configurable: true, writable: true,
    });
    document.execCommand = vi.fn(() => false);
    renderMenu();

    await user.click(screen.getByText('Copy link'));

    expect(await screen.findByText(/could not copy/i)).toBeInTheDocument();
  });

  it('offers Report on another student\'s post but not Delete', () => {
    renderMenu({ userId: 'me', authorId: 'someone-else' });
    expect(screen.getByText('Report')).toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  it('offers Delete on your own post but not Report', () => {
    renderMenu({ userId: 'me', authorId: 'me' });
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.queryByText('Report')).not.toBeInTheDocument();
  });

  it('matches ids across types, so an ObjectId still counts as your own post', () => {
    // userId and authorId arrive as a string from one source and an
    // ObjectId-like object from another.
    renderMenu({ userId: 'abc', authorId: { toString: () => 'abc' } });
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('acknowledges a report', async () => {
    const user = setupUser();
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const { onClose } = renderMenu({ userId: 'me', authorId: 'other' });

    await user.click(screen.getByText('Report'));

    expect(alertSpy).toHaveBeenCalledWith(expect.stringMatching(/reported/i));
    expect(onClose).toHaveBeenCalled();
    alertSpy.mockRestore();
  });
});
