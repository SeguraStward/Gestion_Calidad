'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';

import { Card, CardContent, CardFooter } from '@una-gc/ui/components/card';
import { Button } from '@una-gc/ui/components/button';
import { cn } from '@una-gc/ui/lib/utils';

const availableRoles = ['Admin', 'Profesor', 'Estudiante', 'Invitado'];

export default function SelectRolePage() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = () => {
    if (!selectedRole) return;
    localStorage.setItem('selected_role', selectedRole);
    router.push('/profile');
  };

  return (
    <Card className="w-full">
      <CardContent className="flex flex-col gap-4 pt-6">
        {availableRoles.map((role) => {
          const isSelected = selectedRole === role;
          return (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={cn(
                'flex items-center justify-between w-full p-4 rounded-md border text-sm font-medium transition-all',
                isSelected
                  ? 'border-primary bg-muted'
                  : 'border border-input hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <span>{role}</span>
              {isSelected && <CheckCircle className="w-4 h-4 text-primary" />}
            </button>
          );
        })}
      </CardContent>

      <CardFooter className="pt-2">
        <Button
          onClick={handleSubmit}
          disabled={!selectedRole}
          className="w-full"
        >
          Continuar
        </Button>
      </CardFooter>
    </Card>
  );
}
