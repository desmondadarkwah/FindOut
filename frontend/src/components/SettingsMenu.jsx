import React, { useContext, useState } from "react";
import { FaRegEdit } from "react-icons/fa";
import { MdReportGmailerrorred } from "react-icons/md";
import { MdOutlineLightMode, MdOutlineDarkMode } from "react-icons/md";
import { BsDoorOpen } from "react-icons/bs";
import { SettingsContext } from "../Context/SettingsContext";
import { useEditUser } from "../Context/EditUserContext";
import { IoClose } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../Context/ThemeContext";
import { useToast } from "../Context/ToastContext";

const SettingsMenu = () => {
  const { openSettings, setOpenSettings, openManageUser, setOpenManageUser } = useContext(SettingsContext);
  const { editUserDetails } = useEditUser();
  const [showInput, setShowInput] = useState(false);
  const [subject, setSubject] = useState("");
  const { theme, toggleTheme } = useTheme();
  const { toast, confirm } = useToast();

  const navigate = useNavigate();

  const toggleInput = () => setShowInput(!showInput);
  const handleInputChange = (e) => setSubject(e.target.value);

  // FIX: was using native alert() for feedback — every other part of the
  // app (ManageGroup, ExploreGroups, Suggestions, etc.) uses toast. This
  // was the one holdout still popping browser alerts.
  const handleSubmit = () => {
    if (subject.trim()) {
      editUserDetails({ subjects: [subject] });
      setSubject("");
      toast.success("Subject updated successfully!");
    } else {
      toast.error("Please enter a valid subject.");
    }
  };

  // FIX: this called closeSettings() itself, and the button's own onClick
  // called it again right after — same redundant double-close pattern
  // fixed earlier in DashSidebar.jsx's handleEditClick.
  const handleEditClick = () => {
    setOpenManageUser(!openManageUser);
    closeSettings();
  };

  const closeSettings = () => setOpenSettings(false);

  // FIX: "Report a Problem" previously just closed the panel — it looked
  // like it submitted something but silently did nothing. There's no
  // generic app-level report endpoint yet (ReportModal only handles
  // user/post/group reports), so rather than fake a submission, this is
  // honest about not being wired up yet.
  const handleReportProblem = () => {
    toast.info("Problem reporting is coming soon.");
    closeSettings();
  };

  // FIX: replaced a ~60-line hand-rolled logout confirm modal (its own
  // local state, its own backdrop, its own portal-less positioning) with
  // the same confirm() flow already used everywhere else in the app
  // (GroupOptions, ManageGroup, IndividualChatOptions, IconsSidebar) —
  // one consistent confirmation pattern instead of two different ones.
  const handleLogoutClick = async () => {
    const confirmed = await confirm({
      title: 'Log Out',
      message: "Are you sure you want to log out? You'll need to sign in again to access your account.",
      confirmText: 'Log Out',
      cancelText: 'Cancel',
      confirmStyle: 'danger',
    });
    if (!confirmed) return;

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  const menuItem = {
    width: '100%',
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '11px 14px', borderRadius: 10,
    border: '1px solid transparent',
    background: 'none', cursor: 'pointer',
    fontSize: 14, fontWeight: 500,
    color: 'var(--text-secondary)',
    transition: 'all 0.2s',
    textAlign: 'left',
  };

  const menuItemHoverIn = (e) => {
    e.currentTarget.style.background = 'rgba(99,102,241,0.1)';
    e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)';
    e.currentTarget.style.color = '#818cf8';
  };
  const menuItemHoverOut = (e) => {
    e.currentTarget.style.background = 'none';
    e.currentTarget.style.borderColor = 'transparent';
    e.currentTarget.style.color = 'var(--text-secondary)';
  };

  return (
    <>
      {/* Backdrop */}
      {openSettings && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={closeSettings}
        />
      )}

      {/* Settings Panel */}
      <div style={{
        position: 'fixed', left: 0, top: 0,
        height: '100%', width: 240,
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        padding: '20px 12px',
        zIndex: 50,
        transform: openSettings ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease',
        boxShadow: '4px 0 24px rgba(0,0,0,0.4)',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 28, padding: '0 4px',
        }}>
          <span style={{
            fontSize: 16, fontWeight: 700, color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
          }}>Settings</span>
          <button
            onClick={closeSettings}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 8, cursor: 'pointer',
              padding: 6, display: 'flex', alignItems: 'center',
              color: 'var(--text-secondary)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <IoClose size={18} />
          </button>
        </div>

        {/* Menu Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>

          {/* Edit Profile */}
          <button
            style={menuItem}
            onClick={handleEditClick}
            onMouseEnter={menuItemHoverIn}
            onMouseLeave={menuItemHoverOut}
          >
            <FaRegEdit size={16} />
            Edit Profile
          </button>

          {/* Theme Toggle */}
          <button
            style={menuItem}
            onClick={toggleTheme}
            onMouseEnter={menuItemHoverIn}
            onMouseLeave={menuItemHoverOut}
          >
            {theme === 'dark'
              ? <MdOutlineLightMode size={17} color="#fbbf24" />
              : <MdOutlineDarkMode size={17} color="#6366f1" />
            }
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}

            {/* Toggle switch */}
            <div style={{
              marginLeft: 'auto',
              width: 36, height: 18, borderRadius: 99,
              background: theme === 'dark' ? 'var(--bg-card-hover)' : '#6366f1',
              position: 'relative', transition: 'background 0.3s',
              flexShrink: 0,
            }}>
              <span style={{
                position: 'absolute', top: 2,
                left: theme === 'dark' ? 2 : 18,
                width: 14, height: 14, borderRadius: '50%',
                background: '#fff',
                transition: 'left 0.3s',
                boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
              }} />
            </div>
          </button>

          {/* Subjects */}
          <button
            style={menuItem}
            onClick={toggleInput}
            onMouseEnter={menuItemHoverIn}
            onMouseLeave={menuItemHoverOut}
          >
            Subjects
          </button>

          {showInput && (
            <div style={{ padding: '8px 4px' }}>
              <input
                type="text"
                value={subject}
                onChange={handleInputChange}
                style={{
                  width: '100%', padding: '10px 12px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 10, color: 'var(--text-primary)',
                  fontSize: 13, outline: 'none',
                  boxSizing: 'border-box',
                }}
                placeholder="Type your subject..."
              />
              <button
                onClick={handleSubmit}
                style={{
                  marginTop: 8, width: '100%', padding: '10px',
                  background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
                  border: 'none', borderRadius: 10,
                  color: '#fff', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Save Subject
              </button>
            </div>
          )}

          {/* Report a Problem */}
          <button
            style={menuItem}
            onClick={handleReportProblem}
            onMouseEnter={menuItemHoverIn}
            onMouseLeave={menuItemHoverOut}
          >
            <MdReportGmailerrorred size={17} />
            Report a Problem
          </button>

          {/* Divider */}
          <div style={{
            margin: '8px 0',
            borderTop: '1px solid var(--border)',
          }} />

          {/* Logout */}
          <button
            style={{ ...menuItem, color: '#f87171' }}
            onClick={handleLogoutClick}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
              e.currentTarget.style.borderColor = 'rgba(239,68,68,0.15)';
              e.currentTarget.style.color = '#f87171';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'none';
              e.currentTarget.style.borderColor = 'transparent';
              e.currentTarget.style.color = '#f87171';
            }}
          >
            <BsDoorOpen size={16} />
            Log Out
          </button>
        </div>

        {/* Version */}
        <div style={{
          padding: '12px 4px 0',
          borderTop: '1px solid var(--border)',
        }}>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, textAlign: 'center' }}>
            FindOut v1.0.0
          </p>
        </div>
      </div>
    </>
  );
};

export default SettingsMenu;