import React, { useState, useEffect, useRef, useCallback } from "react";
import "./Chatbox.css";
import { useJobs } from "../JobContext";
import home from "../assets/home_icon.png";
import api from "../api/axios";
import { Link } from 'react-router-dom';
 
export const EMessenger = () => {
  const {
    chats,
    setChats,
    Alluser,
    currentEmployer,
    addNotification,
    activeSidebarUsers,
    setActiveSidebarUsers,
    fetchMessages,
    sendMessage,
    fetchChats,
    startConversation,
    currentUserId,
    isChatEnded,setIsChatEnded
  } = useJobs();
 
  const [input, setInput] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [messagesLoaded, setMessagesLoaded] = useState(false);
  const scrollRef = useRef(null);
 
  // Fetch chats on component mount (only once)
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
 
  const markAsRead = async (messageId) => {
    try {
      const response = await api.post(`/chat/messages/${messageId}/read/`);
      return response.status === 200;
    } catch (error) {
      console.error('Error marking message as read:', error);
      return false;
    }
  };
 
  // Get the conversation for the selected user
  const getConversationForUser = useCallback((userId) => {
    if (!userId) return null;
   
    const conversation = chats.find(chat =>
      chat.participants?.some(p => p.id === parseInt(userId))
    );
   
    return conversation;
  }, [chats]);
 
  const activeConversation = getConversationForUser(selectedUserId);
  const activeUser = Alluser.find(u => parseInt(u.user.id) === selectedUserId);
 
  // Sidebar filter logic
  const sidebarDisplayUsers = Alluser.filter(user => {
    const hasConversation = chats.some(chat =>
      chat.participants?.some(p => p.id === parseInt(user.user.id))
    );
    return hasConversation || activeSidebarUsers.includes(parseInt(user.user.id));
  });
 
  // Load messages when a conversation is selected (only once per conversation)
  useEffect(() => {
    if (activeConversation && activeConversation.id && !messagesLoaded) {
      const loadMessages = async () => {
        try {
          console.log("Loading messages for conversation:", activeConversation.id);
          await fetchMessages(activeConversation.id);
          setMessagesLoaded(true);
        } catch (err) {
          console.error("Failed to load messages:", err);
        }
      };
      loadMessages();
    }
  }, [activeConversation?.id, fetchMessages, messagesLoaded]);
 
  // Reset messagesLoaded when selected user changes
  useEffect(() => {
    setMessagesLoaded(false);
  }, [selectedUserId]);
 
  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeConversation?.messages]);
 
  // Toggle chat end
  const toggleChatEnd = () => {
    if (activeConversation) {
      setChats(prev => prev.map(chat =>
        chat.id === activeConversation.id
          ? { ...chat, isChatEnded: !chat.isChatEnded }
          : chat
      ));
    }
 
  };
 
  // Handle send message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || activeConversation?.isChatEnded || !selectedUserId ) return;
 
    const messageText = input.trim();
   
    // Clear input immediately for better UX
    setInput("");
   
    setSending(true);
 
    if (activeConversation && activeConversation.id) {
      try {
        const result = await sendMessage(activeConversation.id, messageText);
       
        if (result.success) {
          // Refresh messages after sending
          await fetchMessages(activeConversation.id);
          setMessagesLoaded(true);
         
          if (addNotification) {
            addNotification(`Message sent to ${activeUser?.full_name || 'job seeker'}`);
          }
        } else {
          console.error("Failed to send message:", result.error);
          if (addNotification) {
            addNotification("Failed to send message. Please try again.");
          }
          // Put the message back if failed
          setInput(messageText);
        }
      } catch (err) {
        console.error("Error sending message:", err);
        if (addNotification) {
          addNotification("Error sending message");
        }
        // Put the message back if failed
        setInput(messageText);
      } finally {
        setSending(false);
      }
    } else {
      await handleStartConversation(messageText);
      setSending(false);
    }
  };
 
  // Start conversation
  const handleStartConversation = async (initialMessage = "") => {
    if (!selectedUserId) return;
   
    setLoading(true);
    try {
      const conversationId = await startConversation(selectedUserId, initialMessage);
     
      if (conversationId) {
        setActiveSidebarUsers(prev =>
          prev.includes(selectedUserId) ? prev : [...prev, selectedUserId]
        );
       
        await fetchChats();
       
        if (initialMessage) {
          setTimeout(async () => {
            await fetchMessages(conversationId);
            setMessagesLoaded(true);
          }, 500);
        }
       
        if (initialMessage) {
          setInput("");
        }
      }
    } catch (err) {
      console.error("Error starting conversation:", err);
      if (addNotification) {
        addNotification("Failed to start conversation");
      }
    } finally {
      setLoading(false);
    }
  };
 
  // Get message content
  const getMessageContent = (msg) => {
    return msg.content || msg.text || '';
  };
 
  // Format timestamp
  const formatWhatsAppTime = (timestamp) => {
    if (!timestamp) return '';
   
    const date = new Date(timestamp);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
   
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const timeString = `${formattedHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
   
    if (messageDate.getTime() === today.getTime()) {
      return timeString;
    } else if (messageDate.getTime() === yesterday.getTime()) {
      return `Yesterday, ${timeString}`;
    } else {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return `${days[date.getDay()]}, ${timeString}`;
    }
  };
 
  // Get date separator
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
 
  useEffect(() => {
    if (!activeConversation?.messages) return;
 
    const unreadMessages = activeConversation.messages.filter(msg => {
      const receiverId = msg.receiver?.id || msg.receiver_id;
      return receiverId === parseInt(currentUserId) && !msg.is_read;
    });
 
    if (unreadMessages.length === 0) return;
 
    const markAllAsRead = async () => {
      try {
        await Promise.all(
          unreadMessages.map(msg => markAsRead(msg.id))
        );
      } catch (err) {
        console.error("Error marking messages as read:", err);
      }
    };
 
    markAllAsRead();
  }, [activeConversation?.messages]);
 
  // Group messages by date
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
 
  // Check if message is from current user
  const isMessageFromMe = (msg) => {
    const senderId = msg.sender?.id || msg.sender_id;
    return senderId === parseInt(currentUserId);
  };
 
  const groupedMessages = groupMessagesByDate(activeConversation?.messages);
 
  return (
    <>
      <div className="messages-container">
        <div className="EChat-Mainsec">
          <div className="E-chat-name">
            <div className="web-sidebar">
              <div className="sidebar-header">
                <Link to="/Job-portal/Employer/Dashboard">
                  <img src={home} style={{ height: "20px" }} alt="home" />
                </Link>
                <h3 style={{ color: "#007bff", textAlign: "center" }}>Active Chats</h3>
              </div>
              {sidebarDisplayUsers.length > 0 ? (
                sidebarDisplayUsers.map(user => {
                  const userConversation = getConversationForUser(parseInt(user.user.id));
                  const isActive = selectedUserId === parseInt(user.user.id);
                  const unreadCount = userConversation?.unread_count || 0;
 
                  return (
                    <div
                      key={user.id}
                      className={`sidebar-item ${isActive ? 'active' : ''}`}
                      onClick={async () => {
                        const selectedId = parseInt(user.user.id);
                        setSelectedUserId(selectedId);
 
                        const userConversation = getConversationForUser(selectedId);
 
                        if (userConversation?.id) {
                          const msgs = await fetchMessages(userConversation.id);
 
                          const unreadMessages = (msgs || []).filter(msg => {
                            const receiverId = msg.receiver?.id || msg.receiver_id;
                            return receiverId === parseInt(currentUserId) && !msg.is_read;
                          });
 
                          await Promise.all(unreadMessages.map(msg => markAsRead(msg.id)));
 
                          setChats(prev =>
                            prev.map(c =>
                              c.id === userConversation.id
                                ? { ...c, unread_count: 0 }
                                : c
                            )
                          );
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <strong>{user.profile?.fullName || user.full_name || 'Unknown'}</strong>
                          <p style={{ fontSize: '11px', margin: 0 }}>
                            {user.currentDetails?.jobTitle || user.current_job_title || ''}
                          </p>
                        </div>
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
                })
              ) : (
                <div style={{ padding: '20px', color: '#888', textAlign: 'center' }}>
                  No active chats
                  <p style={{ fontSize: '12px', marginTop: '10px' }}>
                    Click on a job seeker profile to start a conversation
                  </p>
                </div>
              )}
            </div>
          </div>
 
          <div className="web-main-chat">
            {selectedUserId ? (
              <>
                <header className="web-chat-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong>{activeUser?.profile?.fullName || activeUser?.full_name || 'Job Seeker'}</strong>
                  {activeConversation ? (
                    <button
                      onClick={toggleChatEnd}
                      className={activeConversation?.isChatEnded ? "E-Start-Convo-Button" : "E-End-Convo-Button"}
                    >
                      {activeConversation?.isChatEnded ? "RESTART" : "END CHAT"}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStartConversation(input)}
                      disabled={loading}
                      className="E-Start-Convo-Button"
                    >
                      {loading ? "Starting..." : "START CHAT"}
                    </button>
                  )}
                </header>
 
                <div className="web-chat-window" ref={scrollRef}>
                  {groupedMessages.length > 0 ? (
                    groupedMessages.map((item, index) => {
                      if (item.type === 'date') {
                        return (
                          <div key={`date-${index}`} style={{
                            textAlign: 'center',
                            margin: '20px 0',
                            position: 'relative'
                          }}>
                            <span style={{
                              backgroundColor: '#e9ecef',
                              padding: '4px 12px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              color: '#666'
                            }}>
                              {getDateSeparator(item.data)}
                            </span>
                          </div>
                        );
                      }
                     
                      const msg = item.data;
                      const isFromMe = isMessageFromMe(msg);
                      const timestamp = msg.timestamp || msg.created_at;
                      const timeString = formatWhatsAppTime(timestamp);
                      const messageContent = getMessageContent(msg);
                     
                      return (
                        <div
                          key={msg.id || index}
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
                    <div style={{
                      textAlign: 'center',
                      color: '#888',
                      marginTop: '50px',
                      fontSize: '14px'
                    }}>
                      {activeConversation ? "No messages yet" : "Start a conversation to begin messaging"}
                    </div>
                  )}
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
                  {activeConversation?.isChatEnded && <div className="chat-end-label">--- Conversation Ended ---</div>}
                </div>
 
                <form className="web-input-bar" onSubmit={handleSend}>
                  <input
                    className="web-text-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={activeConversation?.isChatEnded}
                    placeholder={activeConversation?.isChatEnded ? "Conversation ended" : "Type a message..."}
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
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#888', flexDirection: 'column' }}>
                <h3>Chat Section</h3>
                <p>Select a job seeker from the sidebar to start a conversation.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
 