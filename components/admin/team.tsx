"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getAdminUsers, createAdminUser, inviteAdminUser, setAdminUserStatus, sendAdminUserReset, type AdminUser } from "@/lib/admin-api"
import { cn } from "@/lib/utils"
import { Loader2, AlertCircle, UserPlus, Mail, Shield, ShieldAlert, RotateCcw, Check, Users } from "lucide-react"

export function AdminTeam() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  /* create form */
  const [createName, setCreateName] = useState("")
  const [createEmail, setCreateEmail] = useState("")
  const [createPassword, setCreatePassword] = useState("")
  const [createRole, setCreateRole] = useState<"admin" | "viewer">("admin")
  const [creating, setCreating] = useState(false)
  const [createMsg, setCreateMsg] = useState("")

  /* invite form */
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviting, setInviting] = useState(false)
  const [inviteMsg, setInviteMsg] = useState("")

  async function fetchUsers() {
    setLoading(true)
    try { const res = await getAdminUsers(); setUsers(Array.isArray(res) ? res : res.admins || []) }
    catch (e: unknown) { setError((e as Error).message) }
    finally { setLoading(false) }
  }
  useEffect(() => { fetchUsers() }, [])

  async function handleCreate() {
    if (!createName || !createEmail || !createPassword) return
    setCreating(true); setCreateMsg("")
    try {
      await createAdminUser({ name: createName, email: createEmail, password: createPassword, role: createRole })
      setCreateMsg("Admin created"); setCreateName(""); setCreateEmail(""); setCreatePassword(""); fetchUsers()
    } catch (e: unknown) { setCreateMsg("Error: " + (e as Error).message) }
    finally { setCreating(false) }
  }

  async function handleInvite() {
    if (!inviteEmail) return
    setInviting(true); setInviteMsg("")
    try { await inviteAdminUser(inviteEmail); setInviteMsg("Invitation sent"); setInviteEmail("") }
    catch (e: unknown) { setInviteMsg("Error: " + (e as Error).message) }
    finally { setInviting(false) }
  }

  async function toggleStatus(u: AdminUser) {
    const next = u.is_active ? "inactive" : "active"
    if (!confirm(`${u.is_active ? "Deactivate" : "Activate"} ${u.email}?`)) return
    try { await setAdminUserStatus(u.id, next); fetchUsers() }
    catch (e: unknown) { alert("Error: " + (e as Error).message) }
  }

  async function resetPassword(u: AdminUser) {
    if (!confirm(`Send password reset email to ${u.email}?`)) return
    try { await sendAdminUserReset(u.id); alert("Reset email sent to " + u.email) }
    catch (e: unknown) { alert("Error: " + (e as Error).message) }
  }

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin text-slate-500" /></div>

  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-xl font-bold text-white">Team Management</h1><p className="text-sm text-slate-400 mt-1">Manage admin accounts & access</p></div>

      {error && <div className="flex items-center gap-2 text-red-400 text-sm"><AlertCircle className="w-4 h-4" />{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* create */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-2 mb-4"><UserPlus className="w-4 h-4 text-indigo-400" /><h3 className="text-sm font-semibold text-white">Add Team Login</h3></div>
          <div className="space-y-3">
            <div><Label className="text-xs text-slate-400 mb-1.5 block">Name</Label><Input value={createName} onChange={(e) => setCreateName(e.target.value)} placeholder="Full name" className="bg-white/5 border-white/10 text-white" /></div>
            <div><Label className="text-xs text-slate-400 mb-1.5 block">Email</Label><Input type="email" value={createEmail} onChange={(e) => setCreateEmail(e.target.value)} placeholder="email@example.com" className="bg-white/5 border-white/10 text-white" /></div>
            <div><Label className="text-xs text-slate-400 mb-1.5 block">Password</Label><Input type="password" value={createPassword} onChange={(e) => setCreatePassword(e.target.value)} placeholder="Secure password" className="bg-white/5 border-white/10 text-white" /></div>
            <div>
              <Label className="text-xs text-slate-400 mb-1.5 block">Role</Label>
              <div className="flex gap-2">
                {(["admin", "viewer"] as const).map((r) => (
                  <button key={r} type="button" onClick={() => setCreateRole(r)} className={cn("flex-1 h-9 rounded-lg text-sm font-medium border transition-colors", createRole === r ? "border-indigo-500 bg-indigo-500/10 text-white" : "border-white/10 text-slate-400 hover:border-white/30")}>{r === "admin" ? "Admin" : "Viewer"}</button>
                ))}
              </div>
            </div>
            <button onClick={handleCreate} disabled={creating || !createName || !createEmail || !createPassword} className="w-full flex items-center justify-center gap-2 h-9 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 disabled:opacity-50 transition-colors">{creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}Create Login</button>
            {createMsg && <p className={cn("text-xs", createMsg.startsWith("Error") ? "text-red-400" : "text-emerald-400")}>{createMsg}</p>}
          </div>
        </div>

        {/* invite */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-2 mb-4"><Mail className="w-4 h-4 text-cyan-400" /><h3 className="text-sm font-semibold text-white">Invite Team Member</h3></div>
          <p className="text-xs text-slate-400 mb-4">Send an invitation link via email. The recipient will set their own password.</p>
          <div className="space-y-3">
            <div><Label className="text-xs text-slate-400 mb-1.5 block">Email Address</Label><Input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="colleague@example.com" className="bg-white/5 border-white/10 text-white" /></div>
            <button onClick={handleInvite} disabled={inviting || !inviteEmail} className="w-full flex items-center justify-center gap-2 h-9 rounded-lg bg-cyan-600 text-white text-sm font-medium hover:bg-cyan-500 disabled:opacity-50 transition-colors">{inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}Send Invitation</button>
            {inviteMsg && <p className={cn("text-xs", inviteMsg.startsWith("Error") ? "text-red-400" : "text-emerald-400")}>{inviteMsg}</p>}
          </div>
        </div>

        {/* current admins */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-5 lg:row-span-2">
          <div className="flex items-center gap-2 mb-4"><Users className="w-4 h-4 text-emerald-400" /><h3 className="text-sm font-semibold text-white">Current Admin Logins</h3></div>
          {users.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">No admin users found.</p>
          ) : (
            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {users.map((u) => (
                <div key={u.id} className={cn("rounded-lg border border-white/10 p-3", !u.is_active && "opacity-60")}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{u.name || "—"}</p>
                      <p className="text-xs text-slate-400 truncate">{u.email}</p>
                    </div>
                    <Badge variant={u.is_active ? "default" : "secondary"} className={cn("text-[10px] shrink-0", u.is_active && "bg-emerald-500/80")}>{u.is_active ? "Active" : "Inactive"}</Badge>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
                    {u.role === "admin" ? <Shield className="w-3.5 h-3.5 text-indigo-400" /> : <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />}
                    <span className="capitalize">{u.role}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleStatus(u)} className={cn("flex-1 h-7 rounded-md text-xs font-medium transition-colors", u.is_active ? "bg-red-500/10 text-red-400 hover:bg-red-500/20" : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20")}>{u.is_active ? "Deactivate" : "Activate"}</button>
                    <button onClick={() => resetPassword(u)} title="Send password reset" className="h-7 px-2 rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition-colors"><RotateCcw className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
