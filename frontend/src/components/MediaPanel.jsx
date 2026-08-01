import React, { useMemo, useState } from 'react';
import { X, Download, FileText, ImageIcon, Mic } from 'lucide-react';
import { formatBytes } from '../utils/formatBytes';
import moment from 'moment';

/**
 * Everything shared in a conversation, in one place.
 *
 * "Media & Files" was a menu item whose handler closed the menu. It reads the
 * messages the chat window already has rather than calling a new endpoint —
 * the thread is loaded in full, so the answer is on the client already.
 */

const TABS = [
  { id: 'media', label: 'Media', icon: ImageIcon, types: ['image'] },
  { id: 'files', label: 'Files', icon: FileText, types: ['file'] },
  { id: 'voice', label: 'Voice', icon: Mic, types: ['audio'] },
];

const MediaPanel = ({ messages = [], onClose, chatName }) => {
  const [tab, setTab] = useState('media');

  const grouped = useMemo(() => {
    const out = { media: [], files: [], voice: [] };
    for (const m of messages) {
      if (m.type === 'image') out.media.push(m);
      else if (m.type === 'file') out.files.push(m);
      else if (m.type === 'audio') out.voice.push(m);
    }
    // Newest first — the thing you are looking for is usually the last thing
    // that was sent.
    for (const key of Object.keys(out)) {
      out[key].reverse();
    }
    return out;
  }, [messages]);

  const items = grouped[tab];

  return (
    <aside
      className="flex h-full w-full flex-col border-l border-edge-subtle bg-surface-raised sm:w-[340px]"
      aria-label="Shared media and files"
    >
      <header className="flex items-center justify-between border-b border-edge-subtle px-4 py-3.5">
        <div className="min-w-0">
          <h2 className="text-[14px] font-semibold text-content-primary">Media &amp; files</h2>
          {chatName && (
            <p className="truncate text-[12px] text-content-muted">{chatName}</p>
          )}
        </div>
        <button
          onClick={onClose}
          aria-label="Close media and files"
          className="rounded-lg p-1.5 text-content-muted transition-colors hover:bg-surface-hover hover:text-content-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
        >
          <X size={18} />
        </button>
      </header>

      <div className="flex gap-1 border-b border-edge-subtle px-2 py-2" role="tablist">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[12px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 ${
              tab === id
                ? 'bg-primary-500/15 text-primary-300'
                : 'text-content-muted hover:bg-surface-hover hover:text-content-secondary'
            }`}
          >
            <Icon size={14} />
            {label}
            <span className="tabular-nums opacity-60">{grouped[id].length}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {items.length === 0 ? (
          <p className="px-2 py-10 text-center text-[13px] leading-relaxed text-content-muted">
            Nothing shared yet. Anything sent with the paperclip appears here.
          </p>
        ) : tab === 'media' ? (
          <div className="grid grid-cols-3 gap-1.5">
            {items.map((m) => (
              <a
                key={m._id}
                href={m.content}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square overflow-hidden rounded-lg bg-surface-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
                title={moment(m.createdAt).format('D MMM YYYY, h:mm A')}
              >
                <img
                  src={m.content}
                  alt={m.attachment?.name || 'Shared image'}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              </a>
            ))}
          </div>
        ) : (
          <ul className="space-y-1">
            {items.map((m) => (
              <li key={m._id}>
                <a
                  href={m.content}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={m.attachment?.name}
                  className="flex items-center gap-3 rounded-lg px-2.5 py-2.5 transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-500/12 text-primary-300">
                    {tab === 'voice' ? <Mic size={16} /> : <FileText size={16} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium text-content-primary">
                      {m.attachment?.name || (tab === 'voice' ? 'Voice message' : 'File')}
                    </span>
                    <span className="block text-[11px] text-content-muted">
                      {[formatBytes(m.attachment?.size), moment(m.createdAt).format('D MMM')]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  </span>
                  <Download size={15} className="shrink-0 text-content-muted" />
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
};

export default MediaPanel;
