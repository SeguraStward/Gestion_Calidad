import { Checkbox } from '@una-gc/ui/components/checkbox'

export const CheckboxField = ({ field, register, errorMessage }: any) => (
  <Checkbox
    id={field.name}
    aria-describedby={errorMessage ? `${field.name}-error` : undefined}
    disabled={field.disabled}
    {...register(field.name)}
  />
)
