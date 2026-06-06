import React, { useState } from 'react';
import './AdminTickets.css';
import TicketIcon from '../assets/AdminAssets/TicketsIcon.png';
import { useJobs } from '../JobContext';

export const AdminTickets = () => {
    const { raisedTickets, setRaisedTickets } = useJobs();
    const [selectedTickets,setSelectedTickets]=useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false);

    const statusOrder = { "Pending": 1, "In Progress": 2, "Resolved": 3 };

    // const uniqueTickets = raisedTickets.filter(
    //     (ticket, index, self) => self.findIndex(t => t.id === ticket.id) === index
    // );

    const sortedTickets = raisedTickets.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

    const handleDropdownChange = (e) => {
    const newValue = e.target.value;
    setSelectedTickets((prev) => {
        if (!prev) return null;
        return { ...prev, status: newValue };
    });
};

const handleEditStatusClick = () => {
    if (!selectedTickets) {
        alert("Please select a ticket first!");
        return;
    }
    setIsModalOpen(true); 
};

// const timestamp = Date.now()
const handleStatusSelection = (newStatus) => {
    if(newStatus !== "Resolved"){
    setSelectedTickets((prev) => ({ ...prev, status: newStatus }));
    setRaisedTickets((prevList) =>
        prevList.map((ticket) =>
            ticket.id === selectedTickets.id ? { ...ticket, status: newStatus } : ticket
        )
    );}
    else{
    setSelectedTickets((prev) => ({ ...prev, status: newStatus }));
    setRaisedTickets((prevList) =>
        prevList.map((ticket) =>
            ticket.id === selectedTickets.id ? { ...ticket, status: newStatus, resolvedon: new Date(Date.now()).toLocaleDateString('en-GB') } : ticket
        )
    );}
    setIsModalOpen(false);
};


const handleDeleteTicket = () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this ticket?");
    if (!confirmDelete) return;
    setRaisedTickets((prev) => prev.filter((t) => t.id !== selectedTickets.id));
    setSelectedTickets(null);
};

    return (
        <>
        {!selectedTickets ? (
        <div className="AdminTickets-container">
            <div className="AdminTickets-header">
                <div>
                    <h2>Raised Tickets</h2>
                    <p>Manage and review all user raised tickets</p>
                </div>
            </div>

            <div className="AdminTickets-table-wrapper">
                <table className="AdminTickets-table">
                    <thead>
                        <tr>
                            <th>TICKET ID</th>
                            <th>SUBJECT</th>
                            <th>USER</th>
                            <th>CATEGORY</th>
                            <th style={{paddingLeft:"40px"}}>PRIORITY</th>
                            <th>RECEIVED at</th>
                            <th>RESOLVED on</th>
                            <th>ACTION</th>
                        </tr>
                    </thead>

                    <tbody>
                        {sortedTickets.map((ticket, index) => (
                            <tr key={ticket.id || index}>
                                <td>{ticket.id}</td>
                                <td>{ticket.subject}</td>
                                <td>{ticket.name}</td>
                                <td>{ticket.category}</td>
                                <td><span  className={`Escalation-priority ${ticket.priority}`}>{ticket.priority}</span></td>
                                <td>{ticket.date}</td>
                                <td>{ticket.resolvedon? ticket.resolvedon : ticket.status}</td>
                                <td><button style={{background:"#1E88E5",color:"white",borderRadius:"5px",
                                    padding:"7px 10px",outline:"none",border:"none"
                                }} onClick={()=>{setSelectedTickets(ticket)}}>View Details</button>
                                    
                                </td>
                                {/* <td>{ticket.date}</td> */}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
        ):(
        <div className="Adm-tic-container">
      <div className="Adm-tic-top-nav">
        <button onClick={()=>setSelectedTickets(null)} className="Adm-tic-btn-back">Back to Tickets</button>
      </div>

      <div className="Adm-tic-header-section">
        <div className="Adm-tic-title-block">
          <img src={TicketIcon} width={65} alt='' />
          
            <div>
            <h1 className="Adm-tic-main-title">{selectedTickets.subject}</h1>
            <p className="Adm-tic-id">{selectedTickets.id}</p>
            <p className="Adm-tic-date-created">Created on : {selectedTickets.date}</p>
            </div>
            <div>
          </div>
          
        </div>

        <div className="Adm-tic-meta-info">
          <div className="Adm-tic-meta-row">
            <span className="Adm-tic-meta-label">Priority :</span>
            <span className="Adm-tic-meta-value Adm-tic-priority-medium">{selectedTickets.priority}</span>
          </div>
          <div className="Adm-tic-meta-row">
            <span className="Adm-tic-meta-label">Category :</span>
            <span className="Adm-tic-meta-value">{selectedTickets.category}</span>
          </div>
          <div className="Adm-tic-meta-row">
            <span className="Adm-tic-meta-label">Status :</span>
            <span  className={`AdminTickets-status ${selectedTickets.status.replace(/\s/g, "")}`}>{selectedTickets.status}</span>
          </div>
        </div>
      </div>
       <div className="Adm-tic-user-section">
            <h2 className="Adm-tic-section-title">User Information</h2>
            <div className="Adm-tic-user-grid">
              <div className="Adm-tic-grid-row"><span className="Adm-tic-grid-label">Name :</span><span className="Adm-tic-grid-val Adm-tic-link">{selectedTickets.name}</span></div>
              <div className="Adm-tic-grid-row"><span className="Adm-tic-grid-label">Mobile number :</span><span className="Adm-tic-grid-val">+91 9876543210</span></div>
              <div className="Adm-tic-grid-row"><span className="Adm-tic-grid-label">Mail ID :</span><span className="Adm-tic-grid-val">{selectedTickets.email}</span></div>
              <div className="Adm-tic-grid-row"><span className="Adm-tic-grid-label">User :</span><span className="Adm-tic-grid-val">Jobseeker</span></div>
            </div>
          </div>

      <div className="Adm-tic-main-content">
        <div className="Adm-tic-left-panel">
          <div className="Adm-tic-details-section">
            <h2 className="Adm-tic-section-title">Description</h2>
            <p className="Adm-tic-description">{selectedTickets.message}</p>
            
            
            <div className="Adm-tic-attachment-block">
              <span className="Adm-tic-attachment-label">Attachment</span>
              <div className="Adm-tic-attachment-card">
                <span className="Adm-tic-file-icon">📄</span>
                <span className="Adm-tic-file-name">Screenshot_2026-05-11.png</span>
                <span className="Adm-tic-file-size">245 KB</span>
                <button className="Adm-tic-download-btn">📥</button>
              </div>
            </div>
          </div>
        </div>
        
      </div>
      <div className="Adm-tic-top-actions">
          <button onClick={()=>setIsModalOpen(true)} className="Adm-tic-btn-action">Edit Status</button>
          <button onClick={handleDeleteTicket} className="Adm-tic-btn-action Adm-tic-btn-delete">Delete</button>
        </div>

        {isModalOpen && (
        <div className="status-modal-overlay">
            <div className="status-modal-content">
                <h3>Select Status</h3>
                
                <div className="status-modal-options">
                    <button onClick={() => handleStatusSelection("In Progress")}>In Progress</button>
                    <button onClick={() => handleStatusSelection("Hold")}>Hold</button>
                    <button onClick={() => handleStatusSelection("Resolved")}>Resolved</button>
                </div>

                <button className="status-modal-cancel" onClick={() => setIsModalOpen(false)}>
                    Cancel
                </button>
            </div>
        </div>
    )}
    </div>
)}

        
        </>
    );
};