import { Input } from '@una-gc/ui/components/input'

interface FilterBarProps {
  value: string
  onChange: (value: string) => void
}

export const FilterBar = ({ value, onChange }: FilterBarProps) => (
  <div className="mb-4">
    <Input type="text" placeholder="Buscar por..." value={value} onChange={(e) => onChange(e.target.value)} />
  </div>
)
