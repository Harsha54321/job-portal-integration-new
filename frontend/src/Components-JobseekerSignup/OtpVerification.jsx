// import React, { useState, useRef, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import manSitting from '../assets/login_otp_image.png';
// import './OtpVerification.css';

// export const OtpVerification = () => {
//   const navigate = useNavigate();
//   const [otp, setOtp] = useState(new Array(4).fill(""));
//   const [seconds, setSeconds] = useState(60);
//   const [error, setError] = useState("");
//   const inputRefs = useRef([]);

//   const DEFAULT_OTP = "1234";

//   const handleResend = () => {
//     setSeconds(60);
//     setError("");
//     setOtp(new Array(4).fill(""));
//     setTimeout(() => {
//         if (inputRefs.current[0]) inputRefs.current[0].focus();
//     }, 0);
//   };

//   useEffect(() => {
//     if (seconds > 0) {
//       const timer = setTimeout(() => setSeconds(seconds - 1), 1000);
//       return () => clearTimeout(timer);
//     } else {
//       setError("OTP Expired. Please request a new one.");
//     }
//   }, [seconds]);

//   const formatTime = (time) => {
//     const mins = Math.floor(time / 60);
//     const secs = time % 60;
//     return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
//   };

//   const handleChange = (element, index) => {
//     if (isNaN(element.value)) return false;
//     const newOtp = [...otp];
//     newOtp[index] = element.value;
//     setOtp(newOtp);
//     setError("");


//     if (element.value !== "" && index < 3) {
//       inputRefs.current[index + 1].focus();
//     }
//   };

//   const handleKeyDown = (e, index) => {
//     if (e.key === "Backspace" && !otp[index] && index > 0) {
//       inputRefs.current[index - 1].focus();
//     }
//   };

//   const handleVerifyOtp = (e) => {
//     e.preventDefault();
//     if (seconds === 0) return;


//     const enteredOtp = otp.join("");
//     if (enteredOtp.length < 4) {
//       setError("Please enter all 4 digits");
//       return;
//     }

//     if (enteredOtp === DEFAULT_OTP) {
//       navigate("/Job-portal/jobseeker/");
//     } else {
//       setError("Invalid OTP. Please try again.");
//     }
//   };

//   return (
//     <div className="login-page">
//       <header className="login-header">
//         <Link to="/Job-portal" className="logo">
//           <span className="logo-text">job portal</span>
//         </Link>
//         <div className="header-links">
//           <span className='no-account'>Don’t have an account?</span>
//           <Link to="/Job-portal/jobseeker/signup" className="signup-btn">Signup</Link>
//           <div className="separator"></div>
//           <Link to='/Job-portal/employer/login' className="employer-redirect-link">Employers Login</Link>
//         </div>
//       </header>

//       <div className="login-body">
//         <div className="login-illustration">
//           <img src={manSitting} alt="OTP Illustration" />
//         </div>

//         <div className="otp-container">
//           <button className="back-to-login" onClick={() => navigate(-1)}>
//             Back
//           </button>
//           <h2 className="otp-title">OTP</h2>
//           <p className="otp-subtitle">{seconds > 0 ? "We have sent code to your Mobile number" : "Your OTP session has expired."}</p>

//           <form className="otp-form" onSubmit={handleVerifyOtp}>
//             <div className={`otp-input-group ${seconds === 0 ? "expired-fade" : ""}`}>
//               {otp.map((data, index) => (
//                 <input
//                   key={index}
//                   type="text"
//                   maxLength="1"
//                   className={`otp-box ${error ? "input-error" : ""}`}
//                   value={data}
//                   onChange={(e) => handleChange(e.target, index)}
//                   onKeyDown={(e) => handleKeyDown(e, index)}
//                   ref={(el) => (inputRefs.current[index] = el)}
//                   disabled={seconds === 0}
//                 />
//               ))}
//             </div>

//             {error && <p className="error-msg" style={{ display: 'block', color: 'red', fontSize: '13px', marginTop: '5px', textAlign: 'center' }}>{error}</p>}


//             <div className="otp-timer-display">
//               {formatTime(seconds)}
//             </div>

//             {seconds > 0 ? (
//               <button type="submit" className="otp-login-btn">Login</button>
//             ) : (
//               <button type="button" className="otp-login-btn resend-highlight" onClick={handleResend}>
//                 Resend New OTP
//               </button>
//             )}
//           </form>

//           <div className="otp-resend-section">
//             <span>You didn't get mobile OTP ? </span>
//             <button
//               className="resend-btn"
//               disabled={seconds > 0}
//               onClick={handleResend}
//             >
//               Resend OTP
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }; 









// import React, { useState, useRef, useEffect } from 'react';
// import { Link, useNavigate, useLocation } from 'react-router-dom';
// import manSitting from '../assets/login_otp_image.png';
// import './OtpVerification.css';
// import api from '../api/axios';

// export const OtpVerification = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [otp, setOtp] = useState(new Array(4).fill(""));
//   const [seconds, setSeconds] = useState(60);
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [isEmailOTP, setIsEmailOTP] = useState(false);
//   const inputRefs = useRef([]);

//   // Get data from navigation state
//   const state = location.state || {};
//   const { email, phone, purpose, isMock, otpId, otpToken } = state;

//   // Determine if it's email OTP or mobile OTP
//   useEffect(() => {
//     if (email) {
//       setIsEmailOTP(true);
//     } else if (phone) {
//       setIsEmailOTP(false);
//     }
//   }, [email, phone]);

//   // For mobile mock OTP
//   const DEFAULT_MOCK_OTP = "123456";

//   const handleResend = async () => {
//     setSeconds(60);
//     setError("");
//     setOtp(new Array(4).fill(""));

//     try {
//       if (isEmailOTP && email) {
//         // Real email OTP resend for login
//         setLoading(true);
//         const response = await api.post('send-login-otp/', {
//           email: email,
//           purpose: 'login'  // Always login for this component
//         });

//         console.log('OTP resent successfully:', response.data);
//         alert(`New OTP sent to ${email}`);

//       } else if (phone && !isEmailOTP) {
//         // Mock mobile OTP resend
//         alert(`Mock OTP sent to ${phone}. For demo, use OTP: 123456`);
//       }
//     } catch (error) {
//       console.error('Error resending OTP:', error);
//       if (error.response) {
//         if (error.response.status === 404) {
//           setError("Email not registered. Please sign up first.");
//         } else if (error.response.status === 400) {
//           const errorData = error.response.data;
//           if (errorData.error) {
//             setError(errorData.error);
//           } else if (errorData.email) {
//             setError(Array.isArray(errorData.email) ? errorData.email[0] : errorData.email);
//           } else {
//             setError("Failed to resend OTP. Please try again.");
//           }
//         } else if (error.response.data?.error) {
//           setError(error.response.data.error);
//         } else {
//           setError("Failed to resend OTP. Please try again.");
//         }
//       } else {
//         setError("Network error. Please check your connection.");
//       }
//     } finally {
//       setLoading(false);
//     }

//     setTimeout(() => {
//       if (inputRefs.current[0]) inputRefs.current[0].focus();
//     }, 0);
//   };

//   useEffect(() => {
//     let timer;
//     if (seconds > 0) {
//       timer = setTimeout(() => setSeconds(seconds - 1), 1000);
//     }
//     return () => clearTimeout(timer);
//   }, [seconds]);

//   const formatTime = (time) => {
//     const mins = Math.floor(time / 60);
//     const secs = time % 60;
//     return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
//   };

//   const handleChange = (element, index) => {
//     if (isNaN(element.value)) return false;
//     const newOtp = [...otp];
//     newOtp[index] = element.value;
//     setOtp(newOtp);
//     setError("");

//     if (element.value !== "" && index < 3) {
//       inputRefs.current[index + 1].focus();
//     }
//   };

//   const handleKeyDown = (e, index) => {
//     if (e.key === "Backspace" && !otp[index] && index > 0) {
//       inputRefs.current[index - 1].focus();
//     }
//   };

//   const handleVerifyOtp = async (e) => {
//     e.preventDefault();
//     if (seconds === 0) {
//       setError("OTP has expired. Please request a new one.");
//       return;
//     }

//     const enteredOtp = otp.join("");
//     if (enteredOtp.length < 4) {
//       setError("Please enter all 4 digits");
//       return;
//     }

//     setLoading(true);
//     setError("");

//     try {
//       if (isEmailOTP && email) {
//         // For email OTP login - we need to verify OTP and then login
//         // First verify the OTP
//         const verifyResponse = await api.post('verify-login-otp/', {
//           email: email,
//           otp: enteredOtp
//         });

//         console.log('OTP Verification Response:', verifyResponse.data);

//         if (verifyResponse.data.message === "Email verified successfully") {
//           // OTP verified successfully, now perform login
//           try {
//             const loginResponse = await api.post('login/', {
//               email: email,
//               password: enteredOtp // Some backends use OTP as password for OTP login
//             });

//             console.log('Login Response:', loginResponse.data);

//             // Store tokens
//             if (loginResponse.data.access && loginResponse.data.refresh) {
//               localStorage.setItem('access', loginResponse.data.access);
//               localStorage.setItem('refresh', loginResponse.data.refresh);
//               localStorage.setItem('user_type', 'jobseeker');

//               // Navigate to dashboard
//               navigate("/Job-portal/jobseeker/");
//             } else {
//               setError("Login failed. Please try again.");
//             }
//           } catch (loginError) {
//             console.error('Login Error after OTP:', loginError);
//             if (loginError.response?.status === 401) {
//               setError("Invalid OTP. Please try again.");
//             } else {
//               setError("Login failed. Please try again.");
//             }
//           }
//         } else {
//           setError("Invalid OTP. Please try again.");
//         }

//       } else if (phone && !isEmailOTP && isMock) {
//         // Mock mobile OTP verification
//         if (enteredOtp === DEFAULT_MOCK_OTP.slice(0, 4)) {
//           alert("OTP verified successfully! Logging in...");
//           navigate("/Job-portal/jobseeker/");
//         } else {
//           setError("Invalid OTP. Please try again.");
//         }
//       }
//     } catch (error) {
//       console.error('OTP Verification Error:', error);

//       if (error.response) {
//         console.error('Error response:', error.response.data);

//         if (error.response.status === 400) {
//           const errorData = error.response.data;
//           if (errorData.error) {
//             setError(errorData.error);
//           } else if (errorData.detail) {
//             const errorMessage = Array.isArray(errorData.detail) ? errorData.detail[0] : errorData.detail;
//             setError(errorMessage);
//           } else if (errorData.otp) {
//             setError(Array.isArray(errorData.otp) ? errorData.otp[0] : errorData.otp);
//           } else {
//             setError("Invalid OTP. Please try again.");
//           }
//         } else if (error.response.status === 401) {
//           setError("Invalid OTP. Please try again.");
//         } else if (error.response.status === 404) {
//           setError("Email not found. Please check your email address.");
//         } else {
//           setError(error.response.data?.error || "OTP verification failed. Please try again.");
//         }
//       } else if (error.request) {
//         setError("No response from server. Please check your connection.");
//       } else {
//         setError("Verification failed. Please try again.");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="login-page">
//       <header className="login-header">
//         <Link to="/Job-portal" className="logo">
//           <span className="logo-text">Job portal</span>
//         </Link>
//         <div className="header-links">
//           <span className='no-account'>Don’t have an account?</span>
//           <Link to="/Job-portal/jobseeker/signup" className="signup-btn">Signup</Link>
//           <div className="separator"></div>
//           <Link to='/Job-portal/employer/login' className="employer-redirect-link">Employers Login</Link>
//         </div>
//       </header>

//       <div className="login-body">
//         <div className="login-illustration">
//           <img src={manSitting} alt="OTP Illustration" />
//         </div>

//         <div className="otp-container">
//           <button className="back-to-login" onClick={() => navigate(-1)}>
//             Back
//           </button>
//           <h2 className="otp-title">OTP Verification</h2>
//           <p className="otp-subtitle">
//             {seconds > 0 ? (
//               isEmailOTP ? 
//                 `We have sent verification code to ${email || 'your email'}` : 
//                 `We have sent verification code to ${phone || 'your mobile number'}`
//             ) : (
//               "Your OTP session has expired."
//             )}
//           </p>

//           <form className="otp-form" onSubmit={handleVerifyOtp}>
//             <div className={`otp-input-group ${seconds === 0 ? "expired-fade" : ""}`}>
//               {otp.map((data, index) => (
//                 <input
//                   key={index}
//                   type="text"
//                   maxLength="1"
//                   className={`otp-box ${error ? "input-error" : ""}`}
//                   value={data}
//                   onChange={(e) => handleChange(e.target, index)}
//                   onKeyDown={(e) => handleKeyDown(e, index)}
//                   ref={(el) => (inputRefs.current[index] = el)}
//                   disabled={seconds === 0 || loading}
//                   autoFocus={index === 0}
//                 />
//               ))}
//             </div>

//             {error && <p className="error-msg" style={{ display: 'block', color: 'red', fontSize: '13px', marginTop: '5px', textAlign: 'center' }}>{error}</p>}

//             <div className="otp-timer-display">
//               {formatTime(seconds)}
//             </div>

//             {seconds > 0 ? (
//               <button type="submit" className="otp-login-btn" disabled={loading}>
//                 {loading ? 'Verifying...' : 'Verify & Login'}
//               </button>
//             ) : (
//               <button type="button" className="otp-login-btn resend-highlight" onClick={handleResend} disabled={loading}>
//                 {loading ? 'Sending...' : 'Resend New OTP'}
//               </button>
//             )}
//           </form>

//           <div className="otp-resend-section">
//             <span>Didn't receive OTP? </span>
//             <button
//               className="resend-btn"
//               disabled={seconds > 0 || loading}
//               onClick={handleResend}
//             >
//               Resend OTP
//             </button>
//           </div>

//           {/* Show info for mock OTP */}
//           {!isEmailOTP && phone && isMock && (
//             <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '12px', color: '#666' }}>
//               Demo: Use OTP <strong>1234</strong> for verification
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };  



import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import manSitting from '../assets/login_otp_image.png';
import './OtpVerification.css';
import api from '../api/axios';
import { useJobs } from '../JobContext';

export const OtpVerification = () => {
  const navigate = useNavigate();
  const { fetchAllJobs } = useJobs();
  const location = useLocation();
  const [otp, setOtp] = useState(new Array(4).fill(""));
  const [seconds, setSeconds] = useState(60);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEmailOTP, setIsEmailOTP] = useState(false);
  const inputRefs = useRef([]);

  // Get data from navigation state
  const state = location.state || {};
  const { email, phone, purpose, isMock, otpId, otpToken } = state;

  // Determine if it's email OTP or mobile OTP
  useEffect(() => {
    if (email) {
      setIsEmailOTP(true);
    } else if (phone) {
      setIsEmailOTP(false);
    }
  }, [email, phone]);

  // For mobile mock OTP
  const DEFAULT_MOCK_OTP = "1234";

  const handleResend = async () => {
    setSeconds(60);
    setError("");
    setOtp(new Array(4).fill(""));

    try {
      if (isEmailOTP && email) {
        setLoading(true);
        const response = await api.post('send-login-otp/', {
          email: email
        });

        console.log('OTP resent successfully:', response.data);
        alert(`New OTP sent to ${email}`);

      } else if (phone && !isEmailOTP) {
        alert(`Mock OTP sent to ${phone}. For demo, use OTP: 1234`);
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      if (error.response) {
        if (error.response.status === 404) {
          setError("Email not registered. Please sign up first.");
        } else if (error.response.data?.error) {
          setError(error.response.data.error);
        } else {
          setError("Failed to resend OTP. Please try again.");
        }
      } else {
        setError("Network error. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }

    setTimeout(() => {
      if (inputRefs.current[0]) inputRefs.current[0].focus();
    }, 0);
  };

  useEffect(() => {
    let timer;
    if (seconds > 0) {
      timer = setTimeout(() => setSeconds(seconds - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [seconds]);

  const formatTime = (time) => {
    const mins = Math.floor(time / 60);
    const secs = time % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);
    setError("");

    if (element.value !== "" && index < 3) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (seconds === 0) {
      setError("OTP has expired. Please request a new one.");
      return;
    }

    const enteredOtp = otp.join("");
    if (enteredOtp.length < 4) {
      setError("Please enter all 4 digits");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (isEmailOTP && email) {
        // Call verify-login-otp endpoint - this should return tokens directly
        const response = await api.post('verify-login-otp/', {
          email: email,
          otp: enteredOtp
        });

        console.log('OTP Verification Response:', response.data);

        // Check if the response contains access token
        if (response.data.access && response.data.refresh) {
          // Store tokens
          localStorage.setItem('access', response.data.access);
          localStorage.setItem('refresh', response.data.refresh);
          localStorage.setItem("userRole", "jobseeker");
          localStorage.setItem('user_type', 'jobseeker');
          // localStorage.setItem('user_type', response.data.user?.user_type || 'jobseeker');
          localStorage.setItem('user_id', response.data.user?.id);

          console.log('Login successful! Tokens stored.');

          // Navigate based on user type
          if (response.data.user?.user_type === 'employer') {
            navigate("/Job-portal/Employer/Dashboard");
          } else {
            await fetchAllJobs();
            navigate("/Job-portal/jobseeker/");
          }
        } else {
          setError(response.data.error || "Invalid OTP. Please try again.");
        }

      } else if (phone && !isEmailOTP && isMock) {
        // Mock mobile OTP verification
        if (enteredOtp === DEFAULT_MOCK_OTP.slice(0, 4)) {
          alert("OTP verified successfully! Logging in...");
          navigate("/Job-portal/jobseeker/");
        } else {
          setError("Invalid OTP. Please try again.");
        }
      }
      
    } catch (error) {
      console.error('OTP Verification Error:', error);

      if (error.response) {
        console.error('Error response:', error.response.data);

        if (error.response.status === 400) {
          const errorData = error.response.data;
          if (errorData.error) {
            setError(errorData.error);
          } else if (errorData.detail) {
            const errorMessage = Array.isArray(errorData.detail) ? errorData.detail[0] : errorData.detail;
            setError(errorMessage);
          } else {
            setError("Invalid OTP. Please try again.");
          }
        } else if (error.response.status === 401) {
          setError("Invalid OTP. Please try again.");
        } else if (error.response.status === 404) {
          setError("Email not found. Please check your email address.");
        } else {
          setError(error.response.data?.error || "OTP verification failed. Please try again.");
        }
      } else if (error.request) {
        setError("No response from server. Please check your connection.");
      } else {
        setError("Verification failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <header className="login-header">
        <Link to="/" className="logo">
          <span className="logo-text">Job portal</span>
        </Link>
        <div className="header-links">
          <span className='no-account'>Don’t have an account?</span>
          <Link to="/Job-portal/jobseeker/signup" className="signup-btn">Signup</Link>
          <div className="separator"></div>
          <Link to='/Job-portal/employer/login' className="employer-redirect-link">Employers Login</Link>
        </div>
      </header>

      <div className="login-body">
        <div className="login-illustration">
          <img src={manSitting} alt="OTP Illustration" />
        </div>

        <div className="otp-container">
          <button className="back-to-login" onClick={() => navigate(-1)}>
            Back
          </button>
          <h2 className="otp-title">OTP Verification</h2>
          <p className="otp-subtitle">
            {seconds > 0 ? (
              isEmailOTP ?
                `We have sent verification code to ${email || 'your email'}` :
                `We have sent verification code to ${phone || 'your mobile number'}`
            ) : (
              "Your OTP session has expired."
            )}
          </p>

          <form className="otp-form" onSubmit={handleVerifyOtp}>
            <div className={`otp-input-group ${seconds === 0 ? "expired-fade" : ""}`}>
              {otp.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  className={`otp-box ${error ? "input-error" : ""}`}
                  value={data}
                  onChange={(e) => handleChange(e.target, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  ref={(el) => (inputRefs.current[index] = el)}
                  disabled={seconds === 0 || loading}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            {error && <p className="error-msg" style={{ display: 'block', color: 'red', fontSize: '13px', marginTop: '5px', textAlign: 'center' }}>{error}</p>}

            <div className="otp-timer-display">
              {formatTime(seconds)}
            </div>

            {seconds > 0 ? (
              <button type="submit" className="otp-login-btn" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>
            ) : (
              <button type="button" className="otp-login-btn resend-highlight" onClick={handleResend} disabled={loading}>
                {loading ? 'Sending...' : 'Resend New OTP'}
              </button>
            )}
          </form>

          <div className="otp-resend-section">
            <span>Didn't receive OTP? </span>
            <button
              className="resend-btn"
              disabled={seconds > 0 || loading}
              onClick={handleResend}
            >
              Resend OTP
            </button>
          </div>

          {/* Show info for mock OTP */}
          {!isEmailOTP && phone && isMock && (
            <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '12px', color: '#666' }}>
              Demo: Use OTP <strong>1234</strong> for verification
            </div>
          )}
        </div>
      </div>
    </div>
  );
};