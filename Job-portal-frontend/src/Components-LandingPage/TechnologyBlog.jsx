import React from 'react';
import blogimg from "../assets/Blog_Images/blog1.png"
import bloggimg from "../assets/Blog_Images/blog2.png";
import blggimg from "../assets/Blog_Images/blog3.png";
import blogcimg from "../assets/Blog_Images/blog4.png";
import bloggcimg from "../assets/Blog_Images/blog5.png";
import blogccimg from "../assets/Blog_Images/blog6.png";
import bloggccimg from "../assets/Blog_Images/blog7.png";
import blggcimg from "../assets/Blog_Images/blog8.png";
import { Header } from '../Components-LandingPage/Header';
import { useNavigate } from 'react-router-dom';
import { Footer } from '../Components-LandingPage/Footer';

export const TechnologyBlog = () => {

  const navigate = useNavigate()
  return (
    <>
    <Header/>
      
      <div style={{margin:"120px 45px", boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)", borderRadius:"15px"}} className='search-backbtn-container'>
          <button style={{marginLeft:"15px"}}  className="back-btn" onClick={() => navigate(-1)}>Back</button>
          <div style={{width:"80%", textAlign:"center",marginLeft:"80px"}} ><h1 className="main-title">Technology Blogs</h1></div>
        </div>

      
        <div className='cat-con'>  
        <div className='container'>
       
        <div className='content'>
        <img src={blogimg} alt="blog" width="300"/>  
        <h3>Lorem ipsum dolor sit amet consectetur adipisicing elit. Id voluptas sunt aspernatur excepturi? Iusto, vero.</h3>
        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Repellendus, quibusdam.</p>
        
        <button>Read more</button>
        <p className="extra-content">Lorem ipsum dolor sit amet...</p>
        <p className="extra-content">Lorem ipsum dolor sit amet...</p>
        
        </div>
      
        <div className='content' >
        <img src={bloggimg} alt="blog" width="300"/>  
        <h3>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eveniet, nesciunt ea deleniti esse quo laborum!</h3>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Deleniti, dolores!</p>
        <button>Read more</button>
        <p className="extra-content">Lorem ipsum dolor sit amet...</p>
        <p className="extra-content">Lorem ipsum dolor sit amet...</p>
        </div>
      
        <div  className='content'>
        <img src={blggimg} alt="blog" width="300"/>
        <h3>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eveniet, nesciunt ea deleniti esse quo laborum!</h3>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Deleniti, dolores!</p>
        <button>Read more</button>
        <p className="extra-content">Lorem ipsum dolor sit amet...</p>
        <p className="extra-content">Lorem ipsum dolor sit amet...</p>
        </div>
      
        </div>
        </div>
        <div className='cat-con'>  
        <div className='container'>
       
        <div className='content'>
        <img src={blogcimg} alt="blog" width="300"/>  
        <h3>Lorem ipsum dolor sit amet consectetur adipisicing elit. Id voluptas sunt aspernatur excepturi? Iusto, vero.</h3>
        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Repellendus, quibusdam.</p>
        
        <button>Read more</button>
        <p className="extra-content">Lorem ipsum dolor sit amet...</p>
        <p className="extra-content">Lorem ipsum dolor sit amet...</p>
        
        
        </div>
      
        <div className='content' >
        <img src={bloggcimg} alt="blog" width="300"/>  
        <h3>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eveniet, nesciunt ea deleniti esse quo laborum!</h3>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Deleniti, dolores!</p>
        <button>Read more</button>
        <p className="extra-content">Lorem ipsum dolor sit amet...</p>
        <p className="extra-content">Lorem ipsum dolor sit amet...</p>
        </div>
      
        <div  className='content'>
        <img src={blogccimg} alt="blog" width="300"/>
        <h3>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eveniet, nesciunt ea deleniti esse quo laborum!</h3>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Deleniti, dolores!</p>
        <button>Read more</button>
        <p className="extra-content">Lorem ipsum dolor sit amet...</p>
        <p className="extra-content">Lorem ipsum dolor sit amet...</p>
        </div>
      
        </div>
        </div>
        <div className='cat-con'>  
        <div className='container'>
       
        <div className='content'>
        <img src={bloggccimg} alt="blog" width="300"/>  
        <h3>Lorem ipsum dolor sit amet consectetur adipisicing elit. Id voluptas sunt aspernatur excepturi? Iusto, vero.</h3>
        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Repellendus, quibusdam.</p>
        
        <button>Read more</button>
        <p className="extra-content">Lorem ipsum dolor sit amet...</p>
        <p className="extra-content">Lorem ipsum dolor sit amet...</p>
        
        </div>
      
        <div className='content' >
        <img src={blggcimg} alt="blog" width="300"/>  
        <h3>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eveniet, nesciunt ea deleniti esse quo laborum!</h3>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Deleniti, dolores!</p>
        <button>Read more</button>
        <p className="extra-content">Lorem ipsum dolor sit amet...</p>
        <p className="extra-content">Lorem ipsum dolor sit amet...</p>
        </div>
      
        <div  className='content'>
        <img src={blggimg} alt="blog" width="300"/>
        <h3>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eveniet, nesciunt ea deleniti esse quo laborum!</h3>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Deleniti, dolores!</p>
        <button>Read more</button>
        <p className="extra-content">Lorem ipsum dolor sit amet...</p>
        <p className="extra-content">Lorem ipsum dolor sit amet...</p>
        </div>
      
        </div>
        </div>
        <div className='cat-con'>  
        <div className='container'>
       
        <div className='content'>
        <img src={blogimg} alt="blog" width="300"/>  
        <h3>Lorem ipsum dolor sit amet consectetur adipisicing elit. Id voluptas sunt aspernatur excepturi? Iusto, vero.</h3>
        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Repellendus, quibusdam.</p>
        
        <button>Read more</button>
        <p className="extra-content">Lorem ipsum dolor sit amet...</p>
        <p className="extra-content">Lorem ipsum dolor sit amet...</p>
        
        </div>
      
        <div className='content' >
        <img src={bloggimg} alt="blog" width="300"/>  
        <h3>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eveniet, nesciunt ea deleniti esse quo laborum!</h3>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Deleniti, dolores!</p>
        <button>Read more</button>
        <p className="extra-content">Lorem ipsum dolor sit amet...</p>
        <p className="extra-content">Lorem ipsum dolor sit amet...</p>
        </div>
      
        <div  className='content'>
        <img src={blggimg} alt="blog" width="300"/>
        <h3>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eveniet, nesciunt ea deleniti esse quo laborum!</h3>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Deleniti, dolores!</p>
        <button>Read more</button>
        <p className="extra-content">Lorem ipsum dolor sit amet...</p>
        <p className="extra-content">Lorem ipsum dolor sit amet...</p>
        </div>
      
        </div>
        </div>
        <Footer/>
   </>
  );
};

