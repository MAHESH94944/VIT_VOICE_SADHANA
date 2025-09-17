import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { loginWithGoogle } = useAuth();

  const [loading, setLoading] = useState(false);
  const [googleIdToken, setGoogleIdToken] = useState(null);
  const [needRole, setNeedRole] = useState(null); // { email, name }
  const [role, setRole] = useState("counsilli");
  const [counsellors, setCounsellors] = useState([]);
  const [counsellorName, setCounsellorName] = useState("");
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [clientId, setClientId] = useState("");

  useEffect(() => {
    const id = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    setClientId(id || "");
    if (!id) {
      console.warn(
        "VITE_GOOGLE_CLIENT_ID is not set; Google button will not render"
      );
      return;
    }

    // Add script once
    if (!document.getElementById("google-sdk")) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.id = "google-sdk";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setSdkLoaded(true);
        tryRenderButton(id);
      };
      document.body.appendChild(script);
    } else {
      // SDK already present
      setSdkLoaded(Boolean(window.google));
      setTimeout(() => tryRenderButton(id), 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Try to render the button safely
  const tryRenderButton = (id) => {
    try {
      if (!window.google) return;
      if (document.getElementById("google-auth-btn-rendered")) return;
      window.google.accounts.id.initialize({
        client_id: id,
        callback: handleGoogleResponse,
      });
      window.google.accounts.id.renderButton(
        document.getElementById("google-auth-btn"),
        { theme: "outline", size: "large", width: "280" }
      );
      // mark rendered to avoid double renders
      const marker = document.createElement("div");
      marker.id = "google-auth-btn-rendered";
      marker.style.display = "none";
      document.body.appendChild(marker);
    } catch (e) {
      console.warn("Google button render failed", e);
    }
  };

  // fallback UI actions
  const onClickRenderButton = () => {
    if (!clientId)
      return alert("VITE_GOOGLE_CLIENT_ID not set in frontend env.");
    if (!window.google) return alert("Google SDK not loaded yet.");
    tryRenderButton(clientId);
  };

  const onClickPrompt = () => {
    if (!window.google) return alert("Google SDK not loaded yet.");
    try {
      window.google.accounts.id.prompt();
    } catch (e) {
      console.warn("Prompt failed", e);
      alert("Unable to show One‑Tap prompt.");
    }
  };

  // fetch counsellors only when backend asks for role
  const loadCounsellors = async () => {
    try {
      const res = await fetch("/api/auth/counsellors", {
        credentials: "include",
      });
      if (res.ok) {
        const list = await res.json();
        setCounsellors(list);
        if (list.length > 0) setCounsellorName(list[0].name);
      } else {
        setCounsellors([]);
      }
    } catch (e) {
      console.warn("Failed to load counsellors", e);
      setCounsellors([]);
    }
  };

  const handleGoogleResponse = async (response) => {
    if (!response?.credential) return;
    setLoading(true);
    setGoogleIdToken(response.credential);
    try {
      const res = await loginWithGoogle({ idToken: response.credential });
      if (res?.needRole) {
        setNeedRole({ email: res.email, name: res.name });
        // load counsellors for dropdown (only then)
        await loadCounsellors();
        setLoading(false);
        return;
      }
      // success
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert(err.message || "Google sign-in failed");
      setLoading(false);
    }
  };

  const completeRole = async () => {
    if (!googleIdToken) return alert("Missing Google token");
    if (role === "counsilli" && !counsellorName)
      return alert("Please pick your counsellor");
    setLoading(true);
    try {
      const res = await loginWithGoogle({
        idToken: googleIdToken,
        role,
        counsellorName: role === "counsilli" ? counsellorName : undefined,
      });
      if (res.success) navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to complete signup");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="w-full max-w-md p-8 space-y-6 bg-white/50 backdrop-blur-md rounded-2xl shadow-2xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">
            Sign in with Google
          </h1>
          <p className="text-gray-600">Use your Google account to continue.</p>
        </div>

        {/* Debug / diagnostics area */}
        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-sm text-yellow-900">
          <div className="mb-2">
            SDK loaded: <strong>{sdkLoaded ? "yes" : "no"}</strong>
          </div>
          <div className="mb-2">
            Frontend client id:
            <code className="ml-2 break-all text-xs bg-white/60 px-2 py-1 rounded">
              {clientId || "<VITE_GOOGLE_CLIENT_ID not set>"}
            </code>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClickRenderButton}
              className="px-3 py-1 bg-blue-600 text-white rounded"
            >
              Render Google Button
            </button>
            <button
              onClick={onClickPrompt}
              className="px-3 py-1 bg-green-600 text-white rounded"
            >
              Show One‑Tap Prompt
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-700">
            If you see Google's "400. That’s an error." page after clicking a
            Google link, it usually means your OAuth Client configuration
            (Client ID, Authorized JavaScript origins or Redirect URIs) does not
            match the request. For the client-side GSI flow you must:
            <ul className="list-disc ml-4">
              <li>
                Add your frontend origin to "Authorized JavaScript origins"
                (e.g. http://localhost:5173)
              </li>
              <li>
                Set VITE_GOOGLE_CLIENT_ID in the frontend .env and restart dev
                server
              </li>
            </ul>
          </div>
        </div>

        {/* Google button container */}
        <div id="google-auth-btn" className="flex justify-center my-4" />

        {/* One-time role completion if backend asks */}
        {needRole ? (
          <div>
            <p className="mb-2 text-sm">
              Complete account setup for <strong>{needRole.email}</strong>
            </p>

            <div className="mb-2">
              <label className="block text-sm">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full border p-2 rounded"
              >
                <option value="counsilli">Counsilli</option>
                <option value="counsellor">Counsellor</option>
              </select>
            </div>

            {role === "counsilli" && (
              <div className="mb-2">
                <label className="block text-sm">Select Counsellor</label>
                <select
                  value={counsellorName}
                  onChange={(e) => setCounsellorName(e.target.value)}
                  className="w-full border p-2 rounded"
                >
                  {counsellors.length === 0 ? (
                    <option value="">No counsellors available</option>
                  ) : (
                    counsellors.map((c) => (
                      <option key={c._id} value={c.name}>
                        {c.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
            )}

            <div className="flex gap-2 mt-3">
              <button
                onClick={completeRole}
                className="bg-orange-600 text-white px-4 py-2 rounded"
                disabled={loading}
              >
                {loading ? "Processing..." : "Complete Signup"}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-center text-gray-600">
            After clicking the Google button you will either sign in or be asked
            to complete a one-time role setup.
          </div>
        )}
      </div>
    </div>
  );
}
