import FadeInImage from '@/components/loading/FadeInImage'
import AdminPage from '@/components/admin/AdminPage'
import AdminPagination from '@/components/admin/AdminPagination'
import { AdminRoleControl } from '@/components/admin/AdminActions'
import { AdminBadge, AdminEmptyState, AdminErrorState, AdminFilters, AdminPageHeader } from '@/components/admin/AdminUi'
import { cleanSearch, getPageRange, parseAdminPage, totalPages } from '@/lib/admin/query'
import { protectAdminRoute, type UserRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

type SearchParams = Promise<Record<string, string | string[] | undefined>>

export default async function AdminUsersPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const page = parseAdminPage(params.page)
  const search = cleanSearch(params.q)
  const requestedRole = typeof params.role === 'string' ? params.role : ''
  const role = ['user', 'moderator', 'admin'].includes(requestedRole) ? requestedRole : ''
  const { from, to } = getPageRange(page)
  const { user } = await protectAdminRoute()
  const supabase = await createClient()

  let query = supabase.from('user_profiles').select('id, email, display_name, avatar_url, role, created_at', { count: 'exact' })
  if (search) query = query.or(`display_name.ilike.%${search}%,email.ilike.%${search}%`)
  if (role) query = query.eq('role', role)
  const { data, count, error } = await query.order('created_at', { ascending: false }).range(from, to)
  const pages = totalPages(count)

  return (
    <AdminPage>
      <AdminPageHeader title="Users" description="Search accounts and deliberately assign access roles." />
      <AdminFilters search={search} filter={role} filterName="role" filterLabel="Role" options={[{ label: 'All roles', value: '' }, { label: 'Users', value: 'user' }, { label: 'Moderators', value: 'moderator' }, { label: 'Administrators', value: 'admin' }]} />
      {error ? <AdminErrorState /> : !data?.length ? <AdminEmptyState title="No users found" description="Try a different name, email, or role filter." /> : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Person</th><th className="px-5 py-3">Role</th><th className="px-5 py-3">Joined</th><th className="px-5 py-3">Change role</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((profile) => (
                <tr key={profile.id} className="align-top">
                  <td className="px-5 py-4"><div className="flex items-center gap-3">{profile.avatar_url ? <FadeInImage src={profile.avatar_url} alt="" containerClassName="h-10 w-10 shrink-0 rounded-full bg-slate-100" className="h-full w-full object-cover" /> : <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-700">{(profile.display_name || profile.email || '?').charAt(0).toUpperCase()}</span>}<div><p className="font-semibold text-slate-900">{profile.display_name || 'Unnamed user'}</p><p className="text-xs text-slate-500">{profile.email}</p></div></div></td>
                  <td className="px-5 py-4"><AdminBadge tone={profile.role === 'admin' ? 'orange' : profile.role === 'moderator' ? 'blue' : 'slate'}>{profile.role}</AdminBadge></td>
                  <td className="px-5 py-4 text-slate-500">{new Date(profile.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-4"><AdminRoleControl userId={profile.id} currentRole={profile.role as UserRole} isCurrentAdmin={profile.id === user.id} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <AdminPagination page={page} pages={pages} searchParams={{ ...(search ? { q: search } : {}), ...(role ? { role } : {}) }} />
    </AdminPage>
  )
}
