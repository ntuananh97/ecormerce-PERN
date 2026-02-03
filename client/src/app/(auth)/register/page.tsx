import { Metadata } from 'next';
import { RegisterForm } from '@/components/features/auth/RegisterForm';

export const metadata: Metadata = {
  title: 'Create Account | E-commerce',
  description: 'Create a new account to start shopping with us',
};

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Brand */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">E-Commerce</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Join us and start shopping today
          </p>
        </div>

        {/* Register Form */}
        <RegisterForm />
      </div>
    </div>
  );
}
