import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../features/auth/auth.api";
import { useAuthStore } from "../store/auth.store";
import { Dumbbell, Mail, Lock, Eye, EyeOff } from "lucide-react";
export default function LoginPage() {
    const navigate = useNavigate();
    const { setAuth, gymId, setGymId, user } = useAuthStore();
    const [email, setEmail] = useState("admin@gymza.com");
    const [password, setPassword] = useState("Password123");
    const [role, setRole] = useState("member");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    React.useEffect(() => {
        if (user) {
            if (user.role === "member") {
                if (user.status === "pending") {
                    navigate("/pending-approval");
                }
                else if (user.status === "inactive") {
                    navigate("/account-inactive");
                }
                else {
                    navigate("/");
                }
            }
            else {
                navigate("/");
            }
        }
    }, [user, navigate]);
    const submit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const { data } = await login({ gymId, email, password, role });
            const userData = data.data.user;
            setAuth(userData, data.data.accessToken);
            if (userData.role === "member") {
                if (userData.status === "pending") {
                    navigate("/pending-approval");
                }
                else if (userData.status === "inactive") {
                    navigate("/account-inactive");
                }
                else {
                    navigate("/");
                }
            }
            else {
                navigate("/");
            }
        }
        catch (err) {
            setError(err.response?.data?.message || "Invalid login credentials");
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "login-page", style: {
            display: 'flex',
            minHeight: '100vh',
            background: 'var(--clr-bg-base)',
            position: 'relative',
            overflow: 'hidden'
        }, children: [_jsxs("div", { className: "bg-mesh", children: [_jsx("div", { className: "blob-1" }), _jsx("div", { className: "blob-2" })] }), _jsx("div", { className: "login-left", style: {
                    flex: '0 0 450px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '0.5rem 0rem 0.5rem 0rem',
                    zIndex: 1
                }, children: _jsxs("div", { className: "glass-card", style: { padding: '3rem' }, children: [_jsxs("div", { className: "text-center", style: { marginBottom: '2.5rem' }, children: [_jsx("div", { style: {
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '16px',
                                        background: 'var(--clr-accent-gradient)',
                                        marginBottom: '1rem',
                                        color: 'white'
                                    }, children: _jsx(Dumbbell, { size: 32 }) }), _jsx("h1", { style: { fontSize: '2rem', fontWeight: '800' }, children: "Gymza" }), _jsx("p", { className: "text-muted", children: "Sign in to your account" })] }), _jsxs("form", { onSubmit: submit, children: [error && (_jsx("div", { style: {
                                        background: 'rgba(244, 63, 94, 0.1)',
                                        color: 'var(--clr-danger)',
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        fontSize: '0.85rem',
                                        marginBottom: '1.5rem',
                                        border: '1px solid rgba(244, 63, 94, 0.2)'
                                    }, children: error })), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Gym ID" }), _jsx("div", { style: { position: 'relative' }, children: _jsx("input", { className: "form-input", value: gymId, onChange: (e) => setGymId(e.target.value), placeholder: "Enter Gym ID" }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Email Address" }), _jsxs("div", { style: { position: 'relative' }, children: [_jsx(Mail, { size: 18, style: { position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--clr-text-muted)' } }), _jsx("input", { className: "form-input", style: { paddingLeft: '3rem' }, type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "admin@gymza.com" })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Sign in as" }), _jsxs("select", { className: "form-input", value: role, onChange: (e) => setRole(e.target.value), children: [_jsx("option", { value: "member", children: "Member" }), _jsx("option", { value: "trainer", children: "Trainer" }), _jsx("option", { value: "admin", children: "Admin" })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Password" }), _jsxs("div", { style: { position: 'relative' }, children: [_jsx(Lock, { size: 18, style: { position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--clr-text-muted)' } }), _jsx("input", { className: "form-input", style: { paddingLeft: '3rem', paddingRight: '3rem' }, type: showPassword ? "text" : "password", value: password, onChange: (e) => setPassword(e.target.value), placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), style: { position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--clr-text-muted)' }, children: showPassword ? _jsx(EyeOff, { size: 18 }) : _jsx(Eye, { size: 18 }) })] })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }, children: [_jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }, children: [_jsx("input", { type: "checkbox", style: { accentColor: 'var(--clr-primary)' } }), _jsx("span", { children: "Remember me" })] }), _jsx("a", { href: "#", style: { fontSize: '0.85rem', color: 'var(--clr-primary)', fontWeight: '600' }, children: "Forgot Password?" })] }), _jsx("button", { type: "submit", className: "btn btn-primary w-full", style: { padding: '0.875rem' }, disabled: loading, children: loading ? 'Signing In...' : 'Sign In' })] }), _jsx("div", { className: "text-center", style: { marginTop: '2rem' }, children: _jsxs("p", { className: "text-muted", style: { fontSize: '0.9rem' }, children: ["Don't have an account? ", _jsx(Link, { to: "/signup", style: { color: 'var(--clr-primary)', fontWeight: '600' }, children: "Sign up" })] }) })] }) }), _jsx("div", { className: "login-right", style: { flex: 1, position: 'relative' } })] }));
}
