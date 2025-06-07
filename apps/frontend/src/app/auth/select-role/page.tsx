'use client'

import { Loader2, ArrowLeft, AlertTriangle, UserCheck, Shield, Users } from 'lucide-react'

import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@una-gc/ui/components/card'
import { Button } from '@una-gc/ui/components/button'
import { Alert, AlertDescription } from '@una-gc/ui/components/alert'
import { RadioGroup } from '@una-gc/ui/components/radio-group'
import { Badge } from '@una-gc/ui/components/badge'
import { Separator } from '@una-gc/ui/components/separator'

import { cn } from '@una-gc/ui/lib/utils'
import { useRoleSelection } from '@/modules/auth/hooks'
import { AuthLayout, RoleCard, RoleLoadingSkeleton, EmptyRoleState } from '@/modules/auth/components'

export default function SelectRolePage() {
  const {
    roles,
    selectedRole,
    loading,
    submitting,
    error,
    canSkip,
    hasActiveRole,
    setSelectedRole,
    handleSubmit,
    handleSkip,
    fetchRoles
  } = useRoleSelection()

  return (
    <AuthLayout
      title="Selecciona tu rol"
      subtitle="Elige el rol con el que deseas trabajar"
      icon={<Users className="w-6 h-6 text-primary" />}
      maxWidth="lg"
    >
      {/* Status Badge */}
      {hasActiveRole && (
        <div className="flex justify-center">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <UserCheck className="w-3 h-3 mr-1" />
            Ya tienes un rol activo
          </Badge>
        </div>
      )}

      {/* Card principal */}
      <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Roles Disponibles
          </CardTitle>
          <CardDescription>
            {hasActiveRole
              ? 'Ya tienes un rol activo. Puedes seleccionar un nuevo rol o continuar con el actual.'
              : roles.length > 1
                ? `Tienes ${roles.length} roles disponibles. Selecciona uno para continuar.`
                : roles.length === 1
                  ? 'Tienes 1 rol disponible.'
                  : 'Cargando roles disponibles...'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <RoleLoadingSkeleton />
          ) : roles.length === 0 ? (
            <EmptyRoleState onRetry={fetchRoles} />
          ) : (
            <RadioGroup
              value={selectedRole?.id.toString()}
              onValueChange={(value) => {
                const role = roles.find((r) => r.id.toString() === value)
                if (role) setSelectedRole(role)
              }}
              className="space-y-3"
            >
              {roles.map((role, index) => (
                <div key={role.id}>
                  <RoleCard role={role} isSelected={selectedRole?.id === role.id} index={index} totalRoles={roles.length} />
                  {index < roles.length - 1 && <Separator className="my-3" />}
                </div>
              ))}
            </RadioGroup>
          )}
        </CardContent>

        <CardFooter className="flex gap-3 pt-6">
          {canSkip && (
            <Button onClick={handleSkip} variant="outline" disabled={submitting} className="flex-1 hover:bg-secondary">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {hasActiveRole ? 'Regresar al Inicio' : 'Cancelar selección'}
            </Button>
          )}

          <Button
            onClick={handleSubmit}
            disabled={!selectedRole || submitting || loading || !!error}
            className={cn('transition-all shadow-md hover:shadow-lg', canSkip ? 'flex-1' : 'w-full')}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Continuar
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Footer info */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">Los roles determinan tus permisos y acceso al sistema</p>
      </div>
    </AuthLayout>
  )
}
