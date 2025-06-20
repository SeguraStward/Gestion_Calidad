'use client'

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4">
      <section className="bg-background rounded-lg shadow-md p-8 max-w-xl w-full flex flex-col items-center">
        <h1 className="text-3xl font-extrabold mb-6 tracking-tight text-center">Bienvenido al Sistema de Gestión de Calidad</h1>
        <p className="text-lg text-center mb-4">Seleccione una opción en el menú lateral para comenzar</p>
        <div className="w-16 h-1 bg-muted rounded mb-2" />
      </section>
    </main>
  )
}
