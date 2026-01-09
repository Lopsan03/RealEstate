
import React, { useState } from 'react';
import { ShieldCheck, Lock, User as UserIcon } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { BRAND_NAME, AGENT_NAME } from '../constants';

interface AdminLoginProps {
  onLogin: (user: { username: string }) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!supabase) {
      // Fallback to local auth if Supabase is not configured
      if (email === 'admin' && pass === 'prosper2024') {
        onLogin({ username: AGENT_NAME });
      } else {
        setError('Credenciales inválidas. Intenta admin / prosper2024');
      }
      setLoading(false);
      return;
    }

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (authError) {
        console.error('Supabase auth error:', authError);
        throw authError;
      }

      if (data.user) {
        // Check if user is in admins table
        const { data: adminData, error: adminError } = await supabase
          .from('admins')
          .select('*')
          .eq('user_id', data.user.id)
          .single();

        if (adminError || !adminData) {
          await supabase.auth.signOut();
          setError('Usuario no autorizado como administrador.');
          setLoading(false);
          return;
        }

        onLogin({ username: adminData.email || AGENT_NAME });
      }
    } catch (err: any) {
      console.error('Login error details:', err);
      const errorMsg = err.message || err.error_description || 'Error al iniciar sesión. Verifica tus credenciales.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="bg-amber-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-amber-600/20">
            <ShieldCheck className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold font-serif">{BRAND_NAME}</h1>
          <p className="text-gray-500 mt-2">Panel de Administración</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                {supabase ? 'Email' : 'Usuario'}
              </label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={supabase ? 'email' : 'text'}
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-500 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={supabase ? 'tu@email.com' : 'admin'}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-500 transition-all"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                />
              </div>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 text-white font-bold py-4 rounded-xl hover:bg-amber-700 transition shadow-lg shadow-amber-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
