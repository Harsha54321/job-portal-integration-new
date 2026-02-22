import React, { useState } from 'react'
import './Blogpage.css'
import blogheadimg from "../assets/Blog_Images/bloghead.png";
import blogimg from "../assets/Blog_Images/blog1.png";
import bloggimg from "../assets/Blog_Images/blog2.png";
import blggimg from "../assets/Blog_Images/blog3.png";
import blogcimg from "../assets/Blog_Images/blog4.png";
import bloggcimg from "../assets/Blog_Images/blog5.png";
import blogccimg from "../assets/Blog_Images/blog6.png";
import bloggccimg from "../assets/Blog_Images/blog7.png";
import blggcimg from "../assets/Blog_Images/blog8.png";
import blogimgg from "../assets/Blog_Images/blog9.png";
import bloggimgg from "../assets/Blog_Images/blog10.png";
import blooggimgg from "../assets/Blog_Images/blog11.png";
import { useNavigate } from 'react-router-dom';
import { Footer } from '../Components-LandingPage/Footer';
import { Header } from '../Components-LandingPage/Header';

  export const Blogpage = () => {
    // const [showMore, setShowMore] = useState(false);
    const navigate = useNavigate()
  return (
  <>
  <Header/>

  <div style={{marginTop:"150px"}} className='blogpage'>
  <img src={blogheadimg} alt="blogpage" width="1450px" padding="25px"/>
     
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
  <div className='categories'>
  <h1>Categories</h1>
  <button onClick={()=>{navigate('/Job-portal/jobseeker/Blogs/Category')}} className='view-all'>viewall</button>
  </div>
    
  <div className='container'>
  <div className='content'>
  <img src={blogcimg} alt="blog" width="300"/>
  <h3 className='card-title'>career</h3>
  <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Repellendus, quibusdam.</p>
  <button>Read more</button>
  <p className="extra-content">Lorem ipsum dolor sit amet...</p>
  <p className="extra-content">Lorem ipsum dolor sit amet...</p>
  </div>

  <div className='content'>
  <img src={bloggcimg} alt="blog" width="300"/> 
  <h3 className='card-title'>Onboarding</h3>
  <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Deleniti, dolores!</p>
  <button>Read more</button>
  <p className="extra-content">Lorem ipsum dolor sit amet...</p>
  <p className="extra-content">Lorem ipsum dolor sit amet...</p>
  </div>

  <div className='content' >
  <img src={blogccimg} alt="blog" width="300"/>
  <h3 className='card-title'>tasks</h3>
  <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Deleniti, dolores!</p>
  <button>Read more</button>
  <p className="extra-content">Lorem ipsum dolor sit amet...</p>
  <p className="extra-content">Lorem ipsum dolor sit amet...</p>
  </div>

  <div className='content'>
  <img src={bloggccimg} alt="blog" width="300"/> 
  <h3 className='card-title'>Worktype</h3>
  <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Repellendus, quibusdam.</p>
  <button>Read more</button>
 <p className="extra-content">Lorem ipsum dolor sit amet...</p>
  <p className="extra-content">Lorem ipsum dolor sit amet...</p>
  </div>

  <div className='content'>
  <img src={blggcimg} alt="blog" width="300"/>
  <h3 className='card-title'>Meetings</h3>
  <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Deleniti, dolores!</p>
  <button>Read more</button>
  <p className="extra-content">Lorem ipsum dolor sit amet...</p>
  <p className="extra-content">Lorem ipsum dolor sit amet...</p>
  </div>

  <div className='content'>
  <img src={blogimgg} alt="blog" width="300"/>
  <h3 className='card-title'>Environment</h3>
  <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Deleniti, dolores!</p>
  <button>Read more</button>
  <p className="extra-content">Lorem ipsum dolor sit amet...</p>
  <p className="extra-content">Lorem ipsum dolor sit amet...</p>
  </div>
  </div>
  </div>

  <div className='cat-con'>
  <div className='categories'>
  <h1>Technology Blogs</h1>
  <button onClick={()=>{navigate('/Job-portal/jobseeker/Blogs/Technology')}} className='view-all'>viewall</button>
  </div>
   

      
  <div className='container'>
  <div className='content'>
  <img src={bloggimgg} alt="blog" width="300"/>
  <h3>Lorem ipsum dolor sit amet consectetur adipisicing elit. Id voluptas sunt aspernatur excepturi? Iusto, vero.</h3>
  <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Repellendus, quibusdam.</p>
  <button>Read more</button>
  <p className="extra-content">Lorem ipsum dolor sit amet...</p>
  <p className="extra-content">Lorem ipsum dolor sit amet...</p>
  </div>

  <div className='content'>
  <img src={blooggimgg} alt="blog" width="300"/>
  <h3>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eveniet, nesciunt ea deleniti esse quo laborum!</h3>
  <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Deleniti, dolores!</p>
  <button>Read more</button>
  <p className="extra-content">Lorem ipsum dolor sit amet...</p>
  <p className="extra-content">Lorem ipsum dolor sit amet...</p>
  </div>

  <div className='content'>
  <img src={blggimg} alt="blog" width="300"/>
  <h3>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eveniet, nesciunt ea deleniti esse quo laborum!</h3>
  <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Deleniti, dolores!</p>
  <button>Read more</button>
  <p className="extra-content">Lorem ipsum dolor sit amet...</p>
  <p className="extra-content">Lorem ipsum dolor sit amet...</p>
  </div>
    
     

  <div className='content'>
  <img src={blogimg} alt="blog" width="300"/> 
  <h3 >Lorem ipsum dolor sit amet consectetur adipisicing elit. Nihil minima, non rem!</h3>
  <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Repellendus, quibusdam.</p>
  <button>Read more</button>
  <p className="extra-content">Lorem ipsum dolor sit amet...</p>
  <p className="extra-content">Lorem ipsum dolor sit amet...</p>
  </div>

  <div className='content'>
  <img src={bloggimg} alt="blog" width="300"/>
  <h3 >Lorem ipsum dolor sit amet consectetur adipisicing elit. Impedit voluptatum cupiditate incidunt laborum amet molestiae.</h3>
  <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Deleniti, dolores!</p>
  <button>Read more</button>
  <p className="extra-content">Lorem ipsum dolor sit amet...</p>
  <p className="extra-content">Lorem ipsum dolor sit amet...</p>
  </div>

  <div className='content'>
  <img src={blggimg} alt="blog" width="300"/>
  <h3>Lorem ipsum dolor sit amet consectetur adipisicing elit. Iusto voluptatum eligendi et velit nihil. Error.</h3>
  <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Deleniti, dolores!</p>
  <button>Read more</button>
  <p className="extra-content">Lorem ipsum dolor sit amet...</p>
  <p className="extra-content">Lorem ipsum dolor sit amet...</p>
  </div>
  
  </div>
  </div>
     
  <Footer/>
    
  

  </>
  )
  }


