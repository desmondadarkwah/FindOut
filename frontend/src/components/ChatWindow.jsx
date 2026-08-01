import React, { useEffect, useState, useRef, useContext } from 'react';
import axiosInstance from '../utils/axiosInstance';
import socket from '../socket/socket';
import { RxAvatar } from "react-icons/rx";
import { FiPhone, FiPaperclip } from "react-icons/fi";
import { HiOutlineVideoCamera, HiDotsVertical } from "react-icons/hi";
import { MdOutlineKeyboardVoice, MdOutlineEmojiEmotions, MdDelete, MdSend } from "react-icons/md";
import { IoMdSend, IoMdArrowBack } from "react-icons/io";
import { BsPauseFill, BsPlayFill } from "react-icons/bs";
import moment from 'moment';
import { ChatContext } from '../Context/ChatContext';
import GroupOptions from './GroupOptions';
import EmojiPicker from 'emoji-picker-react';
import './Emoji.css';
import GroupProfile from './GroupProfile';
import ManageGroup from './ManageGroup';
import { SettingsContext } from '../Context/SettingsContext';
import ManageIndividual from './ManageIndividual';
import IndividualChatOptions from './IndividualChatOptions';
import { SuggestionsContext } from '../Context/SuggestionsContext';
import MediaPanel from './MediaPanel';
import { formatBytes } from '../utils/formatBytes';
import { isMuted, toggleMute } from '../utils/chatPrefs';
import { X, FileText, Download, BellOff, Loader2 } from 'lucide-react';

const ChatWindow = () => {
  // ═══════════════════════════════════════════════════════════════
  // STATE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [audioPlayingId, setAudioPlayingId] = useState(null);
  const [audioProgress, setAudioProgress] = useState({});
  const [audioDurations, setAudioDurations] = useState({});

  // Attachments
  const [pendingFile, setPendingFile] = useState(null);   // chosen, not yet sent
  const [pendingPreview, setPendingPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [attachError, setAttachError] = useState(null);
  const [showMediaPanel, setShowMediaPanel] = useState(false);
  const [muted, setMuted] = useState(false);
  const fileInputRef = useRef(null);

  // Voice Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioURL, setAudioURL] = useState(null);
  const [visualizerData, setVisualizerData] = useState([]);

  // Refs
  const emojiPickerRef = useRef(null);
  const messageEndRef = useRef(null);
  const audioRefs = useRef({});
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const timerRef = useRef(null);
  const customAudioPlayerRefs = useRef({});
  const progressIntervals = useRef({});

  // Context
  const { selectedChat, userId, setBarsToHidden, showChatOptions, setShowChatOptions, setChats, setSelectedChat } = useContext(ChatContext);
  const { openGroupManager, setOpenGroupManager } = useContext(SettingsContext);
  const { handleConnectPrivateChat } = useContext(SuggestionsContext);

  // ═══════════════════════════════════════════════════════════════
  // CLICK OUTSIDE HANDLING
  // ═══════════════════════════════════════════════════════════════

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && 
          !emojiPickerRef.current.contains(event.target) &&
          !event.target.closest('.emoji-trigger')) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // SOCKET EVENT LISTENERS
  // ═══════════════════════════════════════════════════════════════

  // Listen for chat updates
  useEffect(() => {
    if (!socket || !userId) return;

    const handleChatUpdated = (updatedChat) => {
      console.log('📨 Chat updated:', updatedChat._id);

      setChats(prevChats =>
        prevChats.map(chat => {
          if (chat._id === updatedChat._id) {
            const userUnread = updatedChat.unreadCount?.find(
              u => u.userId?.toString() === userId?.toString()
            );

            return {
              ...updatedChat,
              unreadCount: userUnread ? userUnread.count : 0
            };
          }
          return chat;
        })
      );
    };

    socket.on('chat-updated', handleChatUpdated);
    return () => socket.off('chat-updated', handleChatUpdated);
  }, [socket, userId, setChats]);

  // Listen for online status changes
  useEffect(() => {
    if (!socket || !userId) return;

    const handleUserStatusChanged = ({ userId: changedUserId, isOnline, lastSeen }) => {
      console.log(`👤 User ${changedUserId}: ${isOnline ? 'ONLINE' : 'OFFLINE'}`);
      
      setOnlineUsers(prev => ({
        ...prev,
        [changedUserId]: { isOnline, lastSeen }
      }));
    };

    socket.on('user-status-changed', handleUserStatusChanged);
    return () => socket.off('user-status-changed', handleUserStatusChanged);
  }, [socket, userId]);

  // Listen for messages being read
  useEffect(() => {
    if (!socket) return;

    const handleMessagesRead = ({ chatId, readerUserId, readAt }) => {
      if (chatId === selectedChat?._id) {
        console.log('✅ Messages read by:', readerUserId);
        
        setMessages(prevMessages =>
          prevMessages.map(msg => {
            const msgSenderId = msg.senderId._id || msg.senderId;
            if (msgSenderId === userId) {
              return { ...msg, status: 'read' };
            }
            return msg;
          })
        );
      }
    };

    socket.on('messages-read', handleMessagesRead);
    return () => socket.off('messages-read', handleMessagesRead);
  }, [socket, selectedChat, userId]);

  // Listen for messages being delivered
  useEffect(() => {
    if (!socket) return;

    const handleMessagesDelivered = ({ chatId, recipientUserId, deliveredAt }) => {
      if (chatId === selectedChat?._id) {
        console.log('✅ Messages delivered to:', recipientUserId);
        
        setMessages(prevMessages =>
          prevMessages.map(msg => {
            const msgSenderId = msg.senderId._id || msg.senderId;
            if (msgSenderId === userId && msg.status === 'sent') {
              return { ...msg, status: 'delivered', deliveredAt };
            }
            return msg;
          })
        );
      }
    };

    socket.on('messages-delivered', handleMessagesDelivered);
    return () => socket.off('messages-delivered', handleMessagesDelivered);
  }, [socket, selectedChat, userId]);

  // Listen for group member changes
useEffect(() => {
  if (!socket || !userId || !selectedChat) return;

  const handleMembersAdded = ({ groupId, newMembers, group }) => {
    if (selectedChat._id === groupId) {
      console.log('👥 Members added to current group');
      setSelectedChat(prevChat => ({
        ...prevChat,
        members: group.members
      }));
    }
  };

  const handleMemberJoined = ({ groupId, newMember, group }) => {
    if (selectedChat._id === groupId) {
      console.log('👤 New member joined current group');
      setSelectedChat(prevChat => ({
        ...prevChat,
        members: group.members
      }));
    }
  };

  // ✅ UPDATED: Handle member removed
  const handleMemberRemoved = ({ groupId, removedMemberId, group }) => {
    if (selectedChat._id === groupId) {
      console.log('👤 Member removed from group');
      setSelectedChat(group);
    }

    // If YOU were removed, it's handled by force-remove-chat
  };

  // ✅ UPDATED: Handle member left
  const handleMemberLeft = ({ groupId, leftMemberId, group }) => {
    if (selectedChat._id === groupId) {
      console.log('👤 Member left group');
      setSelectedChat(group);
    }
  };

  // ✅ NEW: Handle being forcibly removed while viewing the chat
  const handleForceRemoveChat = ({ groupId, groupName, reason }) => {
    if (selectedChat?._id === groupId) {
      console.log(`❌ You were ${reason} from ${groupName} - closing chat`);
      
      // ✅ Close the chat window
      setSelectedChat(null);
      setBarsToHidden(true); // Show sidebar
      
      // ✅ Remove from chats list
      setChats(prevChats => prevChats.filter(chat => chat._id !== groupId));
    }
  };

  socket.on('members-added', handleMembersAdded);
  socket.on('member-joined', handleMemberJoined);
  socket.on('member-removed', handleMemberRemoved);
  socket.on('member-left', handleMemberLeft);
  socket.on('force-remove-chat', handleForceRemoveChat); // ✅ NEW

  return () => {
    socket.off('members-added', handleMembersAdded);
    socket.off('member-joined', handleMemberJoined);
    socket.off('member-removed', handleMemberRemoved);
    socket.off('member-left', handleMemberLeft);
    socket.off('force-remove-chat', handleForceRemoveChat); // ✅ NEW
  };
}, [socket, userId, selectedChat, setSelectedChat, setChats, setBarsToHidden]);

  // ✅ NEW: Listen for system messages
  useEffect(() => {
    if (!socket || !selectedChat) return;

    const handleSystemMessage = ({ message }) => {
      if (message.chatId === selectedChat._id) {
        console.log('📢 System message received');
        setMessages(prevMessages => [...prevMessages, message]);
      }
    };

    socket.on('system-message', handleSystemMessage);

    return () => {
      socket.off('system-message', handleSystemMessage);
    };
  }, [socket, selectedChat]);

  // ═══════════════════════════════════════════════════════════════
  // MESSAGE LOADING & SOCKET HANDLERS
  // ═══════════════════════════════════════════════════════════════

  useEffect(() => {
    if (!selectedChat) return;

    const fetchMessages = async () => {
      try {
        const response = await axiosInstance.get(`/api/messages/${selectedChat._id}`);
        setMessages(response.data);
        console.log('📥 Messages loaded:', response.data.length);
      } catch (error) {
        console.error('❌ Error fetching messages:', error);
      }
    };

    fetchMessages();
    socket.emit('join-chat', selectedChat._id);

    const handleMessageReceived = (newMessage) => {
      console.log('📩 Message received:', newMessage._id);
    
      if (newMessage.chatId === selectedChat._id) {
        setMessages((prevMessages) => {
          const messageExists = prevMessages.some(msg => msg._id === newMessage._id);
    
          if (!messageExists && newMessage.senderId._id !== userId) {
            console.log('✅ Adding message from other user');
            return [...prevMessages, newMessage];
          }
          
          return prevMessages;
        });
      }
    
      setChats((prevChats) =>
        prevChats.map((chat) => {
          if (chat._id === newMessage.chatId) {
            return {
              ...chat,
              lastMessage: {
                content: newMessage.type === 'audio' ? 'Voice message' : newMessage.content,
                senderId: newMessage.senderId,
                type: newMessage.type,
                createdAt: newMessage.createdAt
              }
            };
          }
          return chat;
        }).sort((a, b) => {
          const aTime = a.lastMessage?.createdAt || a.createdAt;
          const bTime = b.lastMessage?.createdAt || b.createdAt;
          return new Date(bTime) - new Date(aTime);
        })
      );
    };

    const handleMessageConfirmed = ({ tempId, message }) => {
      console.log('✅ Message confirmed:', tempId, '→', message._id);
      
      setMessages((prevMessages) =>
        prevMessages.map(msg => msg._id === tempId ? message : msg)
      );
    };

    const handleMessageError = ({ tempId, error }) => {
      console.error('❌ Message failed:', tempId, error);
      
      setMessages((prevMessages) =>
        prevMessages.map(msg =>
          msg._id === tempId 
            ? { ...msg, error: true, errorMessage: error }
            : msg
        )
      );
    };

    socket.on('message-received', handleMessageReceived);
    socket.on('message-confirmed', handleMessageConfirmed);
    socket.on('message-error', handleMessageError);

    return () => {
      socket.off('message-received', handleMessageReceived);
      socket.off('message-confirmed', handleMessageConfirmed);
      socket.off('message-error', handleMessageError);
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      Object.values(audioRefs.current).forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
      Object.values(progressIntervals.current).forEach(interval => {
        clearInterval(interval);
      });
    };
  }, [selectedChat, userId, setChats]);

  // Reflect the stored preference whenever the open conversation changes.
  useEffect(() => {
    setMuted(isMuted(selectedChat?._id));
    setShowMediaPanel(false);
    clearPendingFile();
  }, [selectedChat?._id]);

  // Mark messages as read when opening chat
  useEffect(() => {
    if (!socket || !userId || !selectedChat) return;

    const timer = setTimeout(() => {
      socket.emit('mark-messages-read', {
        chatId: selectedChat._id,
        userId: userId
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [socket, userId, selectedChat]);

  // Tell server when actively viewing chat
  useEffect(() => {
    if (!socket || !userId || !selectedChat) return;

    socket.emit('viewing-chat', {
      chatId: selectedChat._id,
      userId: userId
    });

    return () => {
      socket.emit('left-chat-view');
    };
  }, [socket, userId, selectedChat]);

  // Auto-scroll to bottom
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ═══════════════════════════════════════════════════════════════
  // MESSAGE SENDING
  // ═══════════════════════════════════════════════════════════════

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const messageContent = input;
    const newMessage = {
      chatId: selectedChat._id,
      senderId: userId,
      content: messageContent,
      type: "text",
    };

    setInput('');

    socket.emit('send-message', newMessage, (response) => {
      if (response.status === 'success') {
        setMessages((prevMessages) => [...prevMessages, response.message]);

        setChats((prevChats) =>
          prevChats.map((chat) => {
            if (chat._id === selectedChat._id) {
              return {
                ...chat,
                lastMessage: {
                  content: messageContent,
                  senderId: { _id: userId },
                  type: 'text',
                  createdAt: new Date().toISOString()
                }
              };
            }
            return chat;
          }).sort((a, b) => {
            const aTime = a.lastMessage?.createdAt || a.createdAt;
            const bTime = b.lastMessage?.createdAt || b.createdAt;
            return new Date(bTime) - new Date(aTime);
          })
        );
      } else {
        console.error('❌ Error sending message:', response.error);
      }
    });

    setShowEmojiPicker(false);
  };

  const handleEmojiClick = (emojiObject) => {
    setInput(prevInput => prevInput + emojiObject.emoji);
  };

  // ═══════════════════════════════════════════════════════════════
  // AUDIO PLAYBACK
  // ═══════════════════════════════════════════════════════════════

  const toggleAudioPlayback = (audioId, audioSrc) => {
    const audioElement = customAudioPlayerRefs.current[audioId];
    if (!audioElement) return;

    if (audioPlayingId === audioId) {
      audioElement.pause();
      setAudioPlayingId(null);
      if (progressIntervals.current[audioId]) {
        clearInterval(progressIntervals.current[audioId]);
      }
    } else {
      if (audioPlayingId && customAudioPlayerRefs.current[audioPlayingId]) {
        customAudioPlayerRefs.current[audioPlayingId].pause();
        if (progressIntervals.current[audioPlayingId]) {
          clearInterval(progressIntervals.current[audioPlayingId]);
        }
      }

      audioElement.play().catch(e => console.error("❌ Audio play error:", e));
      setAudioPlayingId(audioId);
      progressIntervals.current[audioId] = setInterval(() => {
        if (audioElement.duration) {
          setAudioProgress(prev => ({
            ...prev,
            [audioId]: audioElement.currentTime / audioElement.duration
          }));
        }

        if (audioElement.ended) {
          setAudioPlayingId(null);
          clearInterval(progressIntervals.current[audioId]);
          setAudioProgress(prev => ({ ...prev, [audioId]: 0 }));
        }
      }, 50);
    }
  };

  const handleAudioLoad = (audioId, e) => {
    const duration = e.target.duration;
    if (isFinite(duration) && !isNaN(duration)) {
      setAudioDurations(prev => ({ ...prev, [audioId]: duration }));
    }
  };

  const formatAudioTime = (seconds) => {
    if (!isFinite(seconds) || isNaN(seconds)) return '0:00';
    const mins = Math.floor(Math.max(0, seconds) / 60);
    const secs = Math.floor(Math.max(0, seconds) % 60);
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  };

  const handleWaveformClick = (audioId, e) => {
    const audioElement = customAudioPlayerRefs.current[audioId];
    if (!audioElement || !audioDurations[audioId]) return;

    const waveformContainer = e.currentTarget;
    const bounds = waveformContainer.getBoundingClientRect();
    const clickPosition = (e.clientX - bounds.left) / bounds.width;

    if (isFinite(clickPosition) && clickPosition >= 0 && clickPosition <= 1) {
      audioElement.currentTime = clickPosition * audioDurations[audioId];
      setAudioProgress(prev => ({ ...prev, [audioId]: clickPosition }));

      if (audioPlayingId !== audioId) {
        toggleAudioPlayback(audioId);
      }
    }
  };

  const handleAudioError = (event, msg) => {
    if (event.target.src.startsWith('http') && !event.target.src.startsWith('blob:')) {
      fetchAudioAndCreateBlob(event.target.src, msg._id);
    }
  };

  const fetchAudioAndCreateBlob = async (url, messageId) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      audioRefs.current[messageId] = blobUrl;

      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg._id === messageId ? { ...msg, localAudioUrl: blobUrl } : msg
        )
      );
    } catch (error) {
      console.error('❌ Error fetching audio:', error);
    }
  };

  const generateWaveform = (messageId, progress) => {
    const bars = [];
    const numBars = 30;

    for (let i = 0; i < numBars; i++) {
      const angle = (i / numBars) * Math.PI;
      const height = 30 + Math.sin(angle * 2) * 20 + Math.cos(angle * 3) * 10;
      const isActive = i / numBars <= progress;

      bars.push({
        height: Math.max(20, Math.min(100, height)),
        isActive
      });
    }

    return bars;
  };

  // ═══════════════════════════════════════════════════════════════
  // VOICE RECORDING
  // ═══════════════════════════════════════════════════════════════

  const startVisualizer = (stream) => {
    if (!canvasRef.current) return;

    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    analyserRef.current = audioContextRef.current.createAnalyser();
    const source = audioContextRef.current.createMediaStreamSource(stream);
    source.connect(analyserRef.current);
    analyserRef.current.fftSize = 256;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const drawVisualizer = () => {
      animationRef.current = requestAnimationFrame(drawVisualizer);
      analyserRef.current.getByteFrequencyData(dataArray);
      canvasCtx.clearRect(0, 0, width, height);

      const barWidth = 2;
      const barSpacing = 2;
      const barCount = Math.floor(width / (barWidth + barSpacing));
      const samplingRate = Math.floor(bufferLength / barCount);

      for (let i = 0; i < barCount; i++) {
        let sumAmplitude = 0;
        for (let j = 0; j < samplingRate; j++) {
          const index = i * samplingRate + j;
          if (index < bufferLength) {
            sumAmplitude += dataArray[index];
          }
        }
        const barHeight = (sumAmplitude / samplingRate) * (height / 255) * 0.8;
        canvasCtx.fillStyle = '#ffffff';
        const x = i * (barWidth + barSpacing);
        const y = (height - barHeight) / 2;
        canvasCtx.fillRect(x, y, barWidth, barHeight);
      }

      setVisualizerData(dataArray);
    };

    drawVisualizer();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      const audioChunks = [];

      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      startVisualizer(stream);

      recorder.ondataavailable = (event) => audioChunks.push(event.data);
      recorder.onstop = () => {
        const blob = new Blob(audioChunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioURL(url);

        if (timerRef.current) clearInterval(timerRef.current);
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        setVisualizerData([]);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error("❌ Error starting recording:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const cancelRecording = () => {
    stopRecording();
    setAudioBlob(null);
    setAudioURL(null);
  };

  // ═══════════════════════════════════════════════════════════════
  // ATTACHMENTS
  // ═══════════════════════════════════════════════════════════════

  const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

  /**
   * Checked here as well as on the server so the reader is told immediately,
   * rather than after uploading ten megabytes to be refused.
   */
  const handleFileChosen = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';               // so re-picking the same file still fires
    if (!file) return;

    if (file.size > MAX_ATTACHMENT_BYTES) {
      setAttachError(`${file.name} is ${formatBytes(file.size)} — the limit is 10 MB.`);
      return;
    }

    setAttachError(null);
    setPendingFile(file);
    setPendingPreview(file.type.startsWith('image/') ? URL.createObjectURL(file) : null);
  };

  const clearPendingFile = () => {
    // Revoke, or the object URL keeps the file alive for the life of the tab.
    if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    setPendingFile(null);
    setPendingPreview(null);
    setAttachError(null);
  };

  const sendAttachment = async () => {
    if (!pendingFile || !selectedChat?._id || uploading) return;

    setUploading(true);
    setAttachError(null);

    const formData = new FormData();
    formData.append('file', pendingFile);
    formData.append('chatId', selectedChat._id);

    try {
      const { data } = await axiosInstance.post('/api/messages/attachment', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (data.success) {
        setMessages((prev) => [...prev, data.message]);

        socket.emit('send-attachment-message', {
          messageId: data.message._id,
          chatId: selectedChat._id,
        }, (res) => {
          if (res?.status !== 'success') {
            console.error('Could not announce the attachment:', res?.error);
          }
        });

        clearPendingFile();
      } else {
        setAttachError(data.message || 'The file could not be sent.');
      }
    } catch (err) {
      setAttachError(
        err.response?.data?.message ||
        'The file could not be sent. Check your connection and try again.'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleToggleMute = () => setMuted(toggleMute(selectedChat?._id));

  const sendVoiceMessage = async () => {
    if (!audioBlob) return;

    const formData = new FormData();
    formData.append("audio", audioBlob, "voiceMessage.webm");
    formData.append("chatId", selectedChat._id);
    formData.append("senderId", userId);

    try {
      const response = await axiosInstance.post('/api/messages/audio', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        const messageWithLocalUrl = {
          ...response.data.message,
          localAudioUrl: audioURL
        };

        setMessages((prevMessages) => [...prevMessages, messageWithLocalUrl]);

        socket.emit('send-audio-message', {
          messageId: response.data.message._id,
          chatId: selectedChat._id
        }, (response) => {
          if (response.status !== 'success') {
            console.error('❌ Error notifying about audio message:', response.error);
          }
        });
      }
      setAudioBlob(null);
      setAudioURL(null);
    } catch (error) {
      console.error("❌ Error sending voice message:", error);
    }
  };

  const formatTime = (seconds) => {
    if (!isFinite(seconds) || isNaN(seconds)) return '0:00';
    const mins = Math.floor(Math.max(0, seconds) / 60);
    const secs = Math.floor(Math.max(0, seconds) % 60);
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  };

  // ═══════════════════════════════════════════════════════════════
  // DATE GROUPING
  // ═══════════════════════════════════════════════════════════════

  const formatDateHeader = (timestamp) => {
    const messageDate = moment(timestamp);
    const today = moment().startOf('day');
    const yesterday = moment().subtract(1, 'day').startOf('day');

    if (messageDate.isSame(today, 'day')) return "Today";
    if (messageDate.isSame(yesterday, 'day')) return "Yesterday";
    if (messageDate.isAfter(moment().subtract(7, 'days'))) {
      return messageDate.format('dddd');
    }
    return messageDate.format('D MMMM YYYY');
  };

  const groupMessagesByDate = () => {
    const groupedMessages = [];
    let currentDate = null;

    messages.forEach((msg, index) => {
      const messageDate = moment(msg.createdAt).startOf('day').format('YYYY-MM-DD');

      if (messageDate !== currentDate) {
        currentDate = messageDate;
        groupedMessages.push({
          type: 'date',
          date: msg.createdAt,
          id: `date-${messageDate}`
        });
      }

      groupedMessages.push({
        type: 'message',
        message: msg,
        id: msg._id || `msg-${index}`
      });
    });

    return groupedMessages;
  };

  // ═══════════════════════════════════════════════════════════════
  // MESSAGE STATUS RENDERING
  // ═══════════════════════════════════════════════════════════════

  const renderMessageStatus = (msg) => {
    const msgSenderId = msg.senderId._id || msg.senderId;
    if (msgSenderId !== userId) return null;

    const status = msg.status || 'sent';

    switch (status) {
      case 'sending':
        return (
          <svg className="w-3 h-3 text-gray-400" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M8 4v4l3 3" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        );
      
      case 'sent':
        return (
          <svg className="w-4 h-4 text-gray-400" viewBox="0 0 16 16" fill="none">
            <path d="M13.5 4.5L6 12l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      
      case 'delivered':
        return (
          <svg className="w-4 h-4 text-gray-400" viewBox="0 0 16 16" fill="none">
            <path d="M14.5 4.5L7 12l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M11.5 4.5L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      
      case 'read':
        return (
          <svg className="w-4 h-4 text-blue-500" viewBox="0 0 16 16" fill="none">
            <path d="M14.5 4.5L7 12l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M11.5 4.5L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      
      default:
        return null;
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════

  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900 text-gray-400 h-screen">
        Select a chat to start messaging.
      </div>
    );
  }

  const groupedItems = groupMessagesByDate();

  return (
    <div className="flex w-full h-screen">
    <div className="flex h-screen min-w-0 flex-1 flex-col bg-surface-base text-content-primary">
      {/* HEADER */}
      <header className="flex items-center justify-between border-b border-edge-subtle bg-surface-base px-3 py-2.5">
        <IoMdArrowBack 
          size={20} 
          className='block lg:hidden cursor-pointer' 
          onClick={(e) => {
            e.stopPropagation();
            setBarsToHidden(true);
          }} 
        />
        
        <div className="flex items-center gap-2">
          <div
            onClick={() => setOpenGroupManager(true)}
            className="flex items-center gap-2 cursor-pointer">
            
            <div className="relative">
              {selectedChat.isGroup ? (
                <GroupProfile />
              ) : (
                (() => {
                  const otherParticipant = selectedChat.participants.find(p => p._id !== userId);
                  const isUserOnline = otherParticipant && onlineUsers[otherParticipant._id]?.isOnline;
                  
                  return (
                    <>
                      {otherParticipant?.profilePicture ? (
                        <img
                          src={
                            otherParticipant.profilePicture.startsWith('/uploads/')
                              ? `${import.meta.env.VITE_BACKEND_URL}${otherParticipant.profilePicture}`
                              : `${import.meta.env.VITE_BACKEND_URL}/uploads/${otherParticipant.profilePicture}`
                          }
                          alt={otherParticipant.name}
                          className="w-12 h-12 rounded-full object-cover border border-gray-700"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                          <RxAvatar size={24} className="text-gray-400" />
                        </div>
                      )}
                      
                      {isUserOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-950"></div>
                      )}
                    </>
                  );
                })()
              )}
            </div>

            <div className="flex min-w-0 flex-col">
              <h2 className="flex items-center gap-2 truncate text-[15px] font-semibold text-content-primary">
                {selectedChat.isGroup
                  ? selectedChat.groupName
                  : selectedChat.participants.find(p => p._id !== userId)?.name || "Unknown User"}
                {muted && (
                  <span
                    title="Notifications muted on this device"
                    className="inline-flex shrink-0 items-center gap-1 rounded-full bg-surface-overlay px-2 py-0.5 text-[10px] font-medium text-content-muted"
                  >
                    <BellOff size={10} /> Muted
                  </span>
                )}
              </h2>
              
              {!selectedChat.isGroup && (() => {
                const otherParticipant = selectedChat.participants.find(p => p._id !== userId);
                const userStatus = otherParticipant && onlineUsers[otherParticipant._id];
                
                if (userStatus?.isOnline) {
                  return <span className="text-[12px] text-success-400">Online</span>;
                } else if (userStatus?.lastSeen) {
                  return (
                    <span className="text-[12px] text-content-muted">
                      Last seen {moment(userStatus.lastSeen).fromNow()}
                    </span>
                  );
                }
                return null;
              })()}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => setShowMediaPanel(v => !v)}
            aria-label="Media and files"
            title="Media and files"
            className={`hidden rounded-lg p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 md:block ${
              showMediaPanel
                ? 'bg-primary-500/15 text-primary-300'
                : 'text-content-muted hover:bg-surface-hover hover:text-content-primary'
            }`}
          >
            <FileText size={18} />
          </button>
          <button type="button" aria-label="Voice call" title="Voice call"
            className="rounded-lg p-2 text-content-muted transition-colors hover:bg-surface-hover hover:text-content-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400">
            <FiPhone size={18} />
          </button>
          <button type="button" aria-label="Video call" title="Video call"
            className="rounded-lg p-2 text-content-muted transition-colors hover:bg-surface-hover hover:text-content-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400">
            <HiOutlineVideoCamera size={18} />
          </button>
          <button
            type="button"
            aria-label="Conversation options"
            className="rounded-lg p-2 text-content-muted transition-colors hover:bg-surface-hover hover:text-content-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
            onClick={(e) => {
              e.stopPropagation();
              setShowChatOptions(!showChatOptions);
            }}
          >
            <HiDotsVertical size={18} />
          </button>
          {showChatOptions && (
            selectedChat.isGroup
              ? <GroupOptions
                  muted={muted}
                  onToggleMute={handleToggleMute}
                  onOpenMedia={() => setShowMediaPanel(true)}
                />
              : <IndividualChatOptions
                  muted={muted}
                  onToggleMute={handleToggleMute}
                  onOpenMedia={() => setShowMediaPanel(true)}
                />
          )}
        </div>
        {openGroupManager && (
          selectedChat.isGroup ? <ManageGroup /> : <ManageIndividual />
        )}
      </header>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {groupedItems.map((item) => {
          if (item.type === 'date') {
            return (
              <div key={item.id} className="flex justify-center my-3">
                <div className="bg-gray-800 text-gray-300 text-xs font-medium px-4 py-1 rounded-full">
                  {formatDateHeader(item.date)}
                </div>
              </div>
            );
          }

          const msg = item.message;

          // ✅ NEW: Handle system messages
          if (msg.type === 'system') {
            return (
              <div key={item.id} className="flex justify-center my-2">
                <div className="bg-gray-800 text-gray-400 text-xs px-3 py-1 rounded-full">
                  <span className="font-medium text-blue-400">{msg.senderId?.name || 'Someone'}</span>
                  {' '}{msg.content}
                </div>
              </div>
            );
          }

          const index = messages.findIndex(m => m._id === msg._id);
          const isCurrentUserMessage = msg.senderId._id === userId;
          const audioSrc = msg.localAudioUrl || msg.content;
          const audioId = `audio-${item.id}`;
          const currentProgress = audioProgress[audioId] || 0;
          const waveData = msg.type === 'audio' ? generateWaveform(msg._id, audioPlayingId === audioId ? currentProgress : 0) : [];
          const isPreviousMessageFromSameSender = index > 0 && messages[index - 1].senderId._id === msg.senderId._id;
          const isGroupChat = selectedChat.isGroup;
          const shouldShowSenderName = !isCurrentUserMessage && !isPreviousMessageFromSameSender && isGroupChat;

          return (
            <div
              key={item.id}
              className={`flex ${isCurrentUserMessage ? 'justify-end' : 'justify-start'} ${!isPreviousMessageFromSameSender ? 'mt-3' : 'mt-0.5'}`}
            >
              {isGroupChat && !isCurrentUserMessage && !isPreviousMessageFromSameSender && (
                <div
                  onClick={() => handleConnectPrivateChat(msg.senderId._id)}
                  className="flex-shrink-0 self-end mr-1 mb-1 cursor-pointer">
                  {msg.senderId.profilePicture ? (
                    <img
                      src={
                        msg.senderId.profilePicture.startsWith('/uploads/')
                          ? `${import.meta.env.VITE_BACKEND_URL}${msg.senderId.profilePicture}`
                          : `${import.meta.env.VITE_BACKEND_URL}/uploads/${msg.senderId.profilePicture}`
                      }
                      className="w-8 h-8 rounded-full object-cover border border-gray-700"
                      alt={msg.senderId.name}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                      <RxAvatar size={24} className="text-gray-400" />
                    </div>
                  )}
                </div>
              )}

              <div className={`flex flex-col ${!isCurrentUserMessage && isGroupChat ? 'ml-1' : ''} max-w-[75%]`}>
                {shouldShowSenderName && (
                  <span className="text-xs font-medium" style={{ color: '#5dadec' }}>
                    <span
                      onClick={() => handleConnectPrivateChat(msg.senderId._id)}
                      className='text-xs cursor-pointer'>
                      {msg.senderId.name || "Unknown User"}
                    </span>
                  </span>
                )}

                <div className={`rounded-lg shadow-sm flex ${
                  msg.type === 'audio' || msg.type === 'image'
                    ? 'bg-transparent p-1'
                    : `px-3 py-2 ${isCurrentUserMessage ? 'bg-blue-700 text-white' : 'bg-gray-800 text-white'}`
                }`}>
                  <div className="flex-1 break-words pr-1">
                    {msg.type === 'audio' ? (
                      <div className="w-64 max-w-full">
                        <audio
                          ref={el => customAudioPlayerRefs.current[audioId] = el}
                          src={audioSrc}
                          preload="metadata"
                          onLoadedMetadata={(e) => handleAudioLoad(audioId, e)}
                          onError={(e) => handleAudioError(e, msg)}
                          className="hidden"
                        />

                        <div className={`rounded-full ${isCurrentUserMessage ? 'bg-blue-700' : 'bg-gray-700'} flex items-center p-1`}>
                          <button
                            onClick={() => toggleAudioPlayback(audioId, audioSrc)}
                            className="bg-white rounded-full p-1 flex items-center justify-center"
                          >
                            {audioPlayingId === audioId ? (
                              <BsPauseFill size={16} className="text-blue-600" />
                            ) : (
                              <BsPlayFill size={16} className="text-blue-600 ml-0.5" />
                            )}
                          </button>
                          <div className="flex-1 mx-2 cursor-pointer" onClick={(e) => handleWaveformClick(audioId, e)}>
                            <div className="flex items-center h-8">
                              {waveData.map((bar, i) => (
                                <div 
                                  key={i} 
                                  className="mx-[1px] transition-all duration-100"
                                  style={{
                                    height: `${bar.height}%`,
                                    width: '2px',
                                    backgroundColor: bar.isActive ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.4)',
                                    transform: bar.isActive ? 'scale(1.05)' : 'scale(1)'
                                  }} 
                                />
                              ))}
                            </div>
                          </div>
                          <div className="bg-white text-blue-600 px-2 py-1 rounded-full text-xs font-medium">
                            {audioDurations[audioId] !== undefined 
                              ? formatAudioTime(currentProgress * audioDurations[audioId]) 
                              : '0:00'}
                          </div>
                        </div>
                      </div>
                    ) : msg.type === 'image' ? (
                      <a
                        href={msg.content}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block overflow-hidden rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                      >
                        <img
                          src={msg.content}
                          alt={msg.attachment?.name || 'Shared image'}
                          loading="lazy"
                          className="max-h-72 w-auto max-w-full rounded-lg object-cover"
                        />
                      </a>
                    ) : msg.type === 'file' ? (
                      <a
                        href={msg.content}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={msg.attachment?.name}
                        className="flex min-w-[210px] items-center gap-3 rounded-md p-1 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/15">
                          <FileText size={18} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-medium">
                            {msg.attachment?.name || 'Attachment'}
                          </span>
                          <span className="block text-[11px] opacity-70">
                            {formatBytes(msg.attachment?.size)}
                          </span>
                        </span>
                        <Download size={16} className="shrink-0 opacity-80" />
                      </a>
                    ) : (
                      msg.content
                    )}
                  </div>
                  <div className={`flex items-center gap-1 self-end text-[10px] text-gray-400 ${
                    msg.type === 'image' ? 'absolute bottom-2 right-3 rounded bg-black/60 px-1.5 py-0.5' : 'ml-1'
                  }`}>
                    <span>{msg.createdAt ? moment(msg.createdAt).format('h:mm A') : ''}</span>
                    {renderMessageStatus(msg)}
                  </div>
                </div>
              </div>

              {isGroupChat && isCurrentUserMessage && !isPreviousMessageFromSameSender && (
                <div className="flex-shrink-0 self-end ml-1 mb-1">
                  {msg.senderId.profilePicture && msg.senderId._id !== userId ? (
                    <img
                      src={
                        msg.senderId.profilePicture.startsWith('/uploads/')
                          ? `${import.meta.env.VITE_BACKEND_URL}${msg.senderId.profilePicture}`
                          : `${import.meta.env.VITE_BACKEND_URL}/uploads/${msg.senderId.profilePicture}`
                      }
                      className="w-8 h-8 rounded-full object-cover border border-gray-700"
                      alt={msg.senderId.name}
                    />
                  ) : msg.senderId._id !== userId && (
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                      <RxAvatar size={24} className="text-gray-400" />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        <div ref={messageEndRef} />
      </div>

      {/* RECORDING UI */}
      {isRecording && (
        <div className="bg-gray-900 p-3 border-t border-gray-800">
          <div className="rounded-full bg-blue-600 flex items-center justify-between p-1 w-full">
            <div className="p-1">
              <div className="bg-white rounded-full p-1 flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse"></div>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center">
              <canvas ref={canvasRef} height="40" width="100%" className="px-2" />
            </div>

            <div className="bg-white text-blue-600 px-2 py-1 rounded-full text-xs font-medium">
              {formatTime(recordingTime)}
            </div>
          </div>

          <div className="flex justify-end mt-2">
            <button
              onClick={cancelRecording}
              className="p-2 bg-gray-700 rounded-full hover:bg-gray-600 mr-2"
            >
              <MdDelete size={20} />
            </button>
            <button
              onClick={stopRecording}
              className="p-2 bg-indigo-700 rounded-full hover:bg-indigo-600"
            >
              <MdSend size={20} />
            </button>
          </div>
        </div>
      )}

      {/* PREVIEW UI */}
      {audioURL && !isRecording && (
        <div className="bg-gray-900 p-3 border-t border-gray-800">
          <div className="rounded-full bg-blue-600 flex items-center p-1 w-full">
            <button
              onClick={() => {
                const audio = new Audio(audioURL);
                audio.play();
              }}
              className="bg-white rounded-full p-1 flex items-center justify-center"
            >
              <BsPlayFill size={16} className="text-blue-600 ml-0.5" />
            </button>

            <div className="flex-1 mx-2">
              <div className="flex items-center h-8">
                {Array.from({ length: 30 }).map((_, i) => {
                  const angle = (i / 30) * Math.PI;
                  const height = 30 + Math.sin(angle * 2) * 20 + Math.cos(angle * 3) * 10;
                  return (
                    <div
                      key={i}
                      className="mx-[1px]"
                      style={{
                        height: `${Math.max(15, height)}%`,
                        width: '2px',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)'
                      }}
                    />
                  );
                })}
              </div>
            </div>

            <div className="bg-white text-blue-600 px-2 py-1 rounded-full text-xs font-medium">
              {formatTime(recordingTime)}
            </div>
          </div>

          <div className="flex justify-end mt-2">
            <button
              onClick={cancelRecording}
              className="p-2 bg-gray-700 rounded-full hover:bg-gray-600 mr-2"
            >
              <MdDelete size={20} />
            </button>
            <button
              onClick={sendVoiceMessage}
              className="p-2 bg-indigo-700 rounded-full hover:bg-indigo-600"
            >
              <MdSend size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Chosen file, before it is sent. Sending is a separate, deliberate act:
          picking a file by accident should not put it in the conversation. */}
      {(pendingFile || attachError) && !isRecording && (
        <div className="border-t border-gray-900 bg-gray-950 px-3 py-2.5">
          {attachError && (
            <p role="alert" className="mb-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-[12px] text-rose-300">
              {attachError}
            </p>
          )}
          {pendingFile && (
            <div className="flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-900 p-2.5">
              {pendingPreview ? (
                <img src={pendingPreview} alt="" className="h-12 w-12 shrink-0 rounded-md object-cover" />
              ) : (
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-indigo-500/15 text-indigo-300">
                  <FileText size={20} />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-white">{pendingFile.name}</p>
                <p className="text-[11px] text-gray-400">{formatBytes(pendingFile.size)}</p>
              </div>
              <button
                type="button"
                onClick={clearPendingFile}
                disabled={uploading}
                aria-label="Remove attachment"
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white disabled:opacity-50"
              >
                <X size={16} />
              </button>
              <button
                type="button"
                onClick={sendAttachment}
                disabled={uploading}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {uploading && <Loader2 size={14} className="animate-spin" />}
                {uploading ? 'Sending…' : 'Send'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* INPUT */}
      {!isRecording && !audioURL && (
        <form onSubmit={handleSendMessage} className="flex items-center gap-1 border-t border-edge-subtle bg-surface-base px-3 py-3">
          <input
            ref={fileInputRef}
            type="file"
            hidden
            onChange={handleFileChosen}
            accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv,.zip"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Attach a photo or file"
            title="Attach a photo or file"
            className="rounded-lg p-2 text-content-muted transition-colors hover:bg-surface-hover hover:text-content-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
          >
            <FiPaperclip size={22} />
          </button>
          <button
            type="button"
            aria-label="Insert emoji"
            className="emoji-trigger rounded-lg p-2 text-content-muted transition-colors hover:bg-surface-hover hover:text-content-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <MdOutlineEmojiEmotions size={22} />
          </button>
          {showEmojiPicker && (
            <div ref={emojiPickerRef} className="absolute bottom-16">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}
          <input 
            type="text" 
            placeholder="Type a message" 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            className="mx-1 flex-1 rounded-lg border border-edge bg-surface-input px-3.5 py-2.5 text-[14px] text-content-primary outline-none transition-colors placeholder:text-content-muted focus:border-primary-500 focus:ring-2 focus:ring-primary-500/25" 
          />
          {input.trim() ? (
            <button
              type="submit"
              aria-label="Send message"
              className="rounded-lg bg-primary-500 p-2.5 text-white transition-colors hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
            >
              <IoMdSend size={18} />
            </button>
          ) : (
            <button
              type="button"
              aria-label="Record a voice message"
              title="Record a voice message"
              className="rounded-lg p-2 text-content-muted transition-colors hover:bg-surface-hover hover:text-primary-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
              onClick={startRecording}
            >
              <MdOutlineKeyboardVoice size={22} />
            </button>
          )}
        </form>
      )}
    </div>

    {/* Everything shared in this conversation. Hidden on small screens, where
        it would leave no room for the thread it describes. */}
    {showMediaPanel && (
      <div className="hidden md:flex">
        <MediaPanel
          messages={messages}
          chatName={selectedChat?.groupName || selectedChat?.name}
          onClose={() => setShowMediaPanel(false)}
        />
      </div>
    )}
    </div>
  );
};

export default ChatWindow;