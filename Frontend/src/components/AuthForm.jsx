import React from 'react';
import { Link } from 'react-router-dom';

const AuthForm = ({ title, subtitle, type, onSubmit, onChange, error, isLoading }) => {
  return (
    <div className="w-full max-w-md mx-auto p-8 rounded-xl bg-[#0F0F11] border border-zinc-800 text-white shadow-2xl">
      <div className="flex justify-between items-baseline mb-2">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {type === 'login' ? (
          <Link to="/signup" className="text-sm font-medium hover:underline underline-offset-4 text-zinc-300">Sign Up</Link>
        ) : (
          <Link to="/login" className="text-sm font-medium hover:underline underline-offset-4 text-zinc-300">Login</Link>
        )}
      </div>
      <p className="text-sm text-zinc-400 mb-6">{subtitle}</p>
      
      {error && <div className="mb-4 p-3 rounded bg-red-900/30 border border-red-800 text-red-200 text-sm">{error}</div>}
      
      <form onSubmit={onSubmit} className="space-y-4">
        {type === 'signup' && (
          <div className="space-y-1.5 text-left">
            <label className="text-sm font-medium leading-none">Name</label>
            <input 
              name="name"
              type="text" 
              required
              onChange={onChange}
              placeholder="John Doe" 
              className="flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm ring-offset-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 focus-visible:ring-offset-2"
            />
          </div>
        )}
        <div className="space-y-1.5 text-left">
          <label className="text-sm font-medium leading-none">Email</label>
          <input 
            name="email"
            type="email" 
            required
            onChange={onChange}
            placeholder="m@example.com" 
            className="flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm ring-offset-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 focus-visible:ring-offset-2"
          />
        </div>
        <div className="space-y-1.5 text-left">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium leading-none">Password</label>
            {type === 'login' && <a href="#" className="text-sm text-zinc-400 hover:text-zinc-300">Forgot your password?</a>}
          </div>
          <input 
            name="password"
            type="password" 
            required
            onChange={onChange}
            className="flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm ring-offset-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 focus-visible:ring-offset-2"
          />
        </div>
        
        <div className="pt-4 border-t border-zinc-800 mt-6 flex flex-col space-y-3">
          <button 
            disabled={isLoading}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-zinc-950 bg-zinc-100 text-zinc-900 hover:bg-zinc-200 h-10 py-2 px-4 w-full disabled:opacity-50 transition-colors"
            type="submit">
            {isLoading ? "Loading..." : (type === 'login' ? 'Login' : 'Sign Up')}
          </button>
          <button 
            type="button"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-zinc-950 border border-zinc-700 bg-transparent hover:bg-zinc-800 hover:text-zinc-100 h-10 py-2 px-4 w-full transition-colors">
            {type === 'login' ? 'Login with Google' : 'Sign Up with Google'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AuthForm;
