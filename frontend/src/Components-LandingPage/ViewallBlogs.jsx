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
          margin: "120px 45px", 
          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)", 
          borderRadius: "15px",
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "15px",
          padding: "15px"
        }} 
        className='search-backbtn-container'
      >
        <button 
          style={{ 
            marginLeft: "5px",
            flexShrink: 0
          }} 
          className="back-btn" 
          onClick={() => navigate('/Job-portal/Blogs')}
        >
          <img src={backIcon} alt="back" style={{ width: "15px", height: "15px", filter: "brightness(0) invert(1)" }} />
          Back
        </button>
        <div style={{ 
          flex: 1, 
          textAlign: "center",
          minWidth: "200px"
        }}>
          <h1 className="main-title" style={{ 
            textTransform: "capitalize",
            wordBreak: "break-word",
            margin: 0
          }}>
            {pageTitle}
          </h1>
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