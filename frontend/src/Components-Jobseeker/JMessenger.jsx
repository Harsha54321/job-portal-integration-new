import React, { useCallback, useState, useEffect, useRef } from 'react';
import '../Components-Employer/Chatbox.css';
import { useJobs } from '../JobContext';
import home from "../assets/home_icon.png";
import { Link } from 'react-router-dom';
import api from '../api/axios';
 
// **JMessenger**
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
    const [activeUserName, setActiveUsername] = useState("");
    const [isRead, setIsRead] = useState(false);
    const [sending, setSending] = useState(false); // Add sending state
 
    const scrollRef = useRef(null);
 
    const markAsRead = async (messageId) => {
        try {
            const response = await api.post(`/chat/messages/${messageId}/read/`);
            console.log("Marked:", messageId, response.status);
            return response.status === 200;
        } catch (error) {
            console.error('Error marking message as read:', error.response?.data || error);
            return false;
        }
    };
 
    // Active Chat
    const activeChat = chats?.find(chat => chat.id === activeChatId);
    // Employer Profile
    const employerProfile = activeChat?.participants?.find(
        p => p.id !== currentUserId
    );
 
    const hasMessages = chats && chats.length > 0;
 
    // Fetch Messages
    const fetchMsg = async () => {
        try {
            if (!activeChat?.id) {
                console.warn("No valid active chat");
                return;
            }
 
            const isValid = chats.find(c => c.id === activeChatId);
 
            if (!isValid) {
                console.error("Invalid chat ID:", activeChatId);
                return;
            }
 
            console.log("Loading messages for:", activeChat.id);
            const msgs = await fetchMessages(activeChat.id);
            setMessages(msgs || []);
        } catch (err) {
            console.error("Failed to load messages:", err);
        }
    };
 
    useEffect(() => {
        if (!activeChat?.id) return;
        fetchMsg();
    }, [activeChatId]);
 
    // Auto Scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, sending]); // Also scroll when sending state changes
 
    // Send Message
    const handleSend = async (e) => {
        e.preventDefault();
 
        if (
            !input.trim() ||
            isChatEnded ||
            !activeChat ||
            !employerProfile
        ) return;
 
        const messageText = input.trim();
       
        // Clear input immediately for better UX
        setInput("");
        setSending(true);
 
        try {
            if (!activeChat?.id) {
                console.error("No active chat selected");
                setSending(false);
                return;
            }
           
            const res = await sendMessage(activeChat?.id, messageText);
 
            if (res.success) {
                const newMsg = res.data;
                // Update UI instantly
                setMessages(prev => [...prev, newMsg]);
            } else {
                console.error("Failed to send message:", res.error);
                // Put the message back if failed
                setInput(messageText);
                if (addEmployerNotification) {
                    addEmployerNotification("Failed to send message. Please try again.");
                }
            }
        } catch (error) {
            console.log(error);
            // Put the message back if failed
            setInput(messageText);
            if (addEmployerNotification) {
                addEmployerNotification("Error sending message");
            }
        } finally {
            setSending(false);
        }
    };
 
    // Load Chats
    useEffect(() => {
        const loadChats = async () => {
            try {
                await fetchChats();
            } catch (err) {
                console.error("Failed to load chats:", err);
            }
        };
 
        loadChats();
    }, []);
 
    const getDateSeparator = (timestamp) => {
        if (!timestamp) return '';
 
        const date = new Date(timestamp);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
 
        if (messageDate.getTime() === today.getTime()) {
            return 'Today';
        } else if (messageDate.getTime() === yesterday.getTime()) {
            return 'Yesterday';
        } else {
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            return date.toLocaleDateString(undefined, options);
        }
    };
 
    const groupMessagesByDate = (messages) => {
        if (!messages || messages.length === 0) return [];
 
        const groups = [];
        let currentDate = null;
 
        const sortedMessages = [...messages].sort((a, b) => {
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
 
    const getConversationForUser = useCallback((userId) => {
        if (!userId) return null;
 
        const conversation = chats.find(chat =>
            chat.participants?.some(p => p.id === parseInt(userId))
        );
 
        return conversation;
    }, [chats]);
 
    const activeConversation = getConversationForUser(activeChatId);
 
    const groupedMessages = groupMessagesByDate(messages);
 
    // Format timestamp for messages
    const formatWhatsAppTime = (timestamp) => {
        if (!timestamp) return '';
       
        const date = new Date(timestamp);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12;
        return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    };
 
    // Check if message is from current user
    const isMessageFromMe = (msg) => {
        const senderId = msg.sender?.id || msg.sender_id;
        return senderId === parseInt(currentUserId);
    };
 
    return (
        <div className="messages-container">
 
            {/* Sidebar */}
            <div className="E-chat-name">
                <div className="web-sidebar" style={{ height: "100vh" }}>
 
                    <Link to="/Job-portal/jobseeker/">
                        <img src={home} alt="home" style={{ height: "20px" }} />
                    </Link>
 
                    <div className="sidebar-header">
                        <h2 style={{ color: "#007bff", textAlign: "center" }}>
                            Messages
                        </h2>
                    </div>
 
                    {hasMessages && chats.map(chat => {
                        const unreadCount = chat.unread_count || 0;
                        const isActive = activeChat?.id === chat.id;
 
                        return (
                            <div
                                key={chat.id}
                                className={`sidebar-item ${isActive ? 'active' : ''}`}
                                style={{ cursor: 'pointer' }}
                                onClick={async () => {
                                    setActiveChatId(chat.id);
                                    setActiveUsername(chat.initiated_by?.username);
                                   
                                    // Fetch messages first
                                    const msgs = await fetchMessages(chat.id);
                                   
                                    const unreadMessages = (msgs || []).filter(msg =>
                                        (msg.receiver?.id === currentUserId || msg.receiver_id === currentUserId) && !msg.is_read
                                    );
                                   
                                    await Promise.all(
                                        unreadMessages.map(msg => markAsRead(msg.id))
                                    );
                                   
                                    setChats(prev =>
                                        prev.map(c =>
                                            c.id === chat.id
                                                ? { ...c, unread_count: 0 }
                                                : c
                                        )
                                    );
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                                    <strong>
                                        {chat.initiated_by?.username || 'Unknown User'}
                                    </strong>
                                    {unreadCount > 0 && (
                                        <span style={{
                                            background: "#007bff",
                                            color: "white",
                                            borderRadius: "50%",
                                            padding: "2px 6px",
                                            fontSize: "10px"
                                        }}>
                                            {unreadCount}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
 
            {/* Chat Window */}
            <div className="web-main-chat">
                {hasMessages && activeChat ? (
                    <>
                        <header className="web-chat-header">
                            <strong>
                                {activeUserName ? activeUserName : ""}
                            </strong>
                        </header>
 
                        <div className="web-chat-window" ref={scrollRef}>
                            {groupedMessages.length > 0 ? (
                                groupedMessages.map((item, index) => {
                                    if (item.type === 'date') {
                                        return (
                                            <div key={`date-${index}`} style={{ display: 'flex', justifyContent: 'center' }}>
                                                <div
                                                    style={{
                                                        backgroundColor: '#e9ecef',
                                                        padding: '4px 12px',
                                                        borderRadius: '12px',
                                                        width: 'max-content',
                                                        fontSize: '12px',
                                                        color: '#666'
                                                    }}
                                                    className="date-separator"
                                                >
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
 
                                    return (
                                        <div
                                            key={m.id || index}
                                            className="web-msg-row"
                                            style={{
                                                display: "flex",
                                                justifyContent: isFromMe ? "flex-end" : "flex-start",
                                                marginBottom: "12px",
                                                width: "100%"
                                            }}
                                        >
                                            <div style={{
                                                maxWidth: "70%",
                                                minWidth: "60px",
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: isFromMe ? "flex-end" : "flex-start"
                                            }}>
                                                <div
                                                    className={`web-bubble ${isFromMe ? 'web-me' : 'web-friend'}`}
                                                    style={{
                                                        wordWrap: "break-word",
                                                        wordBreak: "break-word",
                                                        whiteSpace: "pre-wrap",
                                                        maxWidth: "100%",
                                                        display: "inline-block",
                                                        padding: "10px 14px"
                                                    }}
                                                >
                                                    {messageContent}
                                                </div>
                                               
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
                                    No messages yet. Start the conversation!
                                </div>
                            )}
 
                            {/* Sending indicator */}
                            {sending && (
                                <div style={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    marginBottom: "12px",
                                    width: "100%"
                                }}>
                                    <div style={{
                                        maxWidth: "70%",
                                        padding: "10px 14px",
                                        borderRadius: "18px",
                                        background: "#e9ecef",
                                        color: "#666",
                                        opacity: 0.8
                                    }}>
                                        Sending...
                                    </div>
                                </div>
                            )}
 
                            {isChatEnded && (
                                <div className="chat-end-label">
                                    --- Conversation Ended ---
                                </div>
                            )}
                        </div>
                       
                        <form className="web-input-bar" onSubmit={handleSend}>
                            <input
                                className="web-text-input"
                                value={input}
                                disabled={isChatEnded}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={isChatEnded ? "Conversation ended" : "Reply to employer..."}
                            />
                            <button
                                type="submit"
                                className="web-send-button"
                            >
                                SEND
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="no-messages-view"
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            height: "100vh"
                        }}>
                        <div className="no-msg-content"
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center"
                            }}>
                            <h3>No Messages</h3>
                            <p>Waiting for the employer to start the conversation.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
 