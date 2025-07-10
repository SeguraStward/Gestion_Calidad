import { Button, Input } from '@una-gc/ui/components'
import * as React from 'react'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export const Pagination: React.FC<PaginationProps> = ({ page, totalPages, onPageChange, className }) => {
  const [inputValue, setInputValue] = React.useState(page.toString())

  React.useEffect(() => {
    setInputValue(page.toString())
  }, [page])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '')
    setInputValue(value)
  }

  const handleInputBlur = () => {
    let newPage = Number(inputValue)
    if (isNaN(newPage) || newPage < 1) newPage = 1
    if (newPage > totalPages) newPage = totalPages
    if (newPage !== page) {
      onPageChange(newPage)
    } else {
      setInputValue(page.toString())
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputBlur()
    }
  }

  return (
    <div className={`flex items-center gap-2 ${className ?? ''}`}>
      <Button variant="outline" size="sm" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
        Anterior
      </Button>
      <span>Página</span>
      <Input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        className="w-14 h-8 px-2 py-1 text-center"
      />
      <span>de {totalPages}</span>
      <Button variant="outline" size="sm" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
        Siguiente
      </Button>
    </div>
  )
}
