import React, { useState, useEffect, useRef } from "react";
import "./EMessenger.css";
import { EHeader } from "./EHeader";
import { useJobs } from "../JobContext";


export const EMessenger = () => {
  const { chats, setChats,isChatEnded, setIsChatEnded,addNotification } = useJobs();
  const [input, setInput] = useState("");
  
   
  const scrollRef = useRef(null);

  const jobseekerChat = chats.find(c => c.role === "jobseeker");
  const employerData = chats.find(c => c.role === "employer");

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [employerData.messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || isChatEnded) return; 

    const employerReply = {
      id: Date.now(),
      text: input,
      sender: "friend", 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Chat updates
    setChats(prev => prev.map(chat => 
      chat.role === "employer" ? { ...chat, messages: [...chat.messages, employerReply] } : chat
    ));

    // 2. Sending datas Notification
    addNotification(`New message from Employer: ${input}`);

    setInput("");
  };

  return (
    <>
      <div className="messages-container">
        <div className="EChat-Mainsec">
            <div className="E-chat-name">
                <div style={{ height: "100vh" }} className="web-sidebar">
                    <div className="sidebar-item active">
                        <strong>{jobseekerChat.name}</strong>
                    </div>
                </div>
            </div>
            <div className="web-main-chat">
                <header className="web-chat-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong>{jobseekerChat.name}</strong>
                    
                    {/* End / Restart Button Logic */}
                    <button 
                      onClick={() => setIsChatEnded(!isChatEnded)}
                      className={ isChatEnded ? "E-Start-Convo-Button" : "E-End-Convo-Button"}
                    >
                      {isChatEnded ? "RESTART CONVERSATION" : "END CONVERSATION"}
                    </button>
                </header>

                <div className="web-chat-window" ref={scrollRef}>
                  {employerData.messages.map((m) => (
                    <div key={m.id} className="web-msg-row">
                      <div className={`web-bubble ${m.sender === 'friend' ? 'web-me' : 'web-friend'}`}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                  {isChatEnded && (
                    <div style={{ textAlign: "center", padding: "10px", color: "gray", fontSize: "12px" }}>
                      --- Conversation Ended ---
                    </div>
                  )}
                </div>

                <form className="web-input-bar" onSubmit={handleSend}>
                  <input 
                    className="web-text-input" 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isChatEnded}
                    placeholder={isChatEnded ? "Chat is ended. Restart to type." : "Type a message..."}
                  />
                  <button 
                    type="submit" 
                    className="web-send-button"
                    disabled={isChatEnded}
                    style={{ opacity: isChatEnded ? 0.5 : 1 }}
                  >
                    SEND
                  </button>
                </form>
            </div>
        </div>
      </div>
    </>
  );
};