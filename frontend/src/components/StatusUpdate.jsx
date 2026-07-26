import React, { useEffect, useContext } from "react";
import { useEditUser } from "../Context/EditUserContext";
import { SettingsContext } from "../Context/SettingsContext";

/* Same mapping as the profile panel, so a status looks identical everywhere. */
const STATUS_META = {
  "Ready To Teach": {
    label: "Ready to teach",
    dot: "bg-success-400",
    text: "text-success-400",
    ring: "ring-success-500/40",
    bg: "bg-success-500/10",
    detail: "You are shown to learners in your subjects.",
  },
  "Ready To Learn": {
    label: "Ready to learn",
    dot: "bg-primary-400",
    text: "text-primary-400",
    ring: "ring-primary-500/40",
    bg: "bg-primary-500/10",
    detail: "You are matched with people who can teach your subjects.",
  },
  Later: {
    label: "Not available",
    dot: "bg-warning-400",
    text: "text-warning-400",
    ring: "ring-warning-500/40",
    bg: "bg-warning-500/10",
    detail: "You will not appear in match suggestions.",
  },
};

const StatusUpdate = () => {
  const { userData, fetchUserDetails } = useEditUser();
  const { setOpenManageUser } = useContext(SettingsContext);

  useEffect(() => {
    fetchUserDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const meta = STATUS_META[userData.status] ?? STATUS_META.Later;

  /* Previously three disabled buttons. They looked interactive but could not
     be clicked, which reads as a broken control. This states the current value
     and offers the one action that actually changes it. */
  return (
    <section className="mb-8">
      <div className="card-glass flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${meta.dot}`}
            aria-hidden="true"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wide text-content-muted">
                Availability
              </span>
              <span
                className={`rounded-md px-2 py-0.5 text-xs font-medium ring-1 ${meta.bg} ${meta.text} ${meta.ring}`}
              >
                {meta.label}
              </span>
            </div>
            <p className="mt-1 text-xs text-content-muted">{meta.detail}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setOpenManageUser(true)}
          className="tile-accent shrink-0 px-3 py-1.5 text-xs font-semibold text-primary-300 transition-colors hover:bg-primary-500/15"
        >
          Change
        </button>
      </div>
    </section>
  );
};

export default StatusUpdate;
