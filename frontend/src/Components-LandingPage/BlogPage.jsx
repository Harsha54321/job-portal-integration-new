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
      onClick={() => navigate(`/Job-portal/jobseeker/Blogs/BlogDatas/${item.title}`, { state: { blogData: item } })}
      style={{ cursor: "pointer" }}
    >
      <img src={item.Thumbnail} alt={item.title} width="300" />
      <p className='blog-date'>{item.date}</p>
      <h3 className={item.isCategory ? 'card-title' : ''}>{item.title}</h3>

      {!item.isCategory && (
        <p style={{
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical'
        }}>
          {ReduceDesc(item.desc, 10)}
        </p>
      )}

      <p style={{ fontSize: "20px", color: "#5295f8", fontWeight: "600", marginTop: "10px" }}>
        Read more
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
        <img src={blogheadimg} alt="blogpage header" width="1450px" style={{ padding: "25px" }} />
      </div>

      {Object.entries(publishedBlogs).map(([sectionTitle, sectionItems]) => {
        const filteredItems = sectionItems.filter(item => item.Status === "Published");
        if (filteredItems.length === 0) return null;

        return (
          <div className='cat-con' key={sectionTitle}>
            <div className='categories2'>
              <h1>{sectionTitle}</h1>
              {filteredItems.length > 3 && (
                <button onClick={() => {
                  navigate(`/Job-portal/jobseeker/Blogs/view-all/${sectionTitle}`, {
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