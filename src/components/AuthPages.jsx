import React, { useState } from "react";
import { auth, db } from "../firebase/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import {
  Shield,
  Mail,
  Lock,
  User,
  ArrowLeft,
  ArrowRight,
  Sun,
  Moon,
} from "lucide-react";

export default function AuthPages({
  currentPage,
  setPage,
  onAuthSuccess,
  darkMode,
  toggleTheme,
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("seeker"); // seeker, recruiter
  const [error, setError] = useState("");

  const isLogin = currentPage === "login";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Email is required");
      return;
    }

    if (!password) {
      setError("Password is required");
      return;
    }

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password,
        );

        const userRef = doc(db, "users", userCredential.user.uid);
        const snap = await getDoc(userRef);

        let userRole = "seeker";

        if (snap.exists()) {
          userRole = snap.data().role;
        }
        onAuthSuccess({
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          name:
            userCredential.user.displayName ||
            userCredential.user.email.split("@")[0],
          role: userRole,
        });
      } else {
        if (!name) {
          setError("Full Name is required");
          return;
        }

        if (password !== confirmPassword) {
          setError("Passwords do not match");
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );

        await updateProfile(userCredential.user, {
          displayName: name,
        });

        await setDoc(doc(db, "users", userCredential.user.uid), {
          uid: userCredential.user.uid,
          name,
          email,
          role,
          createdAt: new Date(),
        });
        onAuthSuccess({
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          name:
            userCredential.user.displayName ||
            userCredential.user.email.split("@")[0],
          role: role,
        });
      }
    } catch (error) {
      setError(error.message);
    }
  };
  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          role: role,
          createdAt: new Date(),
        });
      }
      const userData = (await getDoc(userRef)).data();

      onAuthSuccess({
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        role: userData.role,
      });
    } catch (error) {
      switch (error.code) {
        case "auth/invalid-credential":
          setError("Invalid email or password.");
          break;

        case "auth/user-not-found":
          setError("No account found with this email.");
          break;

        case "auth/wrong-password":
          setError("Incorrect password.");
          break;

        case "auth/email-already-in-use":
          setError("Email already exists.");
          break;

        case "auth/weak-password":
          setError("Password should be at least 6 characters.");
          break;

        case "auth/invalid-email":
          setError("Invalid email format.");
          break;

        case "auth/popup-closed-by-user":
          setError("Google Sign-in cancelled.");
          break;

        default:
          setError(error.message);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Back Button and Theme Toggle Floating Header */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center">
        <button
          onClick={() => setPage("landing")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/40 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-150"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Home
        </button>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-150"
        >
          {darkMode ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>
      </div>

      {/* Hero / Information Side Panel (Left Side on Desktop) */}
      <div className="relative w-full md:w-5/12 bg-gradient-to-br from-blue-700 via-indigo-700 to-violet-800 text-white p-8 md:p-12 flex flex-col justify-between overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-sky-400/20 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[250px] h-[250px] bg-violet-400/20 rounded-full blur-2xl pointer-events-none"></div>

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-2 mt-12 md:mt-0">
          <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-white">
            JobShield AI
          </span>
        </div>

        {/* Dynamic Content */}
        <div className="relative z-10 my-16 md:my-0">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-4">
            {isLogin ? "Welcome Back!" : "Start Applying with Confidence"}
          </h2>
          <p className="text-sm text-blue-100/90 leading-relaxed max-w-sm">
            {isLogin
              ? "Sign in to access your analysis history, verify new recruiter details, and check community scam listings."
              : "Create an account to scan job offers, receive detailed risk reports, and contribute to the community scam registry."}
          </p>
        </div>

        {/* System Stats Indicator */}
        <div className="relative z-10 border-t border-white/10 pt-4 flex gap-8">
          <div>
            <div className="text-xl font-bold">99.8%</div>
            <div className="text-[10px] text-blue-200 uppercase font-semibold">
              MX Check Precision
            </div>
          </div>
          <div>
            <div className="text-xl font-bold">12k+</div>
            <div className="text-[10px] text-blue-200 uppercase font-semibold">
              Verified Schemes
            </div>
          </div>
        </div>
      </div>

      {/* Form Interaction Panel (Right Side) */}
      <div className="w-full md:w-7/12 flex items-center justify-center p-6 sm:p-12 md:p-16 relative">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/40 p-8 rounded-3xl shadow-lg relative z-10">
          {/* Header text */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight">
              {isLogin ? "Log In to JobShield" : "Create Your Account"}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1.5">
              Enter your credentials to manage verification activities.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name (Signup Only) */}
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                  Full Name
                </label>

                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />

                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all duration-150"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                Email Address
              </label>

              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all duration-150"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Password
                </label>

                {isLogin && (
                  <button
                    type="button"
                    onClick={() =>
                      alert(
                        "Demo Feature: In a production environment, this sends an authentication reset link to your email.",
                      )
                    }
                    className="text-xs text-blue-600 hover:text-blue-500 font-semibold"
                  >
                    Forgot password?
                  </button>
                )}
              </div>

              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all duration-150"
                />
              </div>
            </div>

            {/* Confirm Password */}
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                  Confirm Password
                </label>

                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />

                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all duration-150"
                  />
                </div>
              </div>
            )}

            {/* Role */}
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                  Account Purpose
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole("seeker")}
                    className={`py-2 rounded-xl border text-xs font-bold transition-all duration-150 ${
                      role === "seeker"
                        ? "border-blue-600 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                        : "border-slate-200 dark:border-slate-800 text-slate-500"
                    }`}
                  >
                    Job Seeker
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("Admin")}
                    className={`py-2 rounded-xl border text-xs font-bold transition-all duration-150 ${
                      role === "Admin"
                        ? "border-blue-600 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                        : "border-slate-200 dark:border-slate-800 text-slate-500"
                    }`}
                  >
                    Admin
                  </button>
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer"
            >
              {isLogin ? "Log In" : "Create Account"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5 flex items-center justify-center">
            <hr className="w-full border-slate-200 dark:border-slate-800" />
            <span className="absolute px-3 bg-white dark:bg-slate-900 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Or continue with
            </span>
          </div>

          {/* Social Sign In */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-150 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#ea4335"
                d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.66 1.54 14.98 1 12 1 7.35 1 3.37 3.67 1.39 7.56l3.85 2.99c.9-2.7 3.42-4.51 6.76-4.51z"
              />
              <path
                fill="#4285f4"
                d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.73 2.89c2.18-2.01 3.7-4.99 3.7-8.62z"
              />
              <path
                fill="#fbbc05"
                d="M5.24 14.56c-.24-.72-.38-1.5-.38-2.31s.14-1.59.38-2.31L1.39 6.95C.5 8.75 0 10.79 0 12.95s.5 4.2 1.39 6l3.85-2.99z"
              />
              <path
                fill="#34a853"
                d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.73-2.89c-1.1.74-2.51 1.18-4.23 1.18-3.34 0-5.86-1.81-6.76-4.51L1.39 16.86C3.37 20.75 7.35 23 12 23z"
              />
            </svg>
            Google
          </button>

          {/* Toggle Route Links */}
          <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => setPage(isLogin ? "signup" : "login")}
              className="text-blue-600 hover:text-blue-500 font-bold"
            >
              {isLogin ? "Register now" : "Log in here"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
