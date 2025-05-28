'use client'

interface ExcelPreviewProps {
  data: any[][]
}

export const ExcelPreview = ({ data }: ExcelPreviewProps) => {
  if (!data || data.length === 0 || !Array.isArray(data[0])) {
    return <p className="text-center text-gray-600 dark:text-gray-400 mt-4">No se han cargado datos para previsualizar.</p>
  }

  const rows = data.slice(0, 6) // 1 fila para header + 5 filas de contenido
  const header = rows[0] ?? []

  if (rows.length <= 1) {
    return (
      <div className="mt-4 p-4 rounded text-center text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 text-sm">
        No hay suficientes datos para mostrar una vista previa. Asegúrate que el archivo tenga contenido válido.
      </div>
    )
  }

  return (
    <div className="mt-4 overflow-x-auto rounded-lg shadow-md bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700">
      <table className="min-w-full text-sm text-left">
        {header.length > 0 && (
          <thead className="bg-primary/20 dark:bg-primary/30">
            <tr>
              {header.map((cell, idx) => (
                <th
                  key={idx}
                  className="px-4 py-2 border-b border-gray-300 dark:border-gray-700 text-primary dark:text-primary-light font-semibold select-none"
                >
                  {cell || <span className="text-gray-400 italic">—</span>}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {rows.slice(1).map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'}>
              {row.map((cell, idx) => (
                <td
                  key={idx}
                  className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200"
                  title={cell ? String(cell) : ''}
                >
                  {cell || <span className="text-gray-400 italic">—</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 px-4 pb-2 italic select-none">
        Mostrando las primeras {rows.length - 1} filas.
      </p>
    </div>
  )
}
