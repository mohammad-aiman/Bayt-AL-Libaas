'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, Loader2, ArrowLeft, Mail, Lock, AlertCircle } from 'lucide-react';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Redirect already authenticated users
  useEffect(() => {
    if (status === 'loading') return; // Still loading
    
    if (session?.user) {
      const callbackUrl = searchParams.get('callbackUrl') || '/';
      router.replace(callbackUrl);
      return;
    }
  }, [session, status, router, searchParams]);

  useEffect(() => {
    // Check for messages from URL parameters
    const message = searchParams.get('message');
    if (message) {
      // Check if it's an error message (like account deactivation)
      if (message.includes('deactivated') || message.includes('suspended') || message.includes('blocked')) {
        toast.error(decodeURIComponent(message));
      } else {
        // Success message (like password reset)
        toast.success(decodeURIComponent(message));
      }
    }
  }, [searchParams]);

  // Form validation
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!email || !email.includes('@')) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password || password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: string, value: string) => {
    if (field === 'email') setEmail(value);
    if (field === 'password') setPassword(value);
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Don't render the form if user is already authenticated
  if (status === 'loading') {
    return (
      <div className="mobile:min-h-screen mobile:flex mobile:items-center mobile:justify-center mobile:bg-gray-50 mobile:px-4 sm:min-h-screen sm:flex sm:items-center sm:justify-center sm:bg-gray-50">
        <div className="mobile:text-center sm:text-center">
          <div className="animate-spin rounded-full mobile:h-8 mobile:w-8 sm:h-12 sm:w-12 border-b-2 border-accent-purple-600 mx-auto"></div>
          <p className="mobile:mt-3 mobile:text-mobile-sm mobile:text-gray-600 sm:mt-4 sm:text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (session?.user) {
    return (
      <div className="mobile:min-h-screen mobile:flex mobile:items-center mobile:justify-center mobile:bg-gray-50 mobile:px-4 sm:min-h-screen sm:flex sm:items-center sm:justify-center sm:bg-gray-50">
        <div className="mobile:text-center sm:text-center">
          <div className="animate-spin rounded-full mobile:h-8 mobile:w-8 sm:h-12 sm:w-12 border-b-2 border-accent-purple-600 mx-auto"></div>
          <p className="mobile:mt-3 mobile:text-mobile-sm mobile:text-gray-600 sm:mt-4 sm:text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        // Show specific error for deactivated accounts, otherwise generic message
        toast.error('Invalid credentials or account may be deactivated. Please contact support if you believe this is an error.');
      } else {
        toast.success('Signed in successfully');
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const result = await signIn('google', {
        callbackUrl: '/',
        redirect: false
      });

      console.log('Google Sign-in Result:', result);

      if (result?.error) {
        console.error('Google sign-in error:', result.error);
        toast.error('Failed to sign in with Google. Please try again.');
      } else if (result?.url) {
        // Successful sign-in, manually handle redirect
        router.push(result.url);
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      toast.error('Failed to sign in with Google. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mobile:min-h-screen mobile:bg-gray-50 mobile:flex mobile:flex-col sm:min-h-screen sm:flex sm:items-center sm:justify-center sm:bg-gray-50 sm:py-12 sm:px-4 lg:px-8">
      {/* Mobile Header */}
      <div className="mobile:bg-white mobile:shadow-mobile mobile:border-b mobile:border-gray-200 mobile:px-4 mobile:py-4 mobile:flex mobile:items-center mobile:justify-between sm:hidden">
        <button
          onClick={() => router.back()}
          className="mobile:p-2 mobile:-ml-2 mobile:text-gray-600 mobile:hover:text-gray-800 mobile:hover:bg-gray-100 mobile:rounded-mobile mobile:transition-colors mobile:min-h-touch mobile:min-w-touch mobile:flex mobile:items-center mobile:justify-center"
        >
          <ArrowLeft className="mobile:h-6 mobile:w-6" />
        </button>
        <h1 className="mobile:text-mobile-lg mobile:font-semibold mobile:text-gray-900">Sign In</h1>
        <div className="mobile:w-10" /> {/* Spacer for center alignment */}
      </div>

      {/* Main Content */}
      <div className="mobile:flex-1 mobile:flex mobile:flex-col mobile:justify-center mobile:px-4 mobile:py-8 sm:max-w-md sm:w-full sm:space-y-8">
        {/* Desktop Header */}
        <div className="mobile:hidden sm:block">
          <div className="mobile:text-center sm:text-center">
            <div className="mobile:mb-6 sm:mb-6">
              <h2 className="mobile:text-mobile-2xl mobile:font-bold mobile:text-gray-900 sm:text-3xl sm:font-extrabold sm:text-gray-900">
                Welcome back
              </h2>
              <p className="mobile:mt-2 mobile:text-mobile-sm mobile:text-gray-600 sm:mt-2 sm:text-sm sm:text-gray-600">
                Sign in to your account to continue
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Welcome Section */}
        <div className="mobile:text-center mobile:mb-8 sm:hidden">
          <h2 className="mobile:text-mobile-2xl mobile:font-bold mobile:text-gray-900">
            Welcome back
          </h2>
          <p className="mobile:mt-2 mobile:text-mobile-base mobile:text-gray-600">
            Sign in to your account to continue
          </p>
        </div>

        {/* Sign In Form */}
        <div className="mobile:bg-white mobile:rounded-mobile-xl mobile:shadow-mobile mobile:border mobile:border-gray-200 mobile:p-6 sm:bg-transparent sm:shadow-none sm:border-none sm:p-0">
          <form className="mobile:space-y-6 sm:space-y-6" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label 
                htmlFor="email" 
                className="mobile:block mobile:text-mobile-sm mobile:font-semibold mobile:text-gray-900 mobile:mb-2 sm:block sm:text-sm sm:font-medium sm:text-gray-700"
              >
                Email Address
              </label>
              <div className="mobile:relative sm:relative">
                <div className="mobile:absolute mobile:inset-y-0 mobile:left-0 mobile:pl-3 mobile:flex mobile:items-center mobile:pointer-events-none sm:absolute sm:inset-y-0 sm:left-0 sm:pl-3 sm:flex sm:items-center sm:pointer-events-none">
                  <Mail className="mobile:h-5 mobile:w-5 mobile:text-gray-400 sm:h-5 sm:w-5 sm:text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`mobile:block mobile:w-full mobile:pl-10 mobile:pr-3 mobile:py-4 mobile:border mobile:rounded-mobile-lg mobile:focus:ring-2 mobile:focus:ring-accent-purple-500 mobile:focus:border-accent-purple-500 mobile:text-mobile-base mobile:placeholder-gray-400 mobile:min-h-touch sm:appearance-none sm:relative sm:block sm:w-full sm:pl-10 sm:pr-3 sm:py-2 sm:border sm:placeholder-gray-500 sm:text-gray-900 sm:rounded-md sm:focus:outline-none sm:focus:ring-accent-purple-500 sm:focus:border-accent-purple-500 sm:focus:z-10 sm:text-sm ${
                    errors.email 
                      ? 'mobile:border-red-300 mobile:bg-red-50 sm:border-red-300' 
                      : 'mobile:border-gray-300 mobile:bg-white sm:border-gray-300'
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <div className="mobile:mt-2 mobile:flex mobile:items-center mobile:space-x-2 sm:mt-1 sm:flex sm:items-center sm:space-x-1">
                  <AlertCircle className="mobile:h-4 mobile:w-4 mobile:text-red-500 mobile:flex-shrink-0 sm:h-4 sm:w-4 sm:text-red-500 sm:flex-shrink-0" />
                  <p className="mobile:text-mobile-xs mobile:text-red-600 sm:text-sm sm:text-red-600">{errors.email}</p>
                </div>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label 
                htmlFor="password" 
                className="mobile:block mobile:text-mobile-sm mobile:font-semibold mobile:text-gray-900 mobile:mb-2 sm:block sm:text-sm sm:font-medium sm:text-gray-700"
              >
                Password
              </label>
              <div className="mobile:relative sm:relative">
                <div className="mobile:absolute mobile:inset-y-0 mobile:left-0 mobile:pl-3 mobile:flex mobile:items-center mobile:pointer-events-none sm:absolute sm:inset-y-0 sm:left-0 sm:pl-3 sm:flex sm:items-center sm:pointer-events-none">
                  <Lock className="mobile:h-5 mobile:w-5 mobile:text-gray-400 sm:h-5 sm:w-5 sm:text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className={`mobile:block mobile:w-full mobile:pl-10 mobile:pr-12 mobile:py-4 mobile:border mobile:rounded-mobile-lg mobile:focus:ring-2 mobile:focus:ring-accent-purple-500 mobile:focus:border-accent-purple-500 mobile:text-mobile-base mobile:placeholder-gray-400 mobile:min-h-touch sm:appearance-none sm:relative sm:block sm:w-full sm:pl-10 sm:pr-12 sm:py-2 sm:border sm:placeholder-gray-500 sm:text-gray-900 sm:rounded-md sm:focus:outline-none sm:focus:ring-accent-purple-500 sm:focus:border-accent-purple-500 sm:focus:z-10 sm:text-sm ${
                    errors.password 
                      ? 'mobile:border-red-300 mobile:bg-red-50 sm:border-red-300' 
                      : 'mobile:border-gray-300 mobile:bg-white sm:border-gray-300'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="mobile:absolute mobile:inset-y-0 mobile:right-0 mobile:pr-3 mobile:flex mobile:items-center mobile:min-w-touch mobile:justify-center sm:absolute sm:inset-y-0 sm:right-0 sm:pr-3 sm:flex sm:items-center"
                >
                  {showPassword ? (
                    <EyeOff className="mobile:h-5 mobile:w-5 mobile:text-gray-400 mobile:hover:text-gray-600 sm:h-5 sm:w-5 sm:text-gray-400 sm:hover:text-gray-600" />
                  ) : (
                    <Eye className="mobile:h-5 mobile:w-5 mobile:text-gray-400 mobile:hover:text-gray-600 sm:h-5 sm:w-5 sm:text-gray-400 sm:hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <div className="mobile:mt-2 mobile:flex mobile:items-center mobile:space-x-2 sm:mt-1 sm:flex sm:items-center sm:space-x-1">
                  <AlertCircle className="mobile:h-4 mobile:w-4 mobile:text-red-500 mobile:flex-shrink-0 sm:h-4 sm:w-4 sm:text-red-500 sm:flex-shrink-0" />
                  <p className="mobile:text-mobile-xs mobile:text-red-600 sm:text-sm sm:text-red-600">{errors.password}</p>
                </div>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="mobile:text-right sm:text-right">
              <Link
                href="/auth/forgot-password"
                className="mobile:text-mobile-sm mobile:font-medium mobile:text-accent-purple-600 mobile:hover:text-accent-purple-500 mobile:transition-colors sm:text-sm sm:text-accent-purple-600 sm:hover:text-accent-purple-500"
              >
                Forgot your password?
              </Link>
            </div>

            {/* Sign In Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="mobile:group mobile:relative mobile:w-full mobile:flex mobile:justify-center mobile:items-center mobile:py-4 mobile:px-4 mobile:border mobile:border-transparent mobile:text-mobile-base mobile:font-semibold mobile:rounded-mobile-lg mobile:text-white mobile:bg-gradient-to-r mobile:from-accent-purple-600 mobile:to-accent-blue-600 mobile:hover:from-accent-purple-700 mobile:hover:to-accent-blue-700 mobile:focus:outline-none mobile:focus:ring-2 mobile:focus:ring-offset-2 mobile:focus:ring-accent-purple-500 mobile:disabled:opacity-50 mobile:disabled:cursor-not-allowed mobile:transition-all mobile:duration-200 mobile:shadow-mobile-lg mobile:hover:shadow-mobile-xl mobile:min-h-touch sm:group sm:relative sm:w-full sm:flex sm:justify-center sm:py-2 sm:px-4 sm:border sm:border-transparent sm:text-sm sm:font-medium sm:rounded-md sm:text-white sm:bg-accent-purple-600 sm:hover:bg-accent-purple-700 sm:focus:outline-none sm:focus:ring-2 sm:focus:ring-offset-2 sm:focus:ring-accent-purple-500 sm:disabled:opacity-50 sm:disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="mobile:h-5 mobile:w-5 mobile:animate-spin sm:h-5 sm:w-5 sm:animate-spin" />
                ) : (
                  'Sign In'
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="mobile:relative mobile:my-6 sm:relative">
              <div className="mobile:absolute mobile:inset-0 mobile:flex mobile:items-center sm:absolute sm:inset-0 sm:flex sm:items-center">
                <div className="mobile:w-full mobile:border-t mobile:border-gray-300 sm:w-full sm:border-t sm:border-gray-300" />
              </div>
              <div className="mobile:relative mobile:flex mobile:justify-center mobile:text-mobile-sm sm:relative sm:flex sm:justify-center sm:text-sm">
                <span className="mobile:px-4 mobile:bg-white mobile:text-gray-500 sm:px-2 sm:bg-gray-50 sm:text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Google Sign In */}
            <div>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="mobile:group mobile:relative mobile:w-full mobile:flex mobile:justify-center mobile:items-center mobile:py-4 mobile:px-4 mobile:border mobile:border-gray-300 mobile:text-mobile-base mobile:font-medium mobile:rounded-mobile-lg mobile:text-gray-700 mobile:bg-white mobile:hover:bg-gray-50 mobile:focus:outline-none mobile:focus:ring-2 mobile:focus:ring-offset-2 mobile:focus:ring-accent-purple-500 mobile:disabled:opacity-50 mobile:disabled:cursor-not-allowed mobile:transition-colors mobile:min-h-touch sm:group sm:relative sm:w-full sm:flex sm:justify-center sm:py-2 sm:px-4 sm:border sm:border-gray-300 sm:text-sm sm:font-medium sm:rounded-md sm:text-gray-700 sm:bg-white sm:hover:bg-gray-50 sm:focus:outline-none sm:focus:ring-2 sm:focus:ring-offset-2 sm:focus:ring-accent-purple-500 sm:disabled:opacity-50 sm:disabled:cursor-not-allowed"
              >
                <svg className="mobile:w-5 mobile:h-5 mobile:mr-3 sm:w-5 sm:h-5 sm:mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </button>
            </div>
          </form>

          {/* Sign Up Link */}
          <div className="mobile:mt-6 mobile:text-center mobile:border-t mobile:border-gray-200 mobile:pt-6 sm:mt-6 sm:text-center">
            <p className="mobile:text-mobile-sm mobile:text-gray-600 sm:text-sm sm:text-gray-600">
              Don't have an account?{' '}
              <Link 
                href="/auth/signup" 
                className="mobile:font-semibold mobile:text-accent-purple-600 mobile:hover:text-accent-purple-500 mobile:transition-colors sm:font-medium sm:text-accent-purple-600 sm:hover:text-accent-purple-500"
              >
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 