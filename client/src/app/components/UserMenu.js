'use client';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Button } from './ui/button';

export default function UserMenu() {
  const { data: session, status } = useSession();

  if (status === 'loading') return null;

  if (!session) {
    return (
      <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
      // add call back ui to dashboard
            onClick={() =>
              signIn('google', {
                callbackUrl: `${window.location.origin}/dashboard`,
              })
              
            }
            >
              Sign In
            </Button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <img
        src={session.user.image}
        alt={session.user.name}
        className="w-8 h-8 rounded-full"
      />
      <span>{session.user.name}</span>
      <Button variant="outline" onClick={() => signOut()}>Sign Out</Button>
    </div>
  );
} 