'use client';
import { signIn } from 'next-auth/react';
import { Button } from '../components/ui/button';
import { FcGoogle } from 'react-icons/fc';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="bg-card p-8 rounded-lg shadow-lg flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-6">Sign in to XenoCRM</h1>
        <Button
          onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
          className="flex items-center gap-2"
          size="lg"
        >
          <FcGoogle className="h-5 w-5" /> Sign in with Google
        </Button>
      </div>
    </div>
  );
} 