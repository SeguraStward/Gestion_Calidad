'use client'

import { TabsContent } from '@una-gc/ui/components/tabs'

interface Props {
  value: string
  loading: boolean
  children: React.ReactNode
  SkeletonCrud: React.FC
}

export function CrudTabPanel({ value, loading, children, SkeletonCrud }: Props) {
  return <TabsContent value={value}>{loading ? <SkeletonCrud /> : children}</TabsContent>
}
