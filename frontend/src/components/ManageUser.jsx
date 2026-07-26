import React, { useState, useContext, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import UserProfile from "./UserProfile";
import { useEditUser } from "../Context/EditUserContext";
import { IoClose } from "react-icons/io5";
import { SettingsContext } from "../Context/SettingsContext";

/* Status options are data, not markup. Each carries its own semantic colour so
   the meaning is defined once and cannot drift between screens. */
const STATUS_OPTIONS = [
  {
    value: "Ready To Teach",
    label: "Ready to teach",
    hint: "You will be shown to learners in your subjects",
    dot: "bg-success-400",
    activeRing: "ring-success-500/60",
    activeBg: "bg-success-500/10",
    activeText: "text-success-400",
  },
  {
    value: "Ready To Learn",
    label: "Ready to learn",
    hint: "You will be matched with people who can teach",
    dot: "bg-primary-400",
    activeRing: "ring-primary-500/60",
    activeBg: "bg-primary-500/10",
    activeText: "text-primary-400",
  },
  {
    value: "Later",
    label: "Not available",
    hint: "You will not appear in match suggestions",
    dot: "bg-warning-400",
    activeRing: "ring-warning-500/60",
    activeBg: "bg-warning-500/10",
    activeText: "text-warning-400",
  },
];

/* ---------------------------------------------------------------------------
   PhotoDialog

   Previously this was an `absolute top-full` panel anchored inside the
   scrolling form. Absolute positioning removes an element from normal flow, so
   it painted on top of the fields beneath it instead of displacing them — the
   overlap seen in the bug report. Raising z-index would not have fixed it: the
   element still occupies no space, so it will always cover whatever follows.

   A fixed-position dialog with its own backdrop cannot overlap page content,
   because it is no longer positioned relative to it.
   ------------------------------------------------------------------------- */
const PhotoDialog = ({ open, onClose, onUpload }) => {
  const uploadRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    // Move focus into the dialog so keyboard users are not left behind it.
    uploadRef.current?.focus();

    /* No scroll lock here. The profile panel behind this dialog already locks
       the body, and having two components write the same style meant whichever
       cleanup ran last won — which could leave `overflow: hidden` stuck on the
       body after both unmounted, freezing scrolling on every page. */
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      /* Above the profile panel, which sits at 9001. */
      style={{ zIndex: 9100 }}
      className="fixed inset-0 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="photo-dialog-title"
    >
      {/* Backdrop — click to dismiss */}
      <div
        className="absolute inset-0 bg-surface-sunken/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-sm rounded-xl bg-surface-overlay p-5 shadow-elev-4 animate-dialog-in">
        <h3
          id="photo-dialog-title"
          className="text-base font-semibold text-content-primary"
        >
          Profile photo
        </h3>
        <p className="mt-1 text-sm text-content-muted">
          JPG or PNG, up to 2&nbsp;MB.
        </p>

        <div className="mt-5 space-y-2">
          <button
            ref={uploadRef}
            type="button"
            onClick={onUpload}
            className="flex w-full items-center gap-3 rounded-lg bg-primary-500/15 px-4 py-3 text-sm font-medium text-primary-300 transition-colors hover:bg-primary-500/25"
          >
            <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0L8 8m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
            </svg>
            Choose a file
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg bg-surface-hover px-4 py-3 text-sm font-medium text-content-secondary transition-colors hover:bg-edge hover:text-content-primary"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const ManageUser = () => {
  const { userData, editUserDetails, fetchUserDetails, loading } = useEditUser();
  const { setOpenManageUser } = useContext(SettingsContext);

  const [subjects, setSubjects] = useState("");
  const [status, setStatus] = useState("Later");
  const [allowUpload, setAllowUploads] = useState(false);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);

  /* userData arrives asynchronously. Initialising state directly from it in
     useState captures only the first render's value, so the form stayed empty
     when the fetch resolved after mount. Syncing in an effect fixes that.

     `subjects` is a string array on the server; it is edited here as a single
     comma-separated field and converted back on save. */
  useEffect(() => {
    if (!userData) return;
    setSubjects(
      Array.isArray(userData.subjects) ? userData.subjects.join(", ") : ""
    );
    if (userData.status) setStatus(userData.status);
  }, [userData]);

  /* Escape closes the panel, and the page behind it must not scroll while it
     is open. The photo dialog handles its own Escape, and because its listener
     is registered later it runs first — so Escape closes the dialog before it
     closes the panel. */
  /* Scroll lock: mount/unmount only. Deliberately has no dependencies, so it
     cannot re-run and re-capture a already-locked value as the "previous"
     state. Always restores to empty rather than to a captured value. */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  /* Escape closes the panel, unless the photo dialog is open and should
     consume the key first. */
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape" && !photoDialogOpen) setOpenManageUser(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [photoDialogOpen, setOpenManageUser]);

  const handleChangePhotoClick = () => {
    setAllowUploads(true);
    setPhotoDialogOpen(false);
    document.getElementById("file-input")?.click();
  };

  const handleSaveChanges = async () => {
    const subjectList = subjects
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    // editUserDetails raises its own success/error toast.
    await editUserDetails({ subjects: subjectList, status });
    await fetchUserDetails();
    setOpenManageUser(false);
  };

  const activeStatus = STATUS_OPTIONS.find((o) => o.value === status);

  /* Rendered through a portal into document.body.

     The panel previously lived inside the dashboard tree, where an ancestor of
     the suggestions rail sets `backdrop-blur` and `sticky`. Both create their
     own stacking context, and a stacking context confines its children's
     z-index to that context — so no z-index on a nested sibling could reliably
     paint above it. That is why the suggestions list bled through the panel.

     A portal moves this subtree out to document.body, escaping every ancestor
     stacking context, so the z-index scale in tailwind.config.js applies
     against the page as a whole. */
  return createPortal(
    <>
      {/* Backdrop — dims the page and gives a click target to dismiss.
          z-index is set inline rather than through a Tailwind class: this
          layer must win regardless of whether a custom config value has been
          picked up by the running build. */}
      <div
        style={{ zIndex: 9000 }}
        className="fixed inset-0 bg-surface-sunken/80 backdrop-blur-sm animate-fade-in"
        onClick={() => setOpenManageUser(false)}
        aria-hidden="true"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Manage profile"
        style={{ zIndex: 9001 }}
        className="fixed right-0 top-0 flex h-full w-full flex-col bg-surface-raised shadow-elev-4 md:w-[420px] animate-slide-in"
      >
        {/* ---------------------------------------------------------------- */}
        {/* Header                                                            */}
        {/* ---------------------------------------------------------------- */}
        <header className="flex shrink-0 items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-base font-semibold text-content-primary">
              Manage profile
            </h1>
            <p className="mt-0.5 text-xs text-content-muted">
              Controls how you appear in match suggestions
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpenManageUser(false)}
            aria-label="Close profile panel"
            className="rounded-lg bg-surface-hover p-2 text-content-muted transition-colors hover:bg-edge hover:text-content-primary"
          >
            <IoClose size={18} />
          </button>
        </header>

        {/* ---------------------------------------------------------------- */}
        {/* Body                                                              */}
        {/* ---------------------------------------------------------------- */}
        <div className="scrollbar-slim flex-1 overflow-y-auto px-6 py-6">
          {/* Identity card */}
          <section className="rounded-xl bg-surface-overlay p-4">
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <UserProfile allowUpload={allowUpload} />
                <span
                  className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-surface-overlay ${
                    activeStatus?.dot ?? "bg-content-muted"
                  }`}
                  aria-hidden="true"
                />
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="truncate text-sm font-semibold text-content-primary">
                  {userData?.name || "—"}
                </h2>
                <p className="mt-0.5 truncate text-xs text-content-muted">
                  {userData?.email || ""}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setPhotoDialogOpen(true)}
                className="shrink-0 rounded-lg bg-surface-hover px-3 py-1.5 text-xs font-medium text-content-secondary transition-colors hover:bg-edge hover:text-content-primary"
              >
                Change photo
              </button>
            </div>
          </section>

          {/* Subjects */}
          <section className="mt-6">
            <label
              htmlFor="subjects-input"
              className="block text-sm font-medium text-content-primary"
            >
              Subjects
            </label>
            <p className="mt-1 text-xs text-content-muted">
              Separate with commas. These drive who you are matched with.
            </p>
            <input
              id="subjects-input"
              type="text"
              value={subjects}
              onChange={(e) => setSubjects(e.target.value)}
              placeholder="Calculus, Data Structures, Statistics"
              className="mt-2.5 w-full rounded-lg bg-surface-input px-3.5 py-2.5 text-sm text-content-primary placeholder-content-muted ring-1 ring-inset ring-edge-subtle transition-shadow focus:outline-none focus:ring-2 focus:ring-primary-500"
            />

            {/* Live preview of how the entry will be stored */}
            {subjects.trim() && (
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {subjects
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
                  .map((s, i) => (
                    <li
                      key={`${s}-${i}`}
                      className="rounded-md bg-surface-hover px-2 py-1 text-xs text-content-secondary"
                    >
                      {s}
                    </li>
                  ))}
              </ul>
            )}
          </section>

          {/* Availability */}
          <fieldset className="mt-6">
            <legend className="text-sm font-medium text-content-primary">
              Availability
            </legend>
            <p className="mt-1 text-xs text-content-muted">
              Matching pairs opposite roles, so this determines who you see.
            </p>

            <div className="mt-2.5 space-y-2">
              {STATUS_OPTIONS.map((option) => {
                const selected = status === option.value;
                return (
                  <label
                    key={option.value}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg px-3.5 py-3 transition-colors ${
                      selected
                        ? `${option.activeBg} ring-1 ${option.activeRing}`
                        : "bg-surface-overlay hover:bg-surface-hover"
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={option.value}
                      checked={selected}
                      onChange={(e) => setStatus(e.target.value)}
                      className="sr-only"
                    />
                    <span
                      className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                        selected ? option.dot : "bg-edge-strong"
                      }`}
                      aria-hidden="true"
                    />
                    <span className="min-w-0">
                      <span
                        className={`block text-sm font-medium ${
                          selected ? option.activeText : "text-content-secondary"
                        }`}
                      >
                        {option.label}
                      </span>
                      <span className="mt-0.5 block text-xs text-content-muted">
                        {option.hint}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Footer                                                            */}
        {/* ---------------------------------------------------------------- */}
        <footer className="shrink-0 px-6 py-4">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setOpenManageUser(false)}
              className="rounded-lg bg-surface-hover px-4 py-2.5 text-sm font-medium text-content-secondary transition-colors hover:bg-edge hover:text-content-primary"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveChanges}
              disabled={loading}
              className="flex flex-1 items-center justify-center rounded-lg bg-gradient-to-r from-primary-500 to-accent-500 px-4 py-2.5 text-sm font-semibold text-white shadow-elev-2 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Saving…" : "Save changes"}
            </button>
          </div>
        </footer>
      </aside>

      <PhotoDialog
        open={photoDialogOpen}
        onClose={() => setPhotoDialogOpen(false)}
        onUpload={handleChangePhotoClick}
      />
    </>,
    document.body
  );
};

export default ManageUser;
