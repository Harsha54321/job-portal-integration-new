import React from 'react'
import './Topcompanies.css'
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from 'react-slick';
import Apple from '../assets/Apple-Logo.png'
import Wipro from '../assets/WIT.png'
import CTS from '../assets/CTSH_BIG.png'
import Amazon from '../assets/AMZN_BIG.png'
import Google from '../assets/GOOG.png'
import Infy from '../assets/INFY_BIG.png'
import Tcs from '../assets/TCS.png'
import META from '../assets/META_BIG.png'
import starIcon from '../assets/Star_icon.png'
import left from '../assets/left_arrow.png'
import right from '../assets/right_arrow.png'

/* Below Code is removed after backend integration*/
const topCompaniesList = [
  {
    id: 1,
    name: "Apple",
    logo: Apple,
    rating: 4.3,
    reviews: "25k+",
    desc: "Join us. Be you.",
  },
  {
    id: 2,
    name: "Wipro",
    logo: Wipro,
    rating: 4.3,
    reviews: "55k+",
    desc: "Grow with us. Be bold.",
  },
  {
    id: 3,
    name: "Cognizant",
    logo: CTS,
    rating: 3.7,
    reviews: "55k+",
    desc: "Leading ITeS company with global presence",
  },
  {
    id: 4,
    name: "Amazon",
    logo: Amazon,
    rating: 4.0,
    reviews: "27.5k+",
    desc: "World’s largest Internet company",
  },
  {
    id: 5,
    name: "Google",
    logo: Google,
    rating: 4.5,
    reviews: "30k+",
    desc: "Organizing the world’s information",
  },
  {
    id: 6,
    name: "Infosys",
    logo: Infy,
    rating: 4.1,
    reviews: "50k+",
    desc: "Navigate your next",
  },
  {
    id: 7,
    name: "TCS",
    logo: Tcs,
    rating: 4.2,
    reviews: "65k+",
    desc: "Building on belief",
  },
  {
    id: 8,
    name: "Meta",
    logo: META,
    rating: 4.4,
    reviews: "22k+",
    desc: "Bring the world closer together",
  }
];

const CustomPrevArrow = ({ onClick }) => (
  <div className="custom-arrow prev" onClick={onClick}>
    <img src={left} alt="Previous" />
  </div>
);

const CustomNextArrow = ({ onClick }) => (
  <div className="custom-arrow next" onClick={onClick}>
    <img src={right} alt="Next" />
  </div>
);

export const Topcompanies = () => {
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    nextArrow: <CustomNextArrow />,
    prevArrow: <CustomPrevArrow />,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1 } },
    ],
  };

  return (
      <section className="carousel-wrapper">
        <h2 className="carousel-title">Top Companies Hiring Now</h2>
        <Slider {...settings}>
          {topCompaniesList.map((company)=>(
            <div className="carousel-card" key={company.id}>
              <img className="carousel-company-logo" src={company.logo} alt={company.name}/>
              <div className="carousel-card-header">
                <h3>{company.name}</h3>
                <p className='carousel-company-rating'><span className="star"><img src={starIcon} /></span> {company.rating} | {company.reviews} reviews</p>
              </div>
              <p className="carousel-desc">{company.desc}</p>
              <button className="carousel-view-jobs">View jobs</button>
            </div>
          ))}
        </Slider>
        <div className="carousel-view-all-wrapper">
          <button className="carousel-view-all">View All Companies</button>
        </div>
      </section>
  )
}
