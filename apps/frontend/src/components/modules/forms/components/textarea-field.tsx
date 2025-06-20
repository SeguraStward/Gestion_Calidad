import { TextareaFieldProps } from '../types'

export const TextareaField = ({ field, register, errorMessage }: any) => (
  <textarea
    id={field.name}
    placeholder={(field as TextareaFieldProps).placeholder}
    rows={(field as TextareaFieldProps).rows || 4}
    className={`w-full border rounded p-2 ${errorMessage ? 'border-red-500' : ''}`}
    disabled={field.disabled}
    {...register(field.name)}
  />
)
