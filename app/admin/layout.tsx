export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Auth is handled by middleware.ts
  // /admin = public login page
  // /admin/dashboard/* now redirects away and no longer serves dashboard UI
  return <>{children}</>
}
