import { useEffect, useMemo, useRef, useState } from "react";
import { User, Lock, Mail, Eye, EyeOff } from "lucide-react";

/**
 * SignupForm props:
 * - onSignup(formData) => may return a Promise (resolve on success, reject on error)
 * - onSwitchToLogin() => navigate to login UI
 * - checkUsername?(username) => optional async function to check availability, returns { available: boolean, reason?: string }
 * - checkEmail?(email) => optional async function to check availability, returns { available: boolean, reason?: string }
 */
function SignupForm({ onSignup, onSwitchToLogin, checkUsername, checkEmail }) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [usernameAvailability, setUsernameAvailability] = useState(null); // null | { available, reason? }
  const [emailAvailability, setEmailAvailability] = useState(null);
  const [capsLock, setCapsLock] = useState(false);

  const usernameRef = useRef(null);

  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  // Basic validation rules (returns all errors)
  const validateAll = (data) => {
    const e = {};
    const u = (data.username || "").trim();
    const em = (data.email || "").trim();
    const pw = data.password || "";
    const cpw = data.confirmPassword || "";

    if (!u || u.length < 3) e.username = "Username must be at least 3 characters";
    if (!em || !/\S+@\S+\.\S+/.test(em)) e.email = "Please enter a valid email address";
    if (!pw || pw.length < 6) e.password = "Password must be at least 6 characters";
    if (pw !== cpw) e.confirmPassword = "Passwords do not match";
    return e;
  };

  // Debounced live validation for touched fields
  useEffect(() => {
    const t = setTimeout(() => {
      const all = validateAll(formData);
      // only show errors for fields that were touched
      const visible = {};
      Object.keys(all).forEach((k) => {
        if (touched[k]) visible[k] = all[k];
      });
      setErrors(visible);
    }, 220);
    return () => clearTimeout(t);
  }, [formData, touched]);

  // Debounced availability checks for username/email if provided
  useEffect(() => {
    if (checkUsername && (formData.username || "").trim().length >= 3) {
      setUsernameAvailability(null); // loading state
      const id = setTimeout(async () => {
        try {
          const res = await checkUsername(formData.username.trim());
          setUsernameAvailability(res);
        } catch (err) {
          setUsernameAvailability({ available: true }); // don't block signup on check failure
        }
      }, 500);
      return () => clearTimeout(id);
    } else {
      setUsernameAvailability(null);
    }
  }, [formData.username, checkUsername]);

  useEffect(() => {
    if (checkEmail && /\S+@\S+\.\S+/.test(formData.email || "")) {
      setEmailAvailability(null);
      const id = setTimeout(async () => {
        try {
          const res = await checkEmail((formData.email || "").trim());
          setEmailAvailability(res);
        } catch (err) {
          setEmailAvailability({ available: true });
        }
      }, 500);
      return () => clearTimeout(id);
    } else {
      setEmailAvailability(null);
    }
  }, [formData.email, checkEmail]);

  // Password strength calculation (0-100)
  const passwordStrength = useMemo(() => {
    const pw = formData.password || "";
    let score = 0;
    if (pw.length >= 6) score += 1;
    if (/[A-Z]/.test(pw)) score += 1;
    if (/[0-9]/.test(pw)) score += 1;
    if (/[^A-Za-z0-9]/.test(pw)) score += 1;
    return Math.round((score / 4) * 100);
  }, [formData.password]);

  const strengthLabel = useMemo(() => {
    if (!formData.password) return "";
    if (passwordStrength < 25) return "Very weak";
    if (passwordStrength < 50) return "Weak";
    if (passwordStrength < 75) return "Good";
    return "Strong";
  }, [passwordStrength, formData.password]);

  // Caps lock detection handler (from password input)
  const handleKeyDown = (e) => {
    if (e.getModifierState && e.getModifierState("CapsLock")) setCapsLock(true);
    else setCapsLock(false);
  };

  // Update helper
  const updateField = (field, value) => {
    setFormData((s) => ({ ...s, [field]: value }));
  };

  // Submit handler (async)
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setTouched({ username: true, email: true, password: true, confirmPassword: true });
    setServerError("");
    const v = validateAll(formData);
    if (Object.keys(v).length) {
      setErrors(v);
      // focus first invalid
      if (v.username) usernameRef.current?.focus();
      return;
    }

    // If availability checks exist and show not available, block
    if (usernameAvailability && usernameAvailability.available === false) {
      setErrors((prev) => ({ ...prev, username: usernameAvailability.reason || "Username unavailable" }));
      usernameRef.current?.focus();
      return;
    }
    if (emailAvailability && emailAvailability.available === false) {
      setErrors((prev) => ({ ...prev, email: emailAvailability.reason || "Email already in use" }));
      return;
    }

    try {
      setLoading(true);
      // allow onSignup to be sync or return a promise
      await Promise.resolve(onSignup ? onSignup(formData) : Promise.resolve());
      // On success: parent can redirect; we don't auto-clear to avoid surprises
    } catch (err) {
      const msg = typeof err === "string" ? err : err?.message || "Signup failed. Try again.";
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md w-full space-y-5" noValidate aria-live="polite">
      {serverError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
          {serverError}
        </div>
      )}

      {/* Username */}
      <div>
        <label htmlFor="signup-username" className="block text-sm font-medium text-gray-700 mb-2">
          <span className="inline-flex items-center">
            <User className="w-4 h-4 inline mr-2" />
            Username
          </span>
        </label>

        <input
          id="signup-username"
          ref={usernameRef}
          type="text"
          value={formData.username}
          onChange={(e) => updateField("username", e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, username: true }))}
          onKeyDown={handleKeyDown}
          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 transition ${
            errors.username ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Choose a username"
          aria-invalid={!!errors.username}
          aria-describedby={errors.username ? "signup-username-error" : usernameAvailability && !usernameAvailability.available ? "signup-username-availability" : undefined}
        />

        {/* availability / error messages */}
        {errors.username ? (
          <p id="signup-username-error" className="text-red-500 text-xs mt-1">
            {errors.username}
          </p>
        ) : usernameAvailability === null && (formData.username || "").trim().length >= 3 && checkUsername ? (
          <p className="text-gray-400 text-xs mt-1">Checking username availability…</p>
        ) : usernameAvailability && usernameAvailability.available === false ? (
          <p id="signup-username-availability" className="text-red-500 text-xs mt-1">
            {usernameAvailability.reason || "Username is already taken"}
          </p>
        ) : usernameAvailability && usernameAvailability.available === true ? (
          <p className="text-green-600 text-xs mt-1">Nice — username is available</p>
        ) : (
          <p className="text-gray-400 text-xs mt-1">Pick a unique username (min 3 chars)</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-2">
          <span className="inline-flex items-center">
            <Mail className="w-4 h-4 inline mr-2" />
            Email
          </span>
        </label>

        <input
          id="signup-email"
          type="email"
          value={formData.email}
          onChange={(e) => updateField("email", e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 transition ${
            errors.email ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="you@example.com"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "signup-email-error" : emailAvailability && !emailAvailability.available ? "signup-email-availability" : undefined}
        />

        {errors.email ? (
          <p id="signup-email-error" className="text-red-500 text-xs mt-1">
            {errors.email}
          </p>
        ) : emailAvailability === null && /\S+@\S+\.\S+/.test(formData.email || "") && checkEmail ? (
          <p className="text-gray-400 text-xs mt-1">Checking email…</p>
        ) : emailAvailability && emailAvailability.available === false ? (
          <p id="signup-email-availability" className="text-red-500 text-xs mt-1">
            {emailAvailability.reason || "Email already in use"}
          </p>
        ) : emailAvailability && emailAvailability.available === true ? (
          <p className="text-green-600 text-xs mt-1">Email is good to use</p>
        ) : (
          <p className="text-gray-400 text-xs mt-1">We'll send a verification link to this email.</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-2">
          <span className="inline-flex items-center">
            <Lock className="w-4 h-4 inline mr-2" />
            Password
          </span>
        </label>

        <div className="relative">
          <input
            id="signup-password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) => updateField("password", e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, password: true }))}
            onKeyDown={handleKeyDown}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 pr-12 transition ${
              errors.password ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Create a password"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "signup-password-error" : formData.password ? "signup-password-strength" : undefined}
            autoComplete="new-password"
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 p-1 rounded hover:bg-gray-100"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        {capsLock && <p className="text-yellow-600 text-xs mt-1">Caps Lock is ON — check your password.</p>}

        {errors.password ? (
          <p id="signup-password-error" className="text-red-500 text-xs mt-1">
            {errors.password}
          </p>
        ) : formData.password ? (
          <div className="mt-2" id="signup-password-strength">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-600">{strengthLabel}</span>
              <span className="text-gray-400">{formData.password.length} chars</span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-2 rounded-full transition-all"
                style={{
                  width: `${passwordStrength}%`,
                  background:
                    passwordStrength < 25
                      ? "linear-gradient(to right,#ff4d4f, #ff7875)"
                      : passwordStrength < 50
                      ? "linear-gradient(to right,#ffa940, #ffd666)"
                      : passwordStrength < 75
                      ? "linear-gradient(to right,#73d13d, #95de64)"
                      : "linear-gradient(to right,#36cfc9,#40a9ff)",
                }}
              />
            </div>

            <div className="text-gray-400 text-xs mt-1">
              {passwordStrength < 50 ? "Use uppercase, numbers, or symbols to strengthen your password." : "Good password!"}
            </div>
          </div>
        ) : (
          <p className="text-gray-400 text-xs mt-1">Use at least 6 characters.</p>
        )}
      </div>


      {/* Submit */}
      <div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold transition ${
            loading
              ? "bg-indigo-500/70 cursor-not-allowed"
              : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          }`}
        >
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </button>
      </div>

      {/* Secondary */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <button onClick={onSwitchToLogin} className="text-indigo-600 hover:text-indigo-700 font-medium">
            Sign in
          </button>
        </p>
      </div>
    </form>
  );
}

export default SignupForm;
