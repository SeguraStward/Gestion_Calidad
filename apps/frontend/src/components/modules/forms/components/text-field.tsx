import { Input } from '@una-gc/ui/components/input'
import { TextFieldProps } from '../types'

export const TextField = ({ field, register, errorMessage }: any) => (
  <Input
    id={field.name}
    type={field.type}
    placeholder={(field as TextFieldProps).placeholder}
    aria-invalid={!!errorMessage}
    aria-describedby={errorMessage ? `${field.name}-error` : undefined}
    disabled={field.disabled}
    min={(field as TextFieldProps).min}
    max={(field as TextFieldProps).max}
    {...register(field.name)}
  />
)
