export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Auth is handled by middleware.ts
  // /admin = public login page
  // /admin/dashboard/* = protected (middleware checks admin role)
  return <>{children}</>
}
