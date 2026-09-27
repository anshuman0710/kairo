export function formatFirebaseAuthError(error) {
  if (!error) return "An unexpected error occurred. Please try again.";

  const code = String(error.code || error.message || "").toLowerCase();

  if (code.includes("auth/email-already-in-use")) {
    return "An account with this email already exists. Please log in instead.";
  }
  if (code.includes("auth/invalid-email")) {
    return "Please enter a valid email address.";
  }
  if (code.includes("auth/weak-password")) {
    return "Password must be at least 6 characters long.";
  }
  if (code.includes("auth/user-not-found")) {
    return "No account found with this email address.";
  }
  if (code.includes("auth/wrong-password") || code.includes("auth/invalid-credential")) {
    return "Invalid email or password. Please check your credentials.";
  }
  if (code.includes("auth/too-many-requests")) {
    return "Too many failed attempts. Please wait a moment and try again.";
  }
  if (code.includes("auth/network-request-failed")) {
    return "Network connection error. Please check your internet and retry.";
  }
  if (code.includes("auth/user-disabled")) {
    return "This account has been disabled. Please contact support.";
  }
  if (code.includes("auth/requires-recent-login")) {
    return "Please log in again to perform this security-sensitive action.";
  }

  return error.message || "Authentication failed. Please try again.";
}
