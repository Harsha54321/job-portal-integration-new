import React from 'react'
import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Landingpage } from './Landingpage'
import { Elogin } from './Components-EmployerSignup/Elogin'
import { Jlogin } from './Components-JobseekerSignup/Jlogin'
import { Jsignup } from './Components-JobseekerSignup/Jsignup'
import { Jcreatepassword } from './Components-JobseekerSignup/Jcreatepassword'
import { Jforgotpassword } from './Components-JobseekerSignup/Jforgotpassword'
import { Afterloginlanding } from './Components-Jobseeker/Afterloginlanding'
import { Esignup } from './Components-EmployerSignup/Esignup'
import { Eforgotpassword } from './Components-EmployerSignup/Eforgotpassword'
import { Ecreatepassword } from './Components-EmployerSignup/Ecreatepassword'
import { OpportunityOverview } from './Components-Jobseeker/OpportunityOverview'
import { MyJobs } from './Components-Jobseeker/MyJobs'
import { JobsTab } from './Components-Jobseeker/JobsTab'
import { CompaniesTab } from './Components-Jobseeker/CompaniesTab'
import { MyProfile } from './Components-Jobseeker/MyProfile'
import { JobsThroughCompany } from './Components-Jobseeker/JobsThroughCompany'
import { AboutUs } from './Components-LandingPage/AboutUs'
import { SearchResults } from './Components-Jobseeker/SearchResults'
import { JobProvider } from './JobContext';
import { JobApplication } from './Components-Jobseeker/JobApplication'
import { ApplicationStatusScreen } from './Components-Jobseeker/ApplicationStatusScreen'
import { AppliedJobsOverview } from './Components-Jobseeker/AppliedJobsOverview'
import { Revoked } from './Components-Jobseeker/Revoked'
import { Settings } from './Components-Jobseeker/Settings'
import { Blogpage } from './Components-LandingPage/BlogPage'
import BlogCategory from './Components-LandingPage/BlogCategory'
import { TechnologyBlog } from './Components-LandingPage/TechnologyBlog'
import { ContactUs } from './Components-LandingPage/Contactus'
import { FAQ } from './Components-LandingPage/FAQ'

const router = createBrowserRouter([{
  path: '/Job-portal',
  element: <Landingpage />,
},
{
  path: '/Job-portal/jobseeker/login',
  element: <Jlogin />,
},
{
  path: '/Job-portal/jobseeker/login/forgotpassword',
  element: <Jforgotpassword />,
},
{
  path: '/Job-portal/jobseeker/signup',
  element: <Jsignup />,
},
{
  path: '/Job-portal/jobseeker/login/forgotpassword/createpassword',
  element: <Jcreatepassword />,
},
{
  path: '/Job-portal/jobseeker/',
  element: <Afterloginlanding />,
},
{
  path: '/Job-portal/employer/login',
  element: <Elogin />,
},
{
  path: '/Job-portal/employer/signup',
  element: <Esignup />,
},
{
  path: '/Job-portal/employer/login/forgotpassword',
  element: <Eforgotpassword />,
},
{
  path: '/Job-portal/employer/login/forgotpassword/createpassword',
  element: <Ecreatepassword />,
},
{
  path: '/Job-portal/jobseeker/OpportunityOverview/:id',
  element: <OpportunityOverview />,
},
{
  path: '/Job-portal/jobseeker/myjobs',
  element: <MyJobs />,
},
{
  path: '/Job-portal/jobseeker/jobs',
  element: <JobsTab />,
},
{
  path: '/Job-portal/jobseeker/companies',
  element: <CompaniesTab />,
},
{
  path: '/Job-portal/jobseeker/myprofile',
  element: <MyProfile />,
},
{
  path: '/Job-portal/jobseeker/aboutus',
  element: <AboutUs />,
},
{
  path: '/Job-portal/jobseeker/companies/:companyId',
  element: <JobsThroughCompany />,
},
{
  path: '/Job-portal/jobseeker/jobapplication/:id',
  element: <JobApplication />,
},
{
  path: '/Job-portal/jobseeker/searchresults',
  element: <SearchResults />,
},
{
  path: '/Job-portal/jobseeker/submitted/:id',
  element: <ApplicationStatusScreen />,
},
{
  path: '/Job-portal/jobseeker/appliedjobsoverview/:id',
  element: <AppliedJobsOverview />,
},
{
  path: '/Job-portal/jobseeker/withdrawn',
  element: <Revoked />,
},
{
  path: '/Job-portal/jobseeker/Settings',
  element: <Settings />
},
{
  path: '/Job-portal/jobseeker/Contact_Us',
  element: < ContactUs/>
},
{
  path: '/Job-portal/jobseeker/FAQ',
  element: <FAQ/>
},
{
  path: '/Job-portal/jobseeker/Blogs',
  element: < Blogpage/>
},
{
  path: '/Job-portal/jobseeker/Blogs/Category',
  element: <BlogCategory />
},
{
  path: '/Job-portal/jobseeker/Blogs/Technology',
  element: <TechnologyBlog/>
},
])

function App() {
  return (
    <JobProvider>
      <RouterProvider router={router} />
    </JobProvider>
  )
}

export default App
