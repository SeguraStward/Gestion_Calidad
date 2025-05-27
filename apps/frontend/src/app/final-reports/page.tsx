'use client'

import { useState, useMemo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@una-gc/ui/components/button'
import { MoreHorizontal, FileDown, Edit, Trash2, PlusCircle } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@una-gc/ui/components/dropdown-menu'
import { DataTable } from '@/app/(components)/ui/data-table' // Ajusta la ruta si es necesario
import Link from 'next/link' // Importar Link

// Definimos el tipo para un informe final
interface InformeFinal {
  id: string
  nrc: string
  nombreProfesor: string
  nombreAsignatura: string
  codigoAsignatura: string
  ciclo: string
  fechaCreacion: string
  estado: 'Borrador' | 'Enviado para revisión' | 'Con observaciones' | 'Aprobado'
}

// Datos mock para la tabla
const mockInformes: InformeFinal[] = [
  {
    id: '1',
    nrc: '10234',
    nombreProfesor: 'Dr. Alan Turing',
    nombreAsignatura: 'Introducción a la Computación',
    codigoAsignatura: 'CS101',
    ciclo: '2024-01',
    fechaCreacion: '2024-05-10',
    estado: 'Aprobado'
  },
  {
    id: '2',
    nrc: '10235',
    nombreProfesor: 'Dra. Ada Lovelace',
    nombreAsignatura: 'Algoritmos Avanzados',
    codigoAsignatura: 'CS305',
    ciclo: '2024-01',
    fechaCreacion: '2024-05-15',
    estado: 'Enviado para revisión'
  },
  {
    id: '3',
    nrc: '10236',
    nombreProfesor: 'MSc. Grace Hopper',
    nombreAsignatura: 'Sistemas Operativos',
    codigoAsignatura: 'CS210',
    ciclo: '2024-01',
    fechaCreacion: '2024-05-20',
    estado: 'Borrador'
  },
  {
    id: '4',
    nrc: '10237',
    nombreProfesor: 'Dr. Charles Babbage',
    nombreAsignatura: 'Arquitectura de Computadoras',
    codigoAsignatura: 'CS220',
    ciclo: '2024-02',
    fechaCreacion: '2024-11-05',
    estado: 'Con observaciones'
  },
  {
    id: '5',
    nrc: '10238',
    nombreProfesor: 'Dr. Edsger Dijkstra',
    nombreAsignatura: 'Estructuras de Datos',
    codigoAsignatura: 'CS202',
    ciclo: '2024-01',
    fechaCreacion: '2024-05-12',
    estado: 'Aprobado'
  },
  {
    id: '6',
    nrc: '10239',
    nombreProfesor: 'Dr. Donald Knuth',
    nombreAsignatura: 'Análisis de Algoritmos',
    codigoAsignatura: 'CS401',
    ciclo: '2024-01',
    fechaCreacion: '2024-05-18',
    estado: 'Enviado para revisión'
  },
  {
    id: '7',
    nrc: '10240',
    nombreProfesor: 'Dr. Tim Berners-Lee',
    nombreAsignatura: 'Desarrollo Web',
    codigoAsignatura: 'CS310',
    ciclo: '2024-02',
    fechaCreacion: '2024-11-10',
    estado: 'Borrador'
  },
  {
    id: '8',
    nrc: '10241',
    nombreProfesor: 'Dr. Vint Cerf',
    nombreAsignatura: 'Redes de Computadoras',
    codigoAsignatura: 'CS320',
    ciclo: '2024-02',
    fechaCreacion: '2024-11-15',
    estado: 'Aprobado'
  },
  {
    id: '9',
    nrc: '10242',
    nombreProfesor: 'Dr. Radia Perlman',
    nombreAsignatura: 'Seguridad Informática',
    codigoAsignatura: 'CS450',
    ciclo: '2024-01',
    fechaCreacion: '2024-05-22',
    estado: 'Con observaciones'
  },
  {
    id: '10',
    nrc: '10243',
    nombreProfesor: 'Dr. John McCarthy',
    nombreAsignatura: 'Inteligencia Artificial',
    codigoAsignatura: 'CS501',
    ciclo: '2024-01',
    fechaCreacion: '2024-05-25',
    estado: 'Enviado para revisión'
  },
  {
    id: '11',
    nrc: '10244',
    nombreProfesor: 'Dr. Linus Torvalds',
    nombreAsignatura: 'Sistemas Distribuidos',
    codigoAsignatura: 'CS510',
    ciclo: '2024-02',
    fechaCreacion: '2024-11-20',
    estado: 'Borrador'
  }
]

export default function FinalReportsPage() {
  const [informesData, setInformesData] = useState<InformeFinal[]>(mockInformes)

  const handleEdit = (id: string) => {
    router.push(`/final-reports/edit/${id}`)
  }

  const handleDelete = (id: string) => {
    console.log('Eliminar informe:', id)
    setInformesData((prev) => prev.filter((informe) => informe.id !== id))
  }

  const handleDownloadPdf = (id: string) => {
    console.log('Descargar PDF del informe:', id)
  }

  const columns = useMemo<ColumnDef<InformeFinal, any>[]>( // TValue can be 'any' for simplicity here
    () => [
      { accessorKey: 'nrc', header: 'NRC', size: 100 },
      {
        accessorKey: 'nombreAsignatura',
        header: 'Asignatura',
        cell: ({ row }) => `${row.original.nombreAsignatura} (${row.original.codigoAsignatura})`
      },
      { accessorKey: 'nombreProfesor', header: 'Profesor' },
      { accessorKey: 'ciclo', header: 'Ciclo' },
      { accessorKey: 'fechaCreacion', header: 'Fecha Creación' },
      {
        accessorKey: 'estado',
        header: 'Estado',
        cell: ({ row }) => (
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full ${
              row.original.estado === 'Aprobado'
                ? 'bg-green-100 text-green-800'
                : row.original.estado === 'Enviado para revisión'
                  ? 'bg-blue-100 text-blue-800'
                  : row.original.estado === 'Con observaciones'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
            }`}
          >
            {row.original.estado}
          </span>
        )
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Acciones</div>,
        size: 80,
        cell: ({ row }) => (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Abrir menú</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEdit(row.original.id)
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDownloadPdf(row.original.id)
                  }}
                >
                  <FileDown className="mr-2 h-4 w-4" />
                  Ver PDF
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(row.original.id)
                  }}
                  className="text-red-600 hover:!text-red-600 hover:!bg-red-100"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [] // handleDelete, handleEdit, handleDownloadPdf should be stable or included if they change
  )

  const newReportButton = (
    <Button asChild>
      <Link href="/final-reports/new">
        <PlusCircle className="mr-2 h-4 w-4" /> Nuevo Informe Final
      </Link>
    </Button>
  )

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Informes Finales</h1>
        {/* El botón de nuevo ahora se pasa al DataTable */}
      </div>

      <DataTable
        columns={columns}
        data={informesData}
        searchPlaceholder="Buscar por NRC, profesor, asignatura..."
        newButton={newReportButton}
        initialPageSize={5}
        // Opcional: si quieres hacer algo cuando se hace clic en una fila
        // onRowClick={(row) => console.log('Fila clickeada:', row.original)}
      />
    </div>
  )
}
