import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./BlogDatas.css";
import blogheadimg from "../assets/Blog_Images/bloghead.png";
import backIcon from '../assets/AdminAssets/BackBtn.png';
import { Footer } from '../Components-LandingPage/Footer';
import { Header } from '../Components-LandingPage/Header';

export const BlogDatas = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const blogData = location.state?.blogData;

  return (
    <>
      <Header />

      {/* <div style={{ marginTop: "150px" }} className='blogpage'>
         <img src={blogheadimg} alt="blogpage" width="1450px" style={{ padding: "25px" }}/>
      </div> */}

      {/* <div style={{marginTop:"70px"}} className="blog-details-container"> */}

        <button style={{marginTop:"99px"}} className="back-btn" onClick={() => navigate(-1)}>
          <img src={backIcon} alt="back" /> Back
        </button>
        {/* <div></div> */}
        {blogData ? (
          <div className="blog-details-card">
             <h1 style={{margin:"15px 0",padding:"10px",textTransform:"capitalize"}}>{blogData.title}</h1>
            <img src={blogData.Thumbnail} alt="blog" className="blog-image"/>
           
            
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
              // <div className="blog-section">
              //   <p>Detailed article content coming soon for {blogData.title}...</p>
              // </div>
            )}
          </div>
        ) : (
          <div className="blog-details-card" style={{ textAlign: 'center', padding: '40px' }}>
            <h2>No content selected!</h2>
          </div>
        )}
      {/* </div> */}
       
      <Footer />
    </>
  );
};