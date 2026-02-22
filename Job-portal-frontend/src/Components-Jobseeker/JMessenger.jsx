import React, { useState, useEffect, useRef } from 'react';
import './JMessenger.css';
import { useJobs } from '../JobContext';


export const JMessenger = () => {
    const { chats, setChats, isChatEnded} = useJobs();
    const [input, setInput] = useState("");
    const scrollRef = useRef(null);
    

    
    const employerChat = chats.find(c => c.role === "employer");

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [employerChat.messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const newMsg = {
            id: Date.now(),
            text: input,
            sender: "me", 
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setChats(prev => prev.map(chat => 
            chat.id === employerChat.id ? { ...chat, messages: [...chat.messages, newMsg] } : chat
        ));
        setInput("");
    };

    return (
        <div className="web-messenger-container">
            <div className="E-chat-name">
                <div style={{ height: "100vh" }} className="web-sidebar">
                    <div className="sidebar-header"><h2>Messages</h2></div>
                    <div className="sidebar-item active">
                        <strong>{employerChat.name}</strong>
                    </div>
                </div>
            </div>

            <div className="web-main-chat">
                <header className="web-chat-header">
                    <strong>{employerChat.name}</strong>
                </header>
                <div className="web-chat-window" ref={scrollRef}>
                    {employerChat.messages.length === 0 ? <p>You will not able to sent messages</p> : employerChat.messages.map((m) => (
                        <div key={m.id} className="web-msg-row">
                            <div className={`web-bubble web-${m.sender}`}>{m.text}</div>
                            
                        </div>
                        
                    ))}
                    {isChatEnded && (
                    <div style={{ textAlign: "center", padding: "10px", color: "gray", fontSize: "12px" }}>
                      --- Conversation Ended ---
                    </div>
                  )}
                    
                </div>
                <form className="web-input-bar" onSubmit={handleSend}>
                    <input className="web-text-input" value={input} disabled={employerChat.messages.length === 0 || isChatEnded}  onChange={(e) => setInput(e.target.value)} placeholder={employerChat.messages.length === 0 ? '':"Say Hi"} />
                    <button type="submit" disabled={employerChat.messages.length === 0 || isChatEnded} className={employerChat.messages.length === 0 ||  isChatEnded ? "web-disable-button":"web-send-button"}>SEND</button>
                </form>
            </div>
        </div>
    );
};