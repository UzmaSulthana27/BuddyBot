import { useEffect, useState, useRef } from "react";
import { User, Lock, Eye, EyeOff } from "lucide-react";

function LoginForm({ onLogin, onSwitchToSignup, onForgotPassword }) {
  const [formData, setFormData] = useState({ username: "", password: "", remember: false });
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [capsLock, setCapsLock] = useState(false);

  const usernameRef = useRef(null);
  const passwordRef = useRef(null);

  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  // ---------- Validation ----------
  const validate = (data) => {
    const e = {};
    if (!data.username || data.username.trim().length < 3) {
      e.username = "Username is required (min 3 characters).";
    }
    if (!data.password || data.password.length < 6) {
      e.password = "Password is required (min 6 characters).";
    }
    return e;
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      const all = validate(formData);
      const visible = {};
      Object.keys(all).forEach((k) => {
        if (touched[k]) visible[k] = all[k];
      });
      setErrors(visible);
    }, 250);
    return () => clearTimeout(handler);
  }, [formData, touched]);

  // ---------- Caps Lock detection ----------
  const handleKeyDown = (e) => {
    setCapsLock(e.getModifierState?.("CapsLock") || false);
  };

  // ---------- Submit ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ username: true, password: true });
    setServerError("");

    const currentErrors = validate(formData);
    if (Object.keys(currentErrors).length) {
      setErrors(currentErrors);
      if (currentErrors.username) usernameRef.current?.focus();
      else passwordRef.current?.focus();
      return;
    }

    try {
      setLoading(true);
      await Promise.resolve(onLogin?.(formData));
    } catch (err) {
      const msg = typeof err === "string" ? err : err?.message || "Login failed.";
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setFormData((s) => ({ ...s, [field]: value }));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 max-w-md w-full"
      noValidate
      aria-live="polite"
    >
      {serverError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
          {serverError}
        </div>
      )}

      {/* Username */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <User className="w-4 h-4 inline mr-2" />
          Username
        </label>

        <input
          ref={usernameRef}
          value={formData.username}
          onChange={(e) => updateField("username", e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, username: true }))}
          onKeyDown={handleKeyDown}
          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 transition ${
            errors.username ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-indigo-500"
          }`}
          placeholder="Enter your username"
        />

        {errors.username && (
          <p className="text-red-500 text-xs mt-1">{errors.username}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Lock className="w-4 h-4 inline mr-2" />
          Password
        </label>

        <div className="relative">
          <input
            ref={passwordRef}
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) => updateField("password", e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, password: true }))}
            onKeyDown={handleKeyDown}
            autoComplete="current-password"
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 pr-12 transition ${
              errors.password ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-indigo-500"
            }`}
            placeholder="Enter your password"
          />

          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        {capsLock && (
          <p className="text-yellow-600 text-xs mt-1">Caps Lock is ON.</p>
        )}

        {errors.password && (
          <p className="text-red-500 text-xs mt-1">{errors.password}</p>
        )}
      </div>

      {/* Remember + Forgot */}
      <div className="flex items-center justify-between">
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={formData.remember}
            onChange={(e) => updateField("remember", e.target.checked)}
            className="form-checkbox h-4 w-4"
          />
          Remember me
        </label>

        <button
          type="button"
          onClick={() => onForgotPassword?.()}
          className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
        >
          Forgot password?
        </button>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3 rounded-xl text-white font-semibold transition flex items-center justify-center ${
          loading
            ? "bg-indigo-500/70 cursor-not-allowed"
            : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
        }`}
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>

      {/* Switch */}
      <div className="text-center text-sm text-gray-600">
        Don't have an account?{" "}
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Sign up
        </button>
      </div>
    </form>
  );
}

export default LoginForm;
