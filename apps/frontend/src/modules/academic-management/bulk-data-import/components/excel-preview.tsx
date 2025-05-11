interface ExcelPreviewProps {
  data: any[][]
}

export const ExcelPreview = ({ data }: ExcelPreviewProps) => {
  if (!data || data.length === 0 || !Array.isArray(data[0])) return <p>No se han cargado datos para previsualizar.</p>

  const headers = data[0]
  const rows = data.slice(1, 6) // Solo mostrar las primeras 5 filas por ahora

  if (rows.length === 0) {
    return (
      <div className="mt-4 border rounded p-4 bg-muted text-sm">
        <p>No hay suficientes datos para mostrar una vista previa. Asegúrate de que el archivo tenga contenido válido.</p>
      </div>
    )
  }

  return (
    <div className="mt-4 border rounded p-4 bg-muted text-sm overflow-x-auto">
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr>
            {headers.map((cell, idx) => (
              <th key={idx} className="border px-2 py-1">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, idx) => (
                <td key={idx} className="border px-2 py-1">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
