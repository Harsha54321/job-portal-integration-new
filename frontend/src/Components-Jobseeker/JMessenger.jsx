import React, { useCallback, useState, useEffect, useRef, useMemo } from 'react';
import '../Components-Employer/Chatbox.css';
import { useJobs } from '../JobContext';
import home from "../assets/home_icon.png";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export const JMessenger = () => {
    const {
        chats,
        setChats,
        currentUser,
        fetchMessages,
        fetchChats,
        currentUserId,
        isChatEnded,
        setNotificationsData,
        addEmployerNotification,
        sendMessage
    } = useJobs();

    const [input, setInput] = useState("");
    const [activeChatId, setActiveChatId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [sending, setSending] = useState(false);
    const [pollingInterval, setPollingInterval] = useState(null);
    const [otherUserStatus, setOtherUserStatus] = useState({ is_online: false, last_seen: null });
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const scrollRef = useRef(null);
    const activeChatIdRef = useRef(null);
    const abortControllerRef = useRef(null);

    // FIX: Get userId from sessionStorage directly, not from context
    // This ensures we always have the correct logged-in user ID
    const loggedInUserId = parseInt(
        sessionStorage.getItem("user_id") || localStorage.getItem("user_id") || "0",
        10
    );

    console.log('🔑 Logged in User ID:', loggedInUserId);

    // ============================================================
    // Find the OTHER participant (not logged-in user)
    // ============================================================
    const activeChat = useMemo(() => {
        return chats?.find(chat => chat.id === activeChatId);
    }, [chats, activeChatId]);

    const otherParticipant = useMemo(() => {
        if (!activeChat || !activeChat.participants) return null;
        
        // Find the participant who is NOT the logged in user
        const other = activeChat.participants.find(
            p => parseInt(p.id, 10) !== loggedInUserId
        );
        
        if (other) {
            console.log('✅ Other participant found:', other.username, '(ID:', other.id, ')');
            return other;
        }
        
        console.warn('⚠️ No other participant found in chat');
        return null;
    }, [activeChat, loggedInUserId]);

    // --- Get display name ---
    const getDisplayName = useCallback((chat) => {
        if (!chat || !chat.participants) return 'User';
        
        const other = chat.participants.find(
            p => parseInt(p.id, 10) !== loggedInUserId
        );
        
        if (other) {
            return other.username || 'User';
        }
        
        return chat.initiated_by?.username || 'User';
    }, [loggedInUserId]);

    const displayName = useMemo(() => {
        return getDisplayName(activeChat);
    }, [activeChat, getDisplayName]);

    // --- Fetch user status ---
    const fetchOtherUserStatus = useCallback(async () => {
        if (!activeChatId) {
            console.log('No active chat ID, skipping status fetch');
            return;
        }

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            console.log(`Fetching status for conversation: ${activeChatId}`);
            const res = await api.get(`/chat/conversations/${activeChatId}/`, {
                signal: controller.signal
            });
            
            const conversation = res.data;
            console.log('Conversation data:', conversation);
            
            const other = conversation.participants?.find(
                p => parseInt(p.id, 10) !== loggedInUserId
            );
            
            if (other) {
                console.log('✅ Other participant found:', other.username);
                setOtherUserStatus({
                    is_online: Boolean(other.is_online),
                    last_seen: other.last_seen || null,
                    username: other.username
                });
            } else {
                if (otherParticipant) {
                    setOtherUserStatus({
                        is_online: Boolean(otherParticipant.is_online),
                        last_seen: otherParticipant.last_seen || null,
                        username: otherParticipant.username
                    });
                }
            }
        } catch (err) {
            if (err.name === 'AbortError') {
                console.log('Status fetch cancelled');
            } else {
                console.error('Failed to fetch user status:', err);
                if (otherParticipant) {
                    setOtherUserStatus({
                        is_online: Boolean(otherParticipant.is_online),
                        last_seen: otherParticipant.last_seen || null,
                        username: otherParticipant.username
                    });
                }
            }
        }
    }, [activeChatId, loggedInUserId, otherParticipant]);

    const location = useLocation();
    const navigate = useNavigate();
    const deepLinkAppliedRef = useRef(false);

    // --- Handle deep linking ---
    useEffect(() => {
        if (deepLinkAppliedRef.current) return;
        const targetConversationId = location.state?.conversationId;
        if (!targetConversationId || !chats || chats.length === 0) return;
        const targetChat = chats.find(chat => chat.id === targetConversationId);
        if (!targetChat) return;
        setActiveChatId(targetChat.id);
        deepLinkAppliedRef.current = true;
        setIsInitialLoad(false);
        navigate(location.pathname, { replace: true, state: {} });
    }, [chats, location.state, navigate, location.pathname]);

    // --- Fetch status on chat change ---
    useEffect(() => {
        if (activeChatId) {
            fetchOtherUserStatus();
        }
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [activeChatId, fetchOtherUserStatus]);

    // --- Poll for status ---
    useEffect(() => {
        if (!activeChatId) return;
        const interval = setInterval(() => {
            fetchOtherUserStatus();
        }, 10000);
        return () => {
            clearInterval(interval);
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [activeChatId, fetchOtherUserStatus]);

    // --- Mark messages as read ---
    const markAsRead = async (messageId) => {
        try {
            const response = await api.post(`/chat/messages/${messageId}/read/`);
            return response.status === 200;
        } catch (error) {
            console.error('Error marking message as read:', error);
            return false;
        }
    };

    const markMultipleAsRead = async (messageIds) => {
        if (!messageIds || messageIds.length === 0) return true;
        try {
            const promises = messageIds.map(id => markAsRead(id));
            await Promise.all(promises);
            return true;
        } catch (error) {
            console.error('Error marking messages as read:', error);
            return false;
        }
    };

    const markAllMessagesAsReadInActiveChat = async (chatId, messageList) => {
        if (!chatId || !messageList || messageList.length === 0) return;
        const unreadMessages = messageList.filter(msg =>
            !isMessageFromMe(msg) && !msg.is_read
        );
        if (unreadMessages.length === 0) return;
        const success = await markMultipleAsRead(unreadMessages.map(m => m.id));
        if (success) {
            setMessages(prev => prev.map(msg =>
                unreadMessages.some(um => um.id === msg.id)
                    ? { ...msg, is_read: true }
                    : msg
            ));
            setChats(prev => prev.map(chat =>
                chat.id === chatId
                    ? { ...chat, unread_count: 0 }
                    : chat
            ));
        }
    };

    const hasMessages = chats && chats.length > 0;

    // --- Fetch messages ---
    const fetchMsg = useCallback(async () => {
        if (!activeChat?.id) {
            console.log('No active chat, skipping message fetch');
            return;
        }

        setIsLoading(true);
        
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            console.log(`Fetching messages for conversation: ${activeChat.id}`);
            const msgs = await fetchMessages(activeChat.id);
            
            if (!controller.signal.aborted) {
                console.log('Messages fetched:', msgs?.length || 0);
                setMessages(msgs || []);
                
                if (msgs && msgs.length > 0) {
                    await markAllMessagesAsReadInActiveChat(activeChat.id, msgs);
                }
                setIsInitialLoad(false);
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error("Failed to load messages:", err);
                setMessages([]);
            }
        } finally {
            if (!controller.signal.aborted) {
                setIsLoading(false);
            }
        }
    }, [activeChat, fetchMessages]);

    // --- Load messages when chat changes ---
    useEffect(() => {
        if (!activeChat?.id) return;
        fetchMsg();
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [activeChatId, fetchMsg]);

    // --- Poll for new messages ---
    useEffect(() => {
        if (!activeChatId) return;
        
        const interval = setInterval(async () => {
            try {
                const newMessages = await fetchMessages(activeChatId);
                if (newMessages && newMessages.length !== messages.length) {
                    setMessages(newMessages);
                    if (activeChatIdRef.current === activeChatId) {
                        await markAllMessagesAsReadInActiveChat(activeChatId, newMessages);
                    } else {
                        const unreadCount = newMessages.filter(msg =>
                            !isMessageFromMe(msg) && !msg.is_read
                        ).length;
                        setChats(prev => prev.map(chat =>
                            chat.id === activeChatId
                                ? { ...chat, unread_count: unreadCount }
                                : chat
                        ));
                    }
                }
            } catch (err) {
                console.error("Error polling messages:", err);
            }
        }, 5000);
        
        setPollingInterval(interval);
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [activeChatId, messages.length, fetchMessages, setChats]);

    // --- Refresh chats periodically ---
    useEffect(() => {
        const refreshChats = setInterval(async () => {
            if (!document.hidden) {
                await fetchChats();
            }
        }, 10000);
        return () => clearInterval(refreshChats);
    }, [fetchChats]);

    // --- Auto scroll ---
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, sending]);

    // --- Send message ---
    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isChatEnded || !activeChat || !otherParticipant) return;
        const messageText = input.trim();
        setInput("");
        setSending(true);
        try {
            if (!activeChat?.id) {
                setSending(false);
                return;
            }
            const res = await sendMessage(activeChat?.id, messageText);
            if (res.success) {
                const newMsg = res.data;
                setMessages(prev => [...prev, newMsg]);
            } else {
                console.error("Failed to send message:", res.error);
                setInput(messageText);
                if (addEmployerNotification) {
                    addEmployerNotification("Failed to send message. Please try again.");
                }
            }
        } catch (error) {
            console.log(error);
            setInput(messageText);
            if (addEmployerNotification) {
                addEmployerNotification("Error sending message");
            }
        } finally {
            setSending(false);
        }
    };

    // --- Load chats on mount ---
    useEffect(() => {
        const loadChats = async () => {
            try {
                await fetchChats();
                setIsInitialLoad(false);
            } catch (err) {
                console.error("Failed to load chats:", err);
                setIsInitialLoad(false);
            }
        };
        loadChats();
    }, [fetchChats]);

    // --- Utility functions ---
    const getDateSeparator = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        if (messageDate.getTime() === today.getTime()) return 'Today';
        if (messageDate.getTime() === yesterday.getTime()) return 'Yesterday';
        return date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    const groupMessagesByDate = (msgs) => {
        if (!msgs || msgs.length === 0) return [];
        const groups = [];
        let currentDate = null;
        const sortedMessages = [...msgs].sort((a, b) => {
            const timeA = new Date(a.timestamp || a.created_at);
            const timeB = new Date(b.timestamp || b.created_at);
            return timeA - timeB;
        });
        sortedMessages.forEach((msg) => {
            const timestamp = msg.timestamp || msg.created_at;
            if (!timestamp) {
                groups.push({ type: 'message', data: msg });
                return;
            }
            const date = new Date(timestamp);
            const dateKey = date.toDateString();
            if (currentDate !== dateKey) {
                currentDate = dateKey;
                groups.push({ type: 'date', data: timestamp });
            }
            groups.push({ type: 'message', data: msg });
        });
        return groups;
    };

    const groupedMessages = groupMessagesByDate(messages);

    const formatWhatsAppTime = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12;
        return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    };

    const isMessageFromMe = (msg) => {
        const senderId = msg.sender?.id || msg.sender_id || msg.senderId;
        const senderIdNum = parseInt(senderId);
        // Use the same loggedInUserId we defined at the top
        return senderIdNum === loggedInUserId;
    };

    const getUnreadCount = (chat) => {
        if (activeChat?.id === chat.id) return 0;
        if (chat.unread_count !== undefined) return chat.unread_count;
        if (chat.messages) {
            return chat.messages.filter(msg =>
                !isMessageFromMe(msg) && !msg.is_read
            ).length;
        }
        return 0;
    };

    // --- Loading state ---
    if (isInitialLoad && !activeChat) {
        return (
            <div className="messages-container">
                <div className="E-chat-name">
                    <div className="web-sidebar" style={{ height: "100vh" }}>
                        <div className="sidebar-header">
                            <h2 style={{ color: "#007bff", textAlign: "center" }}>Messages</h2>
                        </div>
                        <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                            Loading chats...
                        </div>
                    </div>
                </div>
                <div className="web-main-chat">
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#888' }}>
                        <div>Loading messages...</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="messages-container">
            <div className="E-chat-name">
                <div className="web-sidebar" style={{ height: "100vh" }} title="Sidebar">
                    <Link to="/Job-portal/jobseeker/">
                        <img src={home} alt="home" style={{ height: "20px" }} title="Home" />
                    </Link>
                    <div className="sidebar-header">
                        <h2 style={{ color: "#007bff", textAlign: "center" }}>Messages</h2>
                    </div>
                    {hasMessages && chats.map(chat => {
                        const unreadCount = getUnreadCount(chat);
                        const isActive = activeChat?.id === chat.id;
                        const displayName = getDisplayName(chat);
                        return (
                            <div
                                key={chat.id}
                                className={`sidebar-item ${isActive ? 'active' : ''}`}
                                style={{ cursor: 'pointer' }}
                                onClick={() => {
                                    setActiveChatId(chat.id);
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                                    <strong>{displayName}</strong>
                                    {unreadCount > 0 && !isActive && (
                                        <span style={{
                                            background: "#007bff",
                                            color: "white",
                                            borderRadius: "50%",
                                            padding: "2px 8px",
                                            fontSize: "11px",
                                            fontWeight: "bold",
                                            minWidth: "20px",
                                            textAlign: "center"
                                        }}>
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    {!hasMessages && (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                            No conversations yet
                        </div>
                    )}
                </div>
            </div>

            <div className="web-main-chat">
                {hasMessages && activeChat ? (
                    <>
                        <header className="web-chat-header">
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <strong style={{ marginRight: '10px' }}>
                                    {isLoading ? 'Loading...' : displayName}
                                </strong>
                                <span className={`status-dot ${otherUserStatus.is_online ? 'online' : 'offline'}`}></span>
                                <span className="status-text">
                                    {otherUserStatus.is_online ? 'Online' : 'Offline'}
                                </span>
                            </div>
                        </header>
                        <div className="web-chat-window" ref={scrollRef}>
                            {groupedMessages.length > 0 ? (
                                groupedMessages.map((item, index) => {
                                    if (item.type === 'date') {
                                        return (
                                            <div key={`date-${index}`} style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                                                <div style={{ backgroundColor: '#e9ecef', padding: '4px 12px', borderRadius: '12px', width: 'max-content', fontSize: '12px', color: '#666' }} className="date-separator">
                                                    {getDateSeparator(item.data)}
                                                </div>
                                            </div>
                                        );
                                    }
                                    const m = item.data;
                                    const isFromMe = isMessageFromMe(m);
                                    const timestamp = m.timestamp || m.created_at;
                                    const timeString = formatWhatsAppTime(timestamp);
                                    const messageContent = m.content || m.text;
                                    const isRead = m.is_read;
                                    return (
                                        <div key={m.id || index} className="web-msg-row" style={{ display: "flex", justifyContent: isFromMe ? "flex-end" : "flex-start", marginBottom: "12px", width: "100%" }}>
                                            <div style={{ maxWidth: "70%", minWidth: "60px", display: "flex", flexDirection: "column", alignItems: isFromMe ? "flex-end" : "flex-start" }}>
                                                <div className={`web-bubble ${isFromMe ? 'web-me' : 'web-friend'}`} style={{ wordWrap: "break-word", wordBreak: "break-word", whiteSpace: "pre-wrap", maxWidth: "100%", display: "inline-block", padding: "10px 14px" }}>
                                                    {messageContent}
                                                </div>
                                                <div style={{ fontSize: "10px", marginTop: "4px", color: "#888", display: "flex", gap: "4px", alignItems: "center" }}>
                                                    <span>{timeString}</span>
                                                    {isFromMe && isRead && <span style={{ color: "#34b7f1" }}>✓✓</span>}
                                                    {isFromMe && !isRead && <span style={{ color: "#888" }}>✓</span>}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
                                    {isLoading ? 'Loading messages...' : 'No messages yet. Start the conversation!'}
                                </div>
                            )}
                            {sending && (
                                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "12px", width: "100%" }}>
                                    <div style={{ maxWidth: "70%", padding: "10px 14px", borderRadius: "18px", background: "#e9ecef", color: "#666", opacity: 0.8 }}>Sending...</div>
                                </div>
                            )}
                            {isChatEnded && <div className="chat-end-label">--- Conversation Ended ---</div>}
                        </div>
                        <form className="web-input-bar" onSubmit={handleSend}>
                            <input 
                                className="web-text-input" 
                                value={input} 
                                disabled={isChatEnded || isLoading} 
                                onChange={(e) => setInput(e.target.value)} 
                                placeholder={isChatEnded ? "Conversation ended" : "Reply to employer..."} 
                            />
                            <button 
                                type="submit" 
                                className="web-send-button" 
                                disabled={isChatEnded || !input.trim() || isLoading}
                            >
                                SEND
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="no-messages-view" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                        <div className="no-msg-content" style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                            <h3>No Messages</h3>
                            <p>Waiting for the employer to start the conversation.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};