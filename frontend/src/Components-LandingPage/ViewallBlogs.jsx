import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Header } from '../Components-LandingPage/Header';
import { Footer } from '../Components-LandingPage/Footer';
import './BlogPage.css'; 
import { BlogCard } from './BlogPage';

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
      <Header />
      <div 
        style={{ margin: "120px 45px", boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)", borderRadius: "15px" }} 
        className='search-backbtn-container'
      >
        <button 
          style={{ marginLeft: "15px" }} 
          className="back-btn" 
          onClick={() => navigate(-1)}
        >
          Back
        </button>
        <div style={{ width: "80%", textAlign: "center", marginLeft: "80px" }}>
          <h1 className="main-title" style={{ textTransform: "capitalize" }}>
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
            <div style={{ padding: "40px", textAlign: "center", width: "100%" }}>
              <h3>No blogs available in this section.</h3>
            </div>
          )}
          
        </div>
      </div>

      <Footer />
    </>
  );
};