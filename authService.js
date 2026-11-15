// frontend/src/services/authService.js
import {
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import { auth } from "./firebase";

// ─── Google Sign-In ─────────────────────────────────────────
export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

// ─── Phone OTP — Step 1: Send OTP ───────────────────────────
export function setupRecaptcha(buttonElementId) {
  // Must target a real DOM element (e.g. the send-OTP button)
  window.recaptchaVerifier = new RecaptchaVerifier(
    auth,
    buttonElementId,
    { size: "invisible" }
  );
}

export async function sendOTP(phoneWithCountryCode) {
  // phoneWithCountryCode e.g. "+919876543210"
  const appVerifier = window.recaptchaVerifier;
  const confirmationResult = await signInWithPhoneNumber(
    auth,
    phoneWithCountryCode,
    appVerifier
  );
  // Store for verifyOTP()
  window.confirmationResult = confirmationResult;
  return confirmationResult;
}

// ─── Phone OTP — Step 2: Verify Code ────────────────────────
export async function verifyOTP(code) {
  const result = await window.confirmationResult.confirm(code);
  return result.user;
}
