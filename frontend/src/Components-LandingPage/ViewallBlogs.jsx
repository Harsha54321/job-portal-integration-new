import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Header } from '../Components-LandingPage/Header';
import { Footer } from '../Components-LandingPage/Footer';
import './BlogPage.css'; 
import { BlogCard } from './BlogPage';
import { FHeader } from '../Components-Jobseeker/FHeader';
import backIcon from '../assets/AdminAssets/BackBtn.png';

export const ViewAllBlogs = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { Title } = useParams(); 

  const { pageTitle, pageData } = location.state || { 
    pageTitle: Title ? Title.replace(/-/g, ' ') : "Blogs", 
    pageData: [] 
  };

  return (
    <>
      <FHeader />
      <div 
        style={{ 
          margin: "120px 45px 30px 45px", 
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)", 
          borderRadius: "15px",
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "15px",
          padding: "20px 30px",
          background: "linear-gradient(135deg, #f8faff 0%, #eef4ff 100%)",
          border: "1px solid #e8edf5"
        }} 
        className='search-backbtn-container'
      >
        <button 
          style={{ 
            marginLeft: "5px",
            flexShrink: 0,
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 20px",
            border: "none",
            borderRadius: "8px",
            background: "#4f95ff",
            color: "#fff",
            fontWeight: "600",
            cursor: "pointer",
            transition: "background 0.3s ease",
            fontSize: "15px"
          }} 
          className="back-btn" 
          onClick={() => navigate('/Job-portal/Blogs')}
          onMouseEnter={(e) => e.target.style.background = "#3a7ad9"}
          onMouseLeave={(e) => e.target.style.background = "#4f95ff"}
        >
          <img src={backIcon} alt="back" style={{ width: "15px", height: "15px", filter: "brightness(0) invert(1)" }} />
          Back
        </button>
        
        <div style={{ 
          flex: 1, 
          textAlign: "center",
          minWidth: "200px"
        }}>
          <h1 style={{ 
            textTransform: "capitalize",
            wordBreak: "break-word",
            margin: 0,
            fontSize: "36px",
            fontWeight: "800",
            color: "#1a2332",
            letterSpacing: "-0.5px",
            position: "relative",
            display: "inline-block",
            padding: "0 20px"
          }}>
            {pageTitle}
            <span style={{
              position: "absolute",
              bottom: "-6px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "60px",
              height: "4px",
              background: "linear-gradient(90deg, #4f95ff, #6a4cff)",
              borderRadius: "4px"
            }}></span>
          </h1>
          <p style={{
            margin: "16px 0 0 0",
            fontSize: "15px",
            color: "#6b7a8f",
            fontWeight: "400"
          }}>
            {pageData && pageData.length > 0 ? `Showing ${pageData.length} blog${pageData.length > 1 ? 's' : ''}` : 'No blogs available'}
          </p>
        </div>
      </div>

      <div className='cat-con'>  
        <div className='container2'>
          {pageData && pageData.length > 0 ? (
            pageData.map((item) => (
              <BlogCard key={item.id} item={item} />
            ))
          ) : (
            <div style={{ 
              padding: "60px 20px", 
              textAlign: "center", 
              width: "100%",
              gridColumn: "1 / -1"
            }}>
              <h3 style={{ color: "#666", fontSize: "20px" }}>No blogs available in this section.</h3>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};