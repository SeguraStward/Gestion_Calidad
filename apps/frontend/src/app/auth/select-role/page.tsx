'use client'

import { AlertTriangle, ArrowLeft, Crown, Loader2, Shield, Sparkles, UserCheck } from 'lucide-react'

import { Alert, AlertDescription } from '@una-gc/ui/components/alert'
import { Badge } from '@una-gc/ui/components/badge'
import { Button } from '@una-gc/ui/components/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@una-gc/ui/components/card'
import { Progress } from '@una-gc/ui/components/progress'
import { RadioGroup } from '@una-gc/ui/components/radio-group'
import { Separator } from '@una-gc/ui/components/separator'

import { AuthLayout, EmptyRoleState, RoleCard, RoleLoadingSkeleton } from '@/modules/auth/components'
import RoleTransition from '@/modules/auth/components/RoleTransition'
import { useRoleSelection } from '@/modules/auth/hooks'
import { cn } from '@una-gc/ui/lib/utils'

export default function SelectRolePage() {
  const {
    roles,
    selectedRole,
    loading,
    submitting,
    error,
    canSkip,
    hasActiveRole,
    showTransition,
    setSelectedRole,
    handleSubmit,
    handleSkip,
    fetchRoles
  } = useRoleSelection()

  if (showTransition && selectedRole) {
    return <RoleTransition roleName={selectedRole.name} onComplete={() => {}} />
  }

  return (
    <AuthLayout
      title="Selecciona tu rol"
      subtitle="Elige el rol con el que deseas trabajar"
      icon={<Crown className="w-6 h-6 text-primary" />}
      maxWidth="lg"
    >
      {/* Status Badge */}
      {hasActiveRole && (
        <div className="flex justify-center animate-in fade-in-50 duration-500">
          <Badge
            variant="outline"
            className="bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-green-200 shadow-sm"
          >
            <UserCheck className="w-3 h-3 mr-1" />
            Ya tienes un rol activo
          </Badge>
        </div>
      )}

      {/* Progress indicator */}
      <div className="w-full max-w-md mx-auto">
        <Progress value={selectedRole ? 100 : 0} className="h-2" />
        <p className="text-xs text-muted-foreground mt-2 text-center">
          {selectedRole ? 'Rol seleccionado - Listo para continuar' : 'Selecciona un rol para continuar'}
        </p>
      </div>

      {/* Card principal */}
      <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-gray-50/80 dark:from-zinc-900 dark:to-zinc-800/80 overflow-hidden backdrop-blur-sm">
        <CardHeader className="pb-6 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center ring-4 ring-primary/10">
              <Shield className="w-6 h-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Roles Disponibles
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground text-center">
            {hasActiveRole
              ? 'Ya tienes un rol activo. Puedes seleccionar un nuevo rol o continuar con el actual.'
              : roles.length > 1
                ? `Tienes ${roles.length} roles disponibles. Selecciona uno para continuar.`
                : roles.length === 1
                  ? 'Tienes 1 rol disponible.'
                  : 'Cargando roles disponibles...'}
          </CardDescription>
        </CardHeader>{' '}
        <CardContent className="space-y-6 py-8 px-8">
          {error && (
            <Alert
              variant="destructive"
              className="border-red-200 bg-red-50 dark:bg-red-900/30 animate-in fade-in slide-in-from-top-2 duration-300"
            >
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="space-y-4">
              <RoleLoadingSkeleton />
              <div className="text-center">
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Cargando roles disponibles...
                </p>
                <p className="text-xs text-muted-foreground/60 mt-2">Por favor espera, esto puede tomar unos segundos</p>
              </div>
            </div>
          ) : roles.length === 0 && error ? (
            <EmptyRoleState onRetry={fetchRoles} />
          ) : roles.length === 0 ? (
            <div className="space-y-4">
              <RoleLoadingSkeleton />
              <div className="text-center">
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verificando roles disponibles...
                </p>
                <p className="text-xs text-muted-foreground/60 mt-2">Esperando respuesta del servidor</p>
              </div>
            </div>
          ) : roles.length > 0 ? (
            <div className="space-y-4">
              <RadioGroup
                value={selectedRole ? selectedRole.id.toString() : null}
                onValueChange={(value) => {
                  const role = roles.find((r) => r.id.toString() === value)
                  if (role) setSelectedRole(role)
                }}
                className="space-y-3"
              >
                {roles.map((role, index) => (
                  <div
                    key={role.id}
                    className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <RoleCard role={role} isSelected={selectedRole?.id === role.id} index={index} totalRoles={roles.length} />
                    {index < roles.length - 1 && <Separator className="my-4 opacity-50" />}
                  </div>
                ))}
              </RadioGroup>

              {selectedRole && (
                <div className="mt-6 p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center gap-2 text-sm font-medium text-primary">
                    <Shield className="w-4 h-4" />
                    Rol seleccionado: {selectedRole.name}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Presiona &quot;Continuar&quot; para acceder al sistema con este rol
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </CardContent>
        <CardFooter
          className={cn(
            'flex pt-6 bg-gradient-to-r from-muted/20 to-muted/40 px-8 pb-8',
            canSkip ? 'gap-4 flex-row' : 'flex-col gap-0'
          )}
        >
          {canSkip ? (
            <>
              <Button
                onClick={handleSkip}
                variant="outline"
                disabled={submitting}
                className="flex-1 justify-center hover:bg-secondary h-12 font-medium shadow-sm hover:shadow-md transition-all duration-200 min-w-[140px]"
                size="lg"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {hasActiveRole ? 'Regresar al Inicio' : 'Cancelar selección'}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!selectedRole || submitting || loading || !!error}
                className={cn(
                  'flex-1 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold h-12 text-base group min-w-[140px]',
                  'bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary'
                )}
                size="lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <span>Continuar</span>
                      <Sparkles className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </div>
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!selectedRole || submitting || loading || !!error}
              className={cn(
                'w-full mt-0 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold h-12 text-base group',
                'bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary'
              )}
              size="lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span>Continuar</span>
                    <Sparkles className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </div>
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Footer info */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <div className="w-1 h-1 bg-primary/50 rounded-full" />
          <p className="text-xs text-muted-foreground">Los roles determinan tus permisos y acceso al sistema</p>
          <div className="w-1 h-1 bg-primary/50 rounded-full" />
        </div>
        <p className="text-xs text-muted-foreground/60">Selecciona cuidadosamente según tus responsabilidades</p>
      </div>
    </AuthLayout>
  )
}
