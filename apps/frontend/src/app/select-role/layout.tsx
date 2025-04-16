import { ReactNode } from 'react';

export default function SelectRoleLayout({ children }: { children: ReactNode }) {
  return (
    <section className="flex items-center justify-center min-h-screen w-full px-4">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-3xl font-bold text-center">Selecciona tu rol</h1>
        <p className="text-center text-muted-foreground">
          Elige uno de los roles disponibles para continuar.
        </p>
        {children}
      </div>
    </section>
  );
}
