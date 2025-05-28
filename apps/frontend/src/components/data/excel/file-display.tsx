import React from 'react'
import { FileSpreadsheet } from 'lucide-react'

interface FileDisplayProps {
  fileInfo: { name: string; size: string } | null
}

const FileDisplay = React.memo(({ fileInfo }: FileDisplayProps) => {
  if (!fileInfo) return null

  return (
    <div className="text-sm text-muted-foreground flex items-center mt-1">
      <FileSpreadsheet className="h-4 w-4 mr-1" />
      {fileInfo.name} ({fileInfo.size})
    </div>
  )
})
FileDisplay.displayName = 'FileDisplay'

export default FileDisplay
