import useInactivityLogout from './useInactivityLogout'
import './App.css'
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'
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
import RoleLanding from './Components-LandingPage/RoleLanding'
import { SearchResults } from './Components-Jobseeker/SearchResults'
import { JobProvider } from './JobContext';
import { JobApplication } from './Components-Jobseeker/JobApplication'
import { ApplicationStatusScreen } from './Components-Jobseeker/ApplicationStatusScreen'
import { AppliedJobsOverview } from './Components-Jobseeker/AppliedJobsOverview'
import { Revoked } from './Components-Jobseeker/Revoked'
import { Settings } from './Components-Jobseeker/Settings'
import { BlogPage } from './Components-LandingPage/BlogPage'
import { BlogCategory } from './Components-LandingPage/BlogCategory'
import { TechnologyBlog } from './Components-LandingPage/TechnologyBlog'
import { ContactUs } from './Components-LandingPage/ContactUs'
import { FAQ } from './Components-LandingPage/FAQ'
import { HelpCenter } from './Components-Jobseeker/HelpCenter'
import { RaiseTicket } from './Components-Jobseeker/RaiseTicket'
import { LiveChat } from './Components-Jobseeker/LiveChat'
import { ProfileCreationHelp } from './Components-Jobseeker/ProfileCreationHelp'
import { ResumeUploadHelp } from './Components-Jobseeker/ResumeUploadHelp'
import { JobApplyIssuesHelp } from './Components-Jobseeker/JobApplyIssuesHelp'
import { InterviewSchedulingHelp } from './Components-Jobseeker/InterviewSchedulingHelp'
import { JobPostingHelp } from './Components-Jobseeker/JobPostingHelp'
import { CandidateSearchHelp } from './Components-Jobseeker/CandidateSearchHelp'
import { SubscriptionIssuesHelp } from './Components-Jobseeker/SubscriptionIssuesHelp'
import { InvoicePaymentHelp } from './Components-Jobseeker/InvoicePaymentHelp'
import { LoginIssuesHelp } from './Components-Jobseeker/LoginIssuesHelp'
import { PageErrorsHelp } from './Components-Jobseeker/PageErrorsHelp'
import { FileUploadHelp } from './Components-Jobseeker/FileUploadHelp'
import { EmployerDashboard } from './Components-Employer/EmployerDashboard'
import { EMessenger } from './Components-Employer/EMessenger'
import { JMessenger } from './Components-Jobseeker/JMessenger'
import ScrollToTop from './ScrollToTop'
import { ReportAJob } from './Components-Jobseeker/ReportAJob'
import { OtpVerification } from './Components-JobseekerSignup/OtpVerification'
import { AboutYourCompany } from './Components-Employer/AboutYourCompany'
import { CompanyVerify } from './Components-Employer/CompanyVerify'
import { PostJobForm } from './Components-Employer/PostJobForm'
import { PostJobPreview } from './Components-Employer/PostJobPreview'
import { PostedJobs } from './Components-Employer/PostedJobs'
import { EditJob } from './Components-Employer/EditJob'
import { FindTalent } from './Components-Employer/FindTalent'
import { JsProfileOverview } from './Components-Employer/JsProfileOverview'
import { PaymentMethods } from './Components-Employer/PaymentMethods'
import { PlansBilling } from './Components-Employer/PlansBilling'
import { MembershipPlans } from './Components-Employer/MembershipPlans'
import { BillingSec } from './Components-Employer/BillingSec'
import { GoogleOAuthProvider } from "@react-oauth/google"
import { AdminLogin } from './Components-Admin/AdminLogin'
import { AdminDashboard } from './Components-Admin/AdminDashboard'
import { ViewAllBlogs } from './Components-LandingPage/ViewallBlogs'
import { BlogDatas } from './Components-LandingPage/BlogDatas'
import { Aforgotpassword } from './Components-Admin/Aforgotpassword'
import { Acreatepassword } from './Components-Admin/Acreatepassword'
import React, { useEffect } from 'react'
import { requestAndRegisterNotificationPermission, listenForForegroundMessages } from "./firebaseTokenHandler";
import RoleSignupLanding from './Components-LandingPage/RoleSignupLanding';
import  WeeklySummary  from './Components-Employer/WeeklySummary';
import RaisedTickets from './Components-Jobseeker/RaisedTickets';

const Layout = () => {
  useInactivityLogout()
  useEffect(() => {
    const token = sessionStorage.getItem("access");
    if (token) {
      requestAndRegisterNotificationPermission();
      listenForForegroundMessages();
    }
  }, []);

  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  )
}

const router = createBrowserRouter([
  {
    element: <Layout />,

    // Add the errorElement right here!
    errorElement: (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <h2>404 - Page Not Found</h2>
        <a href="/">Return to Home</a>
      </div>
    ),

    children: [
      { path: '/', element: <Landingpage /> },
      {
        path: '/Job-portal/role-selection',
        element: <RoleLanding />,
      },
      {
        path: '/Job-portal/signup-selection',
        element: <RoleSignupLanding />,
      },

      {
        path: '/Job-portal/jobseeker',
        children: [
          { path: 'login', element: <Jlogin /> },
          { path: 'login/forgotpassword', element: <Jforgotpassword /> },
          { path: 'login/forgotpassword/createpassword', element: <Jcreatepassword /> },
          { path: 'signup', element: <Jsignup /> },
          { path: '', element: <Afterloginlanding /> },
          { path: 'OpportunityOverview/:id', element: <OpportunityOverview /> },
          { path: 'ReportAJob/:id', element: <ReportAJob /> },
          { path: 'myjobs', element: <MyJobs /> },
          { path: 'jobs', element: <JobsTab /> },
          { path: 'companies', element: <CompaniesTab />},
          { path: 'companies', element: <CompaniesTab /> },
          { path: 'companies/:companyId', element: <JobsThroughCompany /> },
          { path: 'myprofile', element: <MyProfile /> },
          { path: 'aboutus', element: <AboutUs /> },
          { path: 'jobapplication/:id', element: <JobApplication /> },
          { path: 'searchresults', element: <SearchResults /> },
          { path: 'submitted/:id', element: <ApplicationStatusScreen /> },
          { path: 'appliedjobsoverview/:id', element: <AppliedJobsOverview /> },
          { path: 'withdrawn', element: <Revoked /> },
          { path: 'Settings', element: <Settings /> },
          { path: 'ContactUs', element: <ContactUs /> },
          { path: 'FAQ', element: <FAQ /> },
          { path: 'mytickets', element: <RaisedTickets role="jobseeker" /> },
          {
            path: 'Blogs',
            children: [
              { path: '', element: <BlogPage /> },
              { path: 'Category', element: <BlogCategory /> },
              { path: 'Technology', element: <TechnologyBlog /> },
              { path: 'BlogDatas/:title', element: <BlogDatas /> },
              { path: 'view-all/:category', element: <ViewAllBlogs /> },
            ]
          },
          {
            path: 'help-center',
            children: [
              { path: '', element: <HelpCenter /> },
              { path: 'raise-a-ticket', element: <RaiseTicket /> },
              { path: 'help-FAQs', element: <FAQ /> },
              { path: 'live-chat', element: <LiveChat /> },
              { path: 'profile-creation-help', element: <ProfileCreationHelp /> },
              { path: 'resume-upload-help', element: <ResumeUploadHelp /> },
              { path: 'job-apply-help', element: <JobApplyIssuesHelp /> },
              { path: 'interview-scheduling-help', element: <InterviewSchedulingHelp /> },
              { path: 'job-posting-help', element: <JobPostingHelp /> },
              { path: 'candidate-search-help', element: <CandidateSearchHelp /> },
              { path: 'subscription-issue-help', element: <SubscriptionIssuesHelp /> },
              { path: 'invoice-payment-help', element: <InvoicePaymentHelp /> },
              { path: 'login-issue-help', element: <LoginIssuesHelp /> },
              { path: 'page-error-help', element: <PageErrorsHelp /> },
              { path: 'file-upload-help', element: <FileUploadHelp /> },
            ]
          },
          { path: 'chat', element: <JMessenger /> },
        ]
      },
      {
        path: '/Job-portal',
        children: [
          {
            path: 'login/otpverification',
            element: <OtpVerification />,
          },
        ]
      },

      {
        path: '/Job-portal/employer',
        children: [
          { path: 'login', element: <Elogin /> },
          { path: 'signup', element: <Esignup /> },
          { path: 'login/forgotpassword', element: <Eforgotpassword /> },
          { path: 'login/forgotpassword/createpassword', element: <Ecreatepassword /> },
        ]
      },
      {
        // Added :id to catch the chat ID in the URL
        path: '/Job-portal/employer-chat/:id?',
        element: <EMessenger />
      },
      {
        path: '/Job-portal/Employer',
        children: [
          { path: 'Dashboard', element: <EmployerDashboard /> },
          // { path: 'chat', element: <EMessenger /> },
          {
            path: 'about-your-company',
            element: <AboutYourCompany />
          },
          {
            path: 'about-your-company/company-verification',
            element: <CompanyVerify />,
          },
          {
            path: 'PostJob',
            element: <PostJobForm />
          },
          {
            path: 'PostJobpreview',
            element: <PostJobPreview />
          },
          {
            path: 'Postedjobs',
            element: <PostedJobs />
          },
          {
            path: 'EditJob',
            element: <EditJob />
          },

          {
            path: 'chat',
            element: <EMessenger />
          },
          {
            path: 'FindTalent',
            element: <FindTalent />
          },
          {
            path: 'FindTalent/ProfileOverview/:id',
            element: <JsProfileOverview />
          },
          {
            path: 'Billing',
            element: <BillingSec />
          },
          {
            path: 'Membership',
            element: <MembershipPlans />
          },
          {
            path: 'PlansBilling',
            element: <PlansBilling />
          },
          {
            path: 'PaymentMethods',
            element: <PaymentMethods />
          },
          // {
          //   path: 'about-your-company/company-verification',
          //   element: <CompanyVerify />
          // }

          {
            path: 'WeeklySummary',
            element: <WeeklySummary/>
          },
        ]

      },
      {
        path: '/Job-portal/Admin',
        children: [
          { path: 'login', element: <AdminLogin /> },
          { path: 'login/forgotpassword', element: <Aforgotpassword /> },
          { path: 'login/forgotpassword/createpassword', element: <Acreatepassword /> },
          { path: 'Dashboard', element: <AdminDashboard /> },
        ]
      },
    ]

  }

])

function App() {
  return (
    <GoogleOAuthProvider clientId="534453822581-vvarj10pdfecp6ouht0qi1a4j6q333ak.apps.googleusercontent.com">
      <JobProvider>
        <RouterProvider router={router} />
      </JobProvider>
    </GoogleOAuthProvider>
  )
}

export default App