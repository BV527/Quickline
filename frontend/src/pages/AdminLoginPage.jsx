import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminLoginSchema } from '@/utils/validation';
import { authService } from '@/services/authService';
import { useAuth } from '@/context/AuthContext';
import PublicLayout from '@/layouts/PublicLayout';
import FormInput from '@/components/FormInput';
import LoadingSpinner from '@/components/LoadingSpinner';

const AdminLoginPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(adminLoginSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await login(data.username, data.password, 'admin');
      toast.success('Login successful!');
      navigate('/admin/dashboard');
      
      // Force reload to ensure proper dashboard loads
      setTimeout(() => {
        window.location.href = '/admin/dashboard';
      }, 100);
    } catch (error) {
      toast.error('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="max-w-md mx-auto">
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Admin Login
          </h2>
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormInput
              label="Email"
              type="email"
              placeholder="Enter email address"
              {...register('username')}
              error={errors.username?.message}
            />

            <FormInput
              label="Password"
              type="password"
              placeholder="Enter password"
              {...register('password')}
              error={errors.password?.message}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <button
              onClick={() => navigate('/')}
              className="text-primary-600 hover:text-primary-700 font-medium text-sm"
            >
              ← Back to Patient Login
            </button>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default AdminLoginPage;