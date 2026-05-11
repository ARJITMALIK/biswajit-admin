import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const success = await login(email, password);
            if (success) {
                toast.success('Welcome back!');
                navigate('/');
            } else {
                toast.error('Invalid credentials');
            }
        } catch {
            toast.error('Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div 
            className="min-h-screen flex items-center justify-center p-4 relative bg-slate-50" 
            style={{ 
                backgroundImage: "url('/login-bg.png')", 
                backgroundSize: 'cover', 
                backgroundPosition: 'center' 
            }}
        >
            {/* Ambient lightening overlay for readability */}
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/50 to-white/90 pointer-events-none"></div>

            <div className="relative w-full max-w-[440px] animate-scale-in z-10">
                {/* Premium Glassmorphism Login Card (Light Variant) */}
                <div className="bg-white/70 backdrop-blur-2xl rounded-[32px] p-10 border border-white shadow-[0_16px_48px_rgba(251,146,60,0.15)] relative overflow-hidden">
                    
                    {/* Subtle inner reflection */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-transparent pointer-events-none"></div>

                    {/* Logo & Header Section */}
                    <div className="text-center mb-10 relative z-10">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center mx-auto mb-6 shadow-[0_8px_24px_rgba(249,115,22,0.3)] border border-orange-300/50 relative overflow-hidden">
                            {/* Inner glow effect */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/40"></div>
                            <span className="text-white font-black text-3xl tracking-tight relative z-10 shadow-sm">BD</span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight leading-tight mb-3 drop-shadow-sm">Biswajit Daimary</h1>
                        <div className="flex items-center justify-center gap-3">
                            <div className="h-px w-10 bg-gradient-to-r from-transparent to-orange-400/50"></div>
                            <p className="text-orange-600 text-xs font-bold tracking-[0.2em] uppercase">Executive Portal</p>
                            <div className="h-px w-10 bg-gradient-to-l from-transparent to-orange-400/50"></div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        {/* Email Input */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Email Address</label>
                            <div className="relative group">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-orange-500 transition-colors">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                    </svg>
                                </span>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="exec@domain.com"
                                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/80 border border-slate-200 text-slate-800 placeholder-slate-400 text-sm transition-all duration-300 hover:bg-white hover:border-orange-200 focus:bg-white focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none shadow-sm"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <div className="flex items-center mb-2">
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest">Security Key</label>
                            </div>
                            <div className="relative group">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-orange-500 transition-colors">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </span>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/80 border border-slate-200 text-slate-800 placeholder-slate-400 text-sm transition-all duration-300 hover:bg-white hover:border-orange-200 focus:bg-white focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none shadow-sm"
                                    required
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 mt-4 rounded-xl bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-400 hover:to-orange-300 text-white font-bold text-sm tracking-wide transition-all duration-300 disabled:opacity-50 shadow-[0_8px_20px_rgba(249,115,22,0.3)] hover:shadow-[0_12px_25px_rgba(249,115,22,0.4)] active:scale-[0.98] border border-orange-300 flex items-center justify-center relative overflow-hidden group"
                        >
                            {/* Shine effect on hover */}
                            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"></div>
                            
                            {loading ? (
                                <span className="flex items-center justify-center gap-2 relative z-10">
                                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Authenticating...
                                </span>
                            ) : (
                                <span className="relative z-10 flex items-center gap-2">
                                    Secure Access
                                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </span>
                            )}
                        </button>
                    </form>
                    
                    {/* Footer */}
                    <div className="mt-8 text-center border-t border-slate-200/60 pt-6 relative z-10">
                        <p className="text-slate-400 text-xs font-semibold">Made by Abhastra automations private limited &copy; {new Date().getFullYear()}</p>
                    </div>
                </div>
            </div>
            
            {/* Ambient decorative lighting */}
            <div className="absolute top-0 right-0 p-8 w-1/2 h-1/2 bg-orange-400/10 blur-[120px] pointer-events-none rounded-full"></div>
            <div className="absolute bottom-0 left-0 p-8 w-1/2 h-1/2 bg-amber-400/10 blur-[120px] pointer-events-none rounded-full"></div>
        </div>
    );
}
