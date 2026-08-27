import React from 'react';
import './BlogPage.css';
import { useNavigate } from 'react-router-dom';
import { Footer } from '../Components-LandingPage/Footer';
import blogheadimg from "../assets/Blog_Images/bloghead.png";
import { FHeader } from '../Components-Jobseeker/FHeader';
import { useJobs } from '../JobContext';

export const BlogCard = ({ item }) => {
  const navigate = useNavigate();

  const ReduceDesc = (text, wordLimit) => {
    if (!text) return '';
    const words = text.split(/\s+/);
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(' ') + '...';
    }
    return text;
  };

  return (
    <div
      className='content'
      onClick={() => navigate(`/Job-portal/Blogs/BlogDatas/${encodeURIComponent(item.title)}`, {
        state: { blogData: item }
      })}
      style={{
        cursor: "pointer",
        height: "100%",
        justifyContent: "flex-start"
      }}
    >
      <img src={item.Thumbnail} alt={item.title} />
      <p className='blog-date'>{item.date}</p>
      <h3 style={{
        margin: "15px 0 10px",
        fontSize: "18px",
        color: "#333",
        wordBreak: "break-word",
        lineHeight: "1.4",
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden"
      }}>
        {item.title}
      </h3>

      {!item.isCategory && (
        <p style={{
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          wordBreak: 'break-word',
          flex: "1 0 auto",
          marginBottom: "10px"
        }}>
          {ReduceDesc(item.desc, 10)}
        </p>
      )}

      <p style={{
        fontSize: "16px",
        color: "#5295f8",
        fontWeight: "600",
        marginTop: "auto",
        paddingTop: "10px",
        borderTop: "1px solid #eee"
      }}>
        Read more →
      </p>
    </div>
  );
};

export const BlogPage = () => {
  const navigate = useNavigate();
  const { publishedBlogs } = useJobs();

  return (
    <>
      <FHeader />

      <div style={{ marginTop: "150px" }} className='blogpage'>
        <img
          src={blogheadimg}
          alt="blogpage header"
          style={{ width: "100%", maxWidth: "1450px", padding: "0 25px", boxSizing: "border-box" }}
        />
      </div>

      {Object.entries(publishedBlogs).map(([sectionTitle, sectionItems]) => {
        const filteredItems = sectionItems.filter(item => item.Status === "Published");
        if (filteredItems.length === 0) return null;

        return (
          <div className='cat-con' key={sectionTitle}>
            <div className='categories2'>
              <h1 style={{ wordBreak: "break-word" }}>{sectionTitle}</h1>
              {filteredItems.length > 3 && (
                <button
                  onClick={() => {
                    navigate(`/Job-portal/Blogs/view-all/${encodeURIComponent(sectionTitle)}`, {
                      state: { pageTitle: sectionTitle, pageData: filteredItems }
                    });
                  }}
                  className='view-all'
                >
                  View all
                </button>
              )}
            </div>

            <div className='container2'>
              {filteredItems.slice(0, 3).map((item) => (
                <BlogCard key={item.id} item={item} />
              ))}
            </div>
            <hr style={{ border: "0.5px solid #eee", margin: "20px 25px" }} />
          </div>
        )
      })}

      <Footer />
    </>
  );
};