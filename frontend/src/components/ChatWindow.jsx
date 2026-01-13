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
import UserProfile from './UserProfile';
import ManageGroup from './ManageGroup';
import { SettingsContext } from '../Context/SettingsContext';
import ManageIndividual from './ManageIndividual';
import IndividualChatOptions from './IndividualChatOptions';
import { SuggestionsContext } from '../Context/SuggestionsContext';

const ChatWindow = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const [openMessageMenuId, setOpenMessageMenuId] = useState(null);
  const emojiPickerRef = useRef(null);
  const messageEndRef = useRef(null);
  const { selectedChat, userId, setBarsToHidden, showChatOptions, setShowChatOptions, setChats } = useContext(ChatContext);
  const { openGroupManager, setOpenGroupManager } = useContext(SettingsContext);
  const { handleConnectPrivateChat } = useContext(SuggestionsContext)
  const audioRefs = useRef({});
  const [audioPlayingId, setAudioPlayingId] = useState(null);
  const [audioProgress, setAudioProgress] = useState({});
  const [audioDurations, setAudioDurations] = useState({});

  // Voice Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioURL, setAudioURL] = useState(null);
  const [visualizerData, setVisualizerData] = useState([]);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const timerRef = useRef(null);
  const customAudioPlayerRefs = useRef({});
  const progressIntervals = useRef({});

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target) &&
        !event.target.closest('.emoji-trigger')) {
        setShowEmojiPicker(false);
      }

      // Close message menu when clicking outside
      if (!event.target.closest('.message-menu') && openMessageMenuId) {
        setOpenMessageMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMessageMenuId]);

  useEffect(() => {
    if (selectedChat) {
      const fetchMessages = async () => {
        try {
          const response = await axiosInstance.get(`/api/messages/${selectedChat._id}`);
          setMessages(response.data);
          // console.log('selectChat: ', selectedChat);
          console.log('messsages: ', response.data);
          console.log('userId: ', userId);
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      };
      fetchMessages();
      socket.emit('join-chat', selectedChat._id);

      const handleMessageReceived = (newMessage) => {
        if (newMessage.chatId === selectedChat._id) {
          // Check if message already exists and sender is not current user
          const messageExists = messages.some(msg => msg._id === newMessage._id);
          if (!messageExists && newMessage.senderId._id !== userId) {
            setMessages((prevMessages) => [...prevMessages, newMessage]);
          }
        }


        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat._id === newMessage.chatId
              ? {
                ...chat,
                lastMessage: {
                  content: newMessage.type === 'audio' ? 'Voice message' : newMessage.content,
                  senderId: newMessage.senderId,
                  type: newMessage.type,
                  createdAt: newMessage.createdAt
                }
              }
              : chat
          ).sort((a, b) => {
            const aTime = a.lastMessage?.createdAt || a.createdAt;
            const bTime = b.lastMessage?.createdAt || b.createdAt;
            return new Date(bTime) - new Date(aTime);
          })
        );
      };




      socket.on('message-received', handleMessageReceived);
      return () => {
        socket.off('message-received', handleMessageReceived);
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
    }
  }, [selectedChat, userId]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);





  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!input.trim()) return;
    const newMessage = {
      chatId: selectedChat._id,
      senderId: userId,
      content: input,
      type: "text",
    };
    setInput('');
    socket.emit('send-message', newMessage, (response) => {
      if (response.status === 'success') {
        setMessages((prevMessages) => [...prevMessages, response.message]);
      } else {
        console.error('Error sending message:', response.error);
      }
    });
    setShowEmojiPicker(false);
  };

  const handleEmojiClick = (emojiObject) => {
    setInput(prevInput => prevInput + emojiObject.emoji);
  };

  // const handleMessageClick = (e, messageId) => {
  //   // If we're clicking on buttons or menus, don't do anything
  //   if (e.target.closest('button') || e.target.closest('.message-menu')) {
  //     return;
  //   }

  //   // Otherwise, toggle the message menu
  //   setOpenMessageMenuId(openMessageMenuId === messageId ? null : messageId);
  // };

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

      audioElement.play().catch(e => console.error("Audio play error:", e));
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
          setAudioProgress(prev => ({
            ...prev,
            [audioId]: 0
          }));
        }
      }, 50);
    }
  };

  const handleAudioLoad = (audioId, e) => {
    const duration = e.target.duration;
    if (isFinite(duration) && !isNaN(duration)) {
      setAudioDurations(prev => ({
        ...prev,
        [audioId]: duration
      }));
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
      setAudioProgress(prev => ({
        ...prev,
        [audioId]: clickPosition
      }));

      if (audioPlayingId !== audioId) {
        toggleAudioPlayback(audioId);
      }
    }
  };

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

        if (timerRef.current) {
          clearInterval(timerRef.current);
        }

        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }

        setVisualizerData([]);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
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
            console.error('Error notifying about audio message:', response.error);
          }
        });
      }
      setAudioBlob(null);
      setAudioURL(null);
    } catch (error) {
      console.error("Error sending voice message:", error);
    }
  };

  const formatTime = (seconds) => {
    if (!isFinite(seconds) || isNaN(seconds)) return '0:00';
    const mins = Math.floor(Math.max(0, seconds) / 60);
    const secs = Math.floor(Math.max(0, seconds) % 60);
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
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
      console.error('Error fetching audio:', error);
    }
  };

  // Generate waveform for audio messages
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

  // Create a function to format timestamps like professional messaging apps
  // const formatMessageTime = (timestamp) => {
  //   const messageDate = moment(timestamp);
  //   return messageDate.format('h:mm A');
  // };

  // Updated function to format date headers with Today/Yesterday logic
  const formatDateHeader = (timestamp) => {
    const messageDate = moment(timestamp);
    const today = moment().startOf('day');
    const yesterday = moment().subtract(1, 'day').startOf('day');

    // If the message is from today, return "Today"
    if (messageDate.isSame(today, 'day')) {
      return "Today";
    }

    // If the message is from yesterday, return "Yesterday"
    if (messageDate.isSame(yesterday, 'day')) {
      return "Yesterday";
    }

    // If the message is from this week, use day name (e.g., "Thursday")
    if (messageDate.isAfter(moment().subtract(7, 'days'))) {
      return messageDate.format('dddd');
    }

    // Otherwise use full date format (e.g., "6 April 2025")
    return messageDate.format('D MMMM YYYY');
  };

  // Function to group messages by date for date separators
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

  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900 text-gray-400 h-screen">
        Select a chat to start messaging.
      </div>
    );
  }

  const groupedItems = groupMessagesByDate();

  return (
    <div className="flex flex-col w-full h-screen bg-gray-950 text-white">
      <header
        className="flex justify-between items-center bg-gray-950  p-1.5 border-b  border-gray-900">
        <IoMdArrowBack size={20} className='block lg:hidden' onClick={(e) => {
          e.stopPropagation();
          setBarsToHidden(true);
        }} />
        <div className="flex items-center gap-2">

          <div
            onClick={() => setOpenGroupManager(true)}
            className="flex items-center gap-2 cursor-pointer">
            {selectedChat.isGroup ? (
              <GroupProfile />
            ) : (
              (() => {
                const otherParticipant = selectedChat.participants.find(p => p._id !== userId);
                return otherParticipant?.profilePicture ? (
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
                );
              })()
            )}

            <h2 className="text-lg font-semibold">
              {selectedChat.isGroup
                ? selectedChat.groupName
                : selectedChat.participants.find(p => p._id !== userId)?.name || "Unknown User"}
            </h2>
          </div>

        </div>
        <div className="flex gap-2">
          <FiPhone size={20} className="cursor-pointer" />
          <HiOutlineVideoCamera size={20} className="cursor-pointer" />
          <HiDotsVertical size={20} className="cursor-pointer" onClick={(e) => {
            e.stopPropagation();
            setShowChatOptions(!showChatOptions);
          }} />
          {showChatOptions && (
            selectedChat.isGroup ? <GroupOptions /> : <IndividualChatOptions />
          )}
        </div>
        {/* {openGroupManager && <ManageGroup />} */}
        {openGroupManager && (
          selectedChat.isGroup ? <ManageGroup /> : <ManageIndividual />
        )}

      </header>

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
              id={item.id}
              className={`flex ${isCurrentUserMessage ? 'justify-end' : 'justify-start'} ${!isPreviousMessageFromSameSender ? 'mt-3' : 'mt-0.5'}`}
            >
              {/* Profile picture display only in group chats */}
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
                    <div
                      onClick={() => handleConnectPrivateChat(msg.senderId._id)}
                      className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">

                      {/* <img
                        src={
                          msg.senderId.profilePicture.startsWith('/uploads/')
                            ? `${import.meta.env.VITE_BACKEND_URL}${msg.senderId.profilePicture}`
                            : `${import.meta.env.VITE_BACKEND_URL}/uploads/${msg.senderId.profilePicture}`
                        }
                        className="w-8 h-8 rounded-full object-cover border border-gray-700"
                        alt={msg.senderId.name}
                      /> */}
                      <RxAvatar size={24} className="text-gray-400" />

                    </div>
                  )}
                </div>
              )}

              <div className={`flex flex-col ${!isCurrentUserMessage && isGroupChat ? 'ml-1 ' : ''} max-w-[75%]`}>
                {/* Show sender name in group chats only */}
                {shouldShowSenderName && (
                  <span className="text-xs font-medium" style={{ color: '#5dadec' }}>
                    <span
                      onClick={() => handleConnectPrivateChat(msg.senderId._id)}
                      className='text-xs cursor-pointer'>{msg.senderId.name || "Unknown User"}</span>
                  </span>
                )}

                <div className={`px-3 py-2 rounded-lg shadow-sm flex ${msg.type === 'audio'
                  ? 'bg-transparent'
                  : (isCurrentUserMessage
                    ? 'bg-blue-700 text-white'
                    : 'bg-gray-800 text-white')
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
                            {audioPlayingId === audioId ? <BsPauseFill size={16} className="text-blue-600" /> : <BsPlayFill size={16} className="text-blue-600 ml-0.5" />}
                          </button>
                          <div className="flex-1 mx-2 cursor-pointer" onClick={(e) => handleWaveformClick(audioId, e)}>
                            <div className="flex items-center h-8">
                              {waveData.map((bar, i) => (
                                <div key={i} className="mx-[1px] transition-all duration-100"
                                  style={{
                                    height: `${bar.height}%`,
                                    width: '2px',
                                    backgroundColor: bar.isActive ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.4)',
                                    transform: bar.isActive ? 'scale(1.05)' : 'scale(1)'
                                  }} />
                              ))}
                            </div>
                          </div>
                          <div className="bg-white text-blue-600 px-2 py-1 rounded-full text-xs font-medium">
                            {audioDurations[audioId] !== undefined ? formatAudioTime(currentProgress * audioDurations[audioId]) : '0:00'}
                          </div>
                        </div>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                  <div className="text-[10px] text-gray-400 self-end ml-1">
                    {msg.createdAt ? moment(msg.createdAt).format('h:mm A') : ''}
                  </div>
                </div>
              </div>

              {/* Profile pic for current user only in group chats */}
              {isGroupChat && isCurrentUserMessage && !isPreviousMessageFromSameSender && (
                <div className="flex-shrink-0 self-end ml-1 mb-1">
                  {msg.senderId.profilePicture && msg.senderId._id != userId ? (
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
                    <>
                      {
                        msg.senderId._id != userId && (
                          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                            <RxAvatar size={24} className="text-gray-400" />
                          </div>
                        )
                      }
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
        <div ref={messageEndRef} />
      </div>

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

      {!isRecording && !audioURL && (
        <form onSubmit={handleSendMessage} className="flex items-center p-3 bg-gray-950 border-t border-gray-900">
          <FiPaperclip size={25} className="text-gray-400 cursor-pointer mr-2" />
          <MdOutlineEmojiEmotions size={25} className="text-gray-400 cursor-pointer mr-2 emoji-trigger" onClick={() => setShowEmojiPicker(!showEmojiPicker)} />
          {showEmojiPicker && (
            <div ref={emojiPickerRef} className="absolute bottom-16">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}
          <input type="text" placeholder="Type a message" value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 p-2 text-white bg-gray-900 rounded-lg" />
          {input.trim() ? (
            <button type="submit" className="ml-2">
              <IoMdSend size={25} className="text-indigo-500" />
            </button>
          ) : (
            <MdOutlineKeyboardVoice
              size={27}
              className="text-indigo-500 cursor-pointer ml-2"
              onClick={startRecording}
            />
          )}
        </form>
      )}
    </div>
  );
};

export default ChatWindow;