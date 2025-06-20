import { useState, useCallback } from 'react'

export function useCrud<T extends { id: string }>() {
  const [items, setItems] = useState<T[]>([])
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [idAEliminar, setIdAEliminar] = useState<string | null>(null)

  const add = useCallback((item: T) => setItems((prev) => [...prev, item]), [])

  const update = useCallback(
    (id: string, updated: Partial<T>) =>
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updated } : item))),
    []
  )

  const remove = useCallback(
    (id: string) => {
      // Si estás editando el que vas a eliminar, limpiá el editandoId
      if (editandoId === id) setEditandoId(null)
      setItems((prev) => prev.filter((item) => item.id !== id))
    },
    [editandoId]
  )

  const resetCrud = useCallback(() => {
    setItems([])
    setEditandoId(null)
    setIdAEliminar(null)
  }, [])

  return {
    items,
    editandoId,
    idAEliminar,
    setEditandoId,
    setIdAEliminar,
    add,
    update,
    remove,
    resetCrud
  }
}
