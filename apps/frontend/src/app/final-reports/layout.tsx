export default function FinalReportsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="">
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  )
}
