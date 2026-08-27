import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./BlogDatas.css";
import blogheadimg from "../assets/Blog_Images/bloghead.png";
import backIcon from '../assets/AdminAssets/BackBtn.png';
import { Footer } from '../Components-LandingPage/Footer';
import { Header } from '../Components-LandingPage/Header';
import { FHeader } from "../Components-Jobseeker/FHeader";

export const BlogDatas = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const blogData = location.state?.blogData;

  // If no data, redirect to blogs page
  React.useEffect(() => {
    if (!blogData) {
      navigate('/Job-portal/Blogs');
    }
  }, [blogData, navigate]);

  const handleBack = () => {
    navigate('/Job-portal/Blogs');
  };

  return (
    <>
      <FHeader/>

      <button style={{ marginTop: "99px" }} className="back-btn" onClick={handleBack}>
        <img src={backIcon} alt="back" /> Back
      </button>

      {blogData ? (
        <div className="blog-details-card">
          <h1 style={{ margin: "15px 0", padding: "10px", textTransform: "capitalize" }}>
            {blogData.title}
          </h1>
          <img src={blogData.Thumbnail} alt="blog" className="blog-image" />

          {blogData.desc && <p className="blog-main-desc">{blogData.desc}</p>}

          {blogData.points && blogData.points.length > 0 ? (
            blogData.points.map((point, index) => (
              <div key={index} className="blog-section">
                <h3> {index + 1}. {point.title} </h3>
                <ul>
                  {point.content?.map((item, idx) => (
                    <li key={idx}>{typeof item === 'object' ? item.text : item}</li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <></>
          )}
        </div>
      ) : (
        <div className="blog-details-card" style={{ textAlign: 'center', padding: '40px' }}>
          <h2>No content selected!</h2>
        </div>
      )}

      <Footer />
    </>
  );
};