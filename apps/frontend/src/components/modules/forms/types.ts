// filepath: c:\Users\juanc\Documents\GitHub\gestion-calidad\apps\frontend\src\shared\components\form\types.ts

export interface FormFieldBase {
  name: string
  label: string
  required: boolean
  hidden?: boolean
  disabled?: boolean
  description?: string
  condition?: (formData: Record<string, any>) => boolean // Conditional display
  validate?: (value: any, formData: Record<string, any>) => string | true // Custom validation
}

export interface TextFieldProps extends FormFieldBase {
  type: 'text' | 'email' | 'number' | 'date' | 'password'
  placeholder?: string
  min?: number
  max?: number
}

export interface TextareaFieldProps extends FormFieldBase {
  type: 'textarea'
  placeholder?: string
  rows?: number
}

export interface CheckboxFieldProps extends FormFieldBase {
  type: 'checkbox'
}

export interface SelectFieldProps extends FormFieldBase {
  type: 'select'
  options: Array<{ id: string; name: string }>
  placeholder?: string
  isMulti?: boolean
}

export interface RelationFieldProps extends FormFieldBase {
  type: 'relation'
  entityType: string // User, Comision, etc.
  displayField: string // Field to display (e.g., "fullName")
  valueField?: string // Field to use as value (default: "id")
  fetchOptions: () => Promise<Array<Record<string, any>>>
  isMulti?: boolean
}

export interface FileFieldProps extends FormFieldBase {
  type: 'file'
  accept?: string // e.g., ".pdf,.docx,image/*"
  maxSize?: number // in bytes
  isMulti?: boolean
}

export type FormField =
  | TextFieldProps
  | TextareaFieldProps
  | CheckboxFieldProps
  | SelectFieldProps
  | RelationFieldProps
  | FileFieldProps

export interface DynamicFormProps {
  fields: FormField[]
  onSubmit: (data: Record<string, any>) => Promise<void> | void
  onCancel?: () => void
  submitText?: string
  cancelText?: string
  className?: string
  initialValues?: Record<string, any>
  isLoading?: boolean
}
