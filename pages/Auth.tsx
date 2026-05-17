import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../services/auth';
import { User, Lock, Mail, ArrowRight, Loader2, ArrowLeft, Sparkles } from 'lucide-react';
import { CinematicBackground } from '../components/CinematicBackground';

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        await authService.login(formData.email, formData.password);
      } else {
        await authService.register(formData.username, formData.email, formData.password);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6">
      <CinematicBackground />
      
      <button
        onClick={() => navigate('/')}
        className="absolute top-10 left-10 z-50 flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/50 hover:text-white transition-all group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span className="font-bold text-xs uppercase tracking-widest">Back</span>
      </button>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-[440px] bg-white/5 border border-white/10 p-10 md:p-14 rounded-[40px] backdrop-blur-2xl shadow-2xl"
      >
        <div className="text-center mb-12">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mx-auto mb-6 text-rose-500">
                <Sparkles size={32} />
            </div>
          <h1 className="text-4xl font-display font-bold text-white mb-3 tracking-tight">
            {isLogin ? 'Welcome Back' : 'Join K-Flix'}
          </h1>
          <p className="text-white/30 font-medium">
            {isLogin ? 'Access your cinematic universe' : 'Start your premium streaming journey'}
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="bg-rose-500/10 border border-rose-500/50 text-rose-200 text-xs font-bold p-4 rounded-2xl mb-8 uppercase tracking-wider text-center"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Username</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-rose-500 transition-colors" />
                <input
                  name="username"
                  type="text"
                  required
                  placeholder="johndoe"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-rose-500/50 transition-all placeholder:text-white/10 font-medium"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">
                {isLogin ? 'Email or Username' : 'Email Address'}
            </label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-rose-500 transition-colors" />
              <input
                name="email"
                type={isLogin ? "text" : "email"}
                required
                placeholder="user@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-rose-500/50 transition-all placeholder:text-white/10 font-medium"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-rose-500 transition-colors" />
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-rose-500/50 transition-all placeholder:text-white/10 font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-16 bg-white text-black rounded-[24px] font-bold flex items-center justify-center gap-3 transition-all hover:bg-rose-500 hover:text-white active:scale-95 disabled:opacity-50 mt-10 shadow-2xl shadow-black/20"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : (
              <>
                <span className="uppercase tracking-widest text-sm">{isLogin ? 'Sign In' : 'Join Now'}</span>
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="mt-12 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setFormData({ username: '', email: '', password: '' });
              }}
              className="text-white/30 text-sm font-medium hover:text-white transition-colors"
            >
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <span className="text-rose-500 font-bold ml-1 hover:underline">
                {isLogin ? 'Create one' : 'Sign in'}
              </span>
            </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
