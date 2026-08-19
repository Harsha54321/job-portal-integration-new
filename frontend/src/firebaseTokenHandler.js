// // src/firebaseTokenHandler.js
// import { initializeApp } from "firebase/app";
// import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
// import api from "./api/axios";

// const firebaseConfig = {
//   apiKey: "AIzaSyC5KcHX0-wPlrE1CXAAElVpPbpgJ1cln2U",
//   authDomain: "jobportal-8bbc1.firebaseapp.com",
//   projectId: "jobportal-8bbc1",
//   storageBucket: "jobportal-8bbc1.firebasestorage.app",
//   messagingSenderId: "910796700822",
//   appId: "1:910796700822:web:24f745d5e6ad51f35716b7",
// };

// const app = initializeApp(firebaseConfig);

// // CRITICAL CHANGE: Declare messaging instance as null first instead of calling getMessaging() globally.
// let messaging = null;

// // Safe helper function to get or initialize messaging
// const getSafeMessaging = async () => {
//   if (messaging) return messaging;

//   try {
//     const supported = await isSupported();
//     if (supported && "Notification" in window) {
//       messaging = getMessaging(app);
//       return messaging;
//     }
//   } catch (err) {
//     console.warn("⚠️ Firebase Messaging is not supported or blocked in this browser environment.", err);
//   }
//   return null;
// };

// /**
//  * Requests device authorization permission and synchronizes registration token with DB storage
//  * @param {boolean} forceRegister - Force registration even if token exists
//  */
// export const requestAndRegisterNotificationPermission = async (forceRegister = false) => {
//   try {
//     console.log("🔔 Requesting notification permission...");

//     // Check if Notification API exists in window (prevents crashes in specific environments)
//     if (!("Notification" in window)) {
//       console.warn("❌ Notification API not supported by this browser.");
//       return { success: false, reason: "not_supported" };
//     }

//     const permission = await Notification.requestPermission();
//     console.log(`📱 Notification permission status: ${permission}`);

//     if (permission === "granted") {
//       // Check if user is authenticated before proceeding
//       const accessToken = sessionStorage.getItem("access");
//       console.log(`🔑 Authentication status: ${accessToken ? "Authenticated ✅" : "Not authenticated ❌"}`);

//       if (!accessToken) {
//         console.warn("⚠️ User is not authenticated. Skipping FCM token registration.");
//         console.warn("ℹ️ Token will be registered after user logs in.");
//         return { success: false, reason: "not_authenticated" };
//       }

//       // Check support and initialize messaging instance safely before token generation
//       const activeMessaging = await getSafeMessaging();
//       if (!activeMessaging) {
//         console.warn("⚠️ Skipping token generation: Messaging client features are unavailable.");
//         return { success: false, reason: "messaging_unsupported" };
//       }

//       // Fetch FCM client registration token
//       console.log("🔄 Generating FCM token...");
//       const currentToken = await getToken(activeMessaging, {
//         vapidKey: "BEDIc1q-hu8INIG9jmK3_YINX9CMiPIq4A7idO_Gfs6FqwFP2sXdhKT9iV4qIK91ACDX3JwYg_e-dVhiYt0EkvI"
//       });

//       if (currentToken) {
//         console.log("✅ FCM Token generated successfully:", currentToken);
//         console.log("📋 Access Token:", sessionStorage.getItem("access") ? "Present ✅" : "Missing ❌");

//         // Check if token already registered (optional)
//         const existingToken = sessionStorage.getItem("fcm_token_registered");
//         if (existingToken === currentToken && !forceRegister) {
//           console.log("ℹ️ FCM token already registered with backend. Skipping duplicate registration.");
//           return { success: true, token: currentToken, alreadyRegistered: true };
//         }

//         // Dispatch payload structure updating your backend's UserDevice instances
//         console.log("📤 Sending FCM token to backend...");
//         const response = await api.post("devices/register/", {
//           fcm_token: currentToken,
//           platform: "web"
//         });

//         console.log("✅ FCM registration token synchronized successfully with backend.");
//         console.log("📊 Backend response:", response.data);

//         // Store token to avoid duplicate registrations
//         sessionStorage.setItem("fcm_token_registered", currentToken);

//         return { success: true, token: currentToken, response: response.data };
//       } else {
//         console.warn("❌ No registration token available. Verify console setup permissions.");
//         return { success: false, reason: "no_token" };
//       }
//     } else {
//       console.warn("❌ User explicitly declined push notifications permission request.");
//       return { success: false, reason: "permission_denied" };
//     }
//   } catch (error) {
//     console.error("❌ An error occurred during FCM token tracking workflow:", error);
//     console.error("Error details:", {
//       message: error.message,
//       status: error.response?.status,
//       data: error.response?.data,
//       config: error.config
//     });
//     return { success: false, reason: "error", error };
//   }
// };

// /**
//  * Sets up listening context hooks for foreground message event captures
//  */
// export const listenForForegroundMessages = async () => {
//   console.log("📡 Setting up foreground message listener...");

//   try {
//     const activeMessaging = await getSafeMessaging();
//     if (!activeMessaging) {
//       console.warn("⚠️ Foreground message listener skipped: messaging not supported in this window.");
//       return;
//     }

//     onMessage(activeMessaging, (payload) => {
//       console.log("📨 NEW PUSH RECEIVED:", payload);
//       console.log("Notification details:", {
//         title: payload.notification?.title,
//         body: payload.notification?.body,
//         data: payload.data
//       });

//       if (payload.notification) {
//         // Use a more user-friendly notification
//         if ("Notification" in window && Notification.permission === "granted") {
//           const notification = new Notification(payload.notification.title, {
//             body: payload.notification.body,
//             icon: payload.notification.icon || "/logo192.png"
//           });

//           notification.onclick = () => {
//             window.focus();
//             notification.close();
//           };
//         } else {
//           // Fallback to alert
//           alert(`${payload.notification.title}\n\n${payload.notification.body}`);
//         }
//       }
//     });
//     console.log("✅ Foreground message listener set up successfully");
//   } catch (error) {
//     console.warn("⚠️ Foreground message listener setup warning:", error);
//     if (error.message && error.message.includes('listener indicated an asynchronous response')) {
//       console.warn("💡 This is likely due to a browser extension. Try incognito mode.");
//     }
//   }
// };

// /**
//  * Utility function to check if FCM is ready to register
//  */
// export const isFCMReady = () => {
//   const token = sessionStorage.getItem("access");
//   const permission = typeof window !== "undefined" && "Notification" in window ? Notification.permission : "default";

//   console.log("🔍 FCM Readiness Check:", {
//     authenticated: !!token,
//     permission: permission,
//     ready: !!token && permission === "granted"
//   });

//   return !!token && permission === "granted";
// };

// /**
//  * Register FCM token after login (to be called after successful authentication)
//  */
// export const registerFCMAfterLogin = async () => {
//   console.log("🔄 Attempting to register FCM after login...");

//   // Check if we already have a registered token
//   const existingToken = sessionStorage.getItem("fcm_token_registered");
//   if (existingToken) {
//     console.log(" FCM token already registered. You can force re-register if needed.");
//     return { success: true, alreadyRegistered: true };
//   }

//   return await requestAndRegisterNotificationPermission();
// };


// src/firebaseTokenHandler.js

import { initializeApp } from "firebase/app";

import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

import api from "./api/axios";

const firebaseConfig = {

  apiKey: "AIzaSyC5KcHX0-wPlrE1CXAAElVpPbpgJ1cln2U",

  authDomain: "jobportal-8bbc1.firebaseapp.com",

  projectId: "jobportal-8bbc1",

  storageBucket: "jobportal-8bbc1.firebasestorage.app",

  messagingSenderId: "910796700822",

  appId: "1:910796700822:web:24f745d5e6ad51f35716b7",

};

const app = initializeApp(firebaseConfig);

// Declare messaging instance as null first instead of calling getMessaging() globally.

let messaging = null;

// Safe helper function to get or initialize messaging

const getSafeMessaging = async () => {

  if (messaging) return messaging;

  try {

    const supported = await isSupported();

    if (supported && "Notification" in window) {

      messaging = getMessaging(app);

      return messaging;

    }

  } catch (err) {

    console.warn("⚠️ Firebase Messaging is not supported or blocked in this browser environment.", err);

  }

  return null;

};

/**

* Requests device authorization permission and synchronizes registration token with DB storage

* @param {boolean} forceRegister - Force registration even if token exists

*/

export const requestAndRegisterNotificationPermission = async (forceRegister = false) => {

  try {

    console.log("🔔 Requesting notification permission...");

    // Check if Notification API exists in window (prevents crashes in specific environments)

    if (!("Notification" in window)) {

      console.warn("❌ Notification API not supported by this browser.");

      return { success: false, reason: "not_supported" };

    }

    const permission = await Notification.requestPermission();

    console.log(`📱 Notification permission status: ${permission}`);

    if (permission === "granted") {

      // Check if user is authenticated before proceeding

      const accessToken = sessionStorage.getItem("access");

      console.log(`🔑 Authentication status: ${accessToken ? "Authenticated ✅" : "Not authenticated ❌"}`);

      if (!accessToken) {

        console.warn("⚠️ User is not authenticated. Skipping FCM token registration.");

        console.warn("ℹ️ Token will be registered after user logs in.");

        return { success: false, reason: "not_authenticated" };

      }

      // Check support and initialize messaging instance safely before token generation

      const activeMessaging = await getSafeMessaging();

      if (!activeMessaging) {

        console.warn("⚠️ Skipping token generation: Messaging client features are unavailable.");

        return { success: false, reason: "messaging_unsupported" };

      }

      // Fetch FCM client registration token

      console.log("🔄 Generating FCM token...");

      const currentToken = await getToken(activeMessaging, {

        vapidKey: "BEDIc1q-hu8INIG9jmK3_YINX9CMiPIq4A7idO_Gfs6FqwFP2sXdhKT9iV4qIK91ACDX3JwYg_e-dVhiYt0EkvI"

      });

      if (currentToken) {

        console.log("✅ FCM Token generated successfully:", currentToken);

        console.log("📋 Access Token:", sessionStorage.getItem("access") ? "Present ✅" : "Missing ❌");

        // Check if token already registered (optional)

        const existingToken = sessionStorage.getItem("fcm_token_registered");

        if (existingToken === currentToken && !forceRegister) {

          console.log("ℹ️ FCM token already registered with backend. Skipping duplicate registration.");

          return { success: true, token: currentToken, alreadyRegistered: true };

        }

        // Dispatch payload structure updating your backend's UserDevice instances

        console.log("📤 Sending FCM token to backend...");

        const response = await api.post("devices/register/", {

          fcm_token: currentToken,

          platform: "web"

        });

        console.log("✅ FCM registration token synchronized successfully with backend.");

        console.log("📊 Backend response:", response.data);

        // Store token to avoid duplicate registrations

        sessionStorage.setItem("fcm_token_registered", currentToken);

        return { success: true, token: currentToken, response: response.data };

      } else {

        console.warn("❌ No registration token available. Verify console setup permissions.");

        return { success: false, reason: "no_token" };

      }

    } else {

      console.warn("❌ User explicitly declined push notifications permission request.");

      return { success: false, reason: "permission_denied" };

    }

  } catch (error) {

    console.error("❌ An error occurred during FCM token tracking workflow:", error);

    console.error("Error details:", {

      message: error.message,

      status: error.response?.status,

      data: error.response?.data,

      config: error.config

    });

    return { success: false, reason: "error", error };

  }

};

/**

* Sets up listening context hooks for foreground message event captures.

* NOTE: onMessage() ONLY fires when the app tab is open and visible (foreground).

* The service worker handles background/closed tab notifications separately.

* We must NOT let both fire at the same time — the `tag` field deduplicates

* within the browser, and the SW skips when the app is focused (see firebase-messaging-sw.js).

*/

export const listenForForegroundMessages = async () => {

  console.log("📡 Setting up foreground message listener...");

  try {

    const activeMessaging = await getSafeMessaging();

    if (!activeMessaging) {

      console.warn("⚠️ Foreground message listener skipped: messaging not supported in this window.");

      return;

    }

    onMessage(activeMessaging, (payload) => {

      console.log("📨 NEW FOREGROUND PUSH RECEIVED:", payload);

      console.log("Notification details:", {

        title: payload.notification?.title,

        body: payload.notification?.body,

        data: payload.data

      });

      // Guard: skip if there's no notification payload to display

      if (!payload.notification?.title) {

        console.warn("⚠️ Foreground message has no notification payload. Skipping display.");

        return;

      }

      if ("Notification" in window && Notification.permission === "granted") {

        const notification = new Notification(payload.notification.title, {

          body: payload.notification.body,

          icon: payload.notification.icon || "/logo192.png",

          // FIX: `tag` ensures the browser replaces any existing notification

          // with the same identifier instead of stacking a duplicate.

          // Uses messageId if available, otherwise falls back to title.

          tag: payload.messageId || payload.notification.title,

        });

        notification.onclick = () => {

          window.focus();

          notification.close();

        };

      } else {

        // Fallback to alert only if Notification API is unavailable

        alert(`${payload.notification.title}\n\n${payload.notification.body}`);

      }

    });

    console.log("✅ Foreground message listener set up successfully");

  } catch (error) {

    console.warn("⚠️ Foreground message listener setup warning:", error);

    if (error.message && error.message.includes('listener indicated an asynchronous response')) {

      console.warn("💡 This is likely due to a browser extension. Try incognito mode.");

    }

  }

};

/**

* Utility function to check if FCM is ready to register

*/

export const isFCMReady = () => {

  const token = sessionStorage.getItem("access");

  const permission = typeof window !== "undefined" && "Notification" in window ? Notification.permission : "default";

  console.log("🔍 FCM Readiness Check:", {

    authenticated: !!token,

    permission: permission,

    ready: !!token && permission === "granted"

  });

  return !!token && permission === "granted";

};

/**

* Register FCM token after login (to be called after successful authentication)

*/

export const registerFCMAfterLogin = async () => {

  console.log("🔄 Attempting to register FCM after login...");

  // Check if we already have a registered token

  const existingToken = sessionStorage.getItem("fcm_token_registered");

  if (existingToken) {

    console.log("ℹ️ FCM token already registered. You can force re-register if needed.");

    return { success: true, alreadyRegistered: true };

  }

  return await requestAndRegisterNotificationPermission();

};