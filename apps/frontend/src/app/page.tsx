'use client';

import { Button } from '@una-gc/ui/components/button';
import { LogIn } from 'lucide-react';

export default function HomePage() {
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:3000/api/v1/auth/google/login';
  };

  return (
    <main>
      <h1>Iniciar sesión con cuenta institucional</h1>
      <Button onClick={handleGoogleLogin}>
        Iniciar sesión con Google
        <LogIn/>
      </Button>
    </main>
  );
}