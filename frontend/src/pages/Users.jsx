import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CheckCircle2,
  Coins,
  Download,
  Search,
  UserCheck,
  UserRound,
  UserX,
  XCircle,
} from 'lucide-react'
import api from '../api/axios'

function formatDate(dateString) {
  if (!dateString) return 'N/A'

  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function getInitials(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function colorFromName(name) {
  const palette = ['#355872', '#9CD5FF', '#7AAACE', '#9CD5FF', '#355872', '#7AAACE']
  const code = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return palette[code % palette.length]
}

export default function Users() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    admins: 0,
    credits_total: 0,
  })
  const [selectedUser, setSelectedUser] = useState(null)
  const [showCreditModal, setShowCreditModal] = useState(false)
  const [creditsToAdd, setCreditsToAdd] = useState(0)
  const [loading, setLoading] = useState(true)
  const [actionUserId, setActionUserId] = useState(null)
  const [error, setError] = useState('')

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const { data } = await api.get('/admin/users', {
        params: {
          search: searchTerm,
          status: statusFilter.toLowerCase(),
        },
      })

      setUsers(data.users)
      setStats(data.stats)
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Unable to load user management data right now.',
      )
    } finally {
      setLoading(false)
    }
  }, [searchTerm, statusFilter])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      fetchUsers()
    }, 250)

    return () => window.clearTimeout(timeoutId)
  }, [fetchUsers])

  const cards = useMemo(
    () => [
      {
        title: 'Total Users',
        value: stats.total,
        subtitle: 'All registered accounts',
        icon: UserRound,
      },
      {
        title: 'Active Users',
        value: stats.active,
        subtitle: 'Can access their accounts',
        icon: UserCheck,
      },
      {
        title: 'Inactive Users',
        value: stats.inactive,
        subtitle: 'Currently deactivated',
        icon: UserX,
      },
      {
        title: 'Admin Users',
        value: stats.admins,
        subtitle: 'Protected admin accounts',
        icon: UserCheck,
      },
      {
        title: 'Credits Issued',
        value: stats.credits_total.toLocaleString(),
        subtitle: 'Across all users',
        icon: Coins,
      },
    ],
    [stats],
  )

  const updateUser = async (userId, payload) => {
    setActionUserId(userId)
    setError('')

    try {
      const { data } = await api.patch(`/admin/users/${userId}`, payload)

      setUsers((currentUsers) => {
        const nextUsers = currentUsers.map((user) => (user.id === userId ? data.user : user))

        setStats({
          total: nextUsers.length,
          active: nextUsers.filter((user) => user.is_active).length,
          inactive: nextUsers.filter((user) => !user.is_active).length,
          admins: nextUsers.filter((user) => user.role === 'admin').length,
          credits_total: nextUsers.reduce((sum, user) => sum + user.credits, 0),
        })

        return nextUsers
      })

      return data.user
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Unable to update the selected user right now.',
      )
      return null
    } finally {
      setActionUserId(null)
    }
  }

  const handleToggleActive = async (user) => {
    await updateUser(user.id, {
      is_active: !user.is_active,
    })
  }

  const handleAddCredits = async () => {
    if (!selectedUser || creditsToAdd <= 0) return

    const updatedUser = await updateUser(selectedUser.id, {
      credits_delta: creditsToAdd,
    })

    if (updatedUser) {
      setSelectedUser(updatedUser)
      setShowCreditModal(false)
      setCreditsToAdd(0)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F8F0]">
      <div className="flex h-[82px] items-center justify-between border-b border-[#9CD5FF] bg-[#F7F8F0] px-6">
        <div>
          <h1 className="text-[30px] font-bold leading-none text-[#355872]">
            User Management
          </h1>
          <p className="mt-2 text-[13px] text-[#7AAACE]">
            Search users, add credits, and activate or deactivate accounts
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="flex h-11 items-center gap-2 rounded-xl bg-[#355872] px-5 text-sm font-medium text-white shadow-[0_6px_16px_rgba(53,88,114,0.22)]"
        >
          <Download size={15} />
          Refresh
        </button>
      </div>

      <div className="p-6">
        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {cards.map((card) => (
            <div
              key={card.title}
              className="rounded-[20px] border border-[#9CD5FF] bg-[#F7F8F0] p-5 shadow-[0_8px_24px_rgba(53,88,114,0.08)]"
            >
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-[#F7F8F0] text-[#7AAACE]">
                <card.icon size={17} />
              </div>

              <h3 className="text-[22px] font-bold leading-none text-[#355872]">
                {card.value}
              </h3>
              <p className="mt-3 text-[14px] text-[#355872]">{card.title}</p>
              <p className="mt-1 text-[12px] text-[#7AAACE]">{card.subtitle}</p>
            </div>
          ))}
        </div>

        <div className="mb-5 rounded-[22px] border border-[#9CD5FF] bg-[#F7F8F0] p-4 shadow-[0_8px_24px_rgba(53,88,114,0.08)]">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative w-full max-w-[420px]">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7AAACE]"
                  size={17}
                />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-[#9CD5FF] bg-[#F7F8F0] pl-11 pr-4 text-sm text-[#355872] outline-none placeholder:text-[#7AAACE]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[12px] font-semibold text-[#355872]">Status:</span>
                {['All', 'Active', 'Inactive'].map((item) => (
                  <button
                    key={item}
                    onClick={() => setStatusFilter(item)}
                    className={`h-10 rounded-full border px-4 text-xs transition ${
                      statusFilter === item
                        ? 'border-[#355872] bg-[#355872] text-white'
                        : 'border-[#9CD5FF] bg-[#F7F8F0] text-[#355872]'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[22px] border border-[#9CD5FF] bg-[#F7F8F0] shadow-[0_8px_24px_rgba(53,88,114,0.08)]">
          <div className="border-b border-[#9CD5FF] px-6 py-5">
            <h2 className="text-[28px] font-bold leading-none text-[#355872]">All Users</h2>
            <p className="mt-2 text-[13px] text-[#7AAACE]">{users.length} users found</p>
            {error && (
              <div className="mt-4 rounded-2xl border border-[#9CD5FF] bg-[#F7F8F0] px-4 py-3 text-sm text-[#355872]">
                {error}
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px]">
              <thead className="bg-[#F7F8F0]">
                <tr className="border-b border-[#9CD5FF] text-left text-[12px] uppercase tracking-[0.08em] text-[#355872]">
                  <th className="px-3 py-4">User</th>
                  <th className="px-3 py-4">Email</th>
                  <th className="px-3 py-4">Credits</th>
                  <th className="px-3 py-4">Projects</th>
                  <th className="px-3 py-4">Registered</th>
                  <th className="px-3 py-4">Role</th>
                  <th className="px-3 py-4">Status</th>
                  <th className="px-3 py-4 text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-10 text-center text-sm text-[#355872]">
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-10 text-center text-sm text-[#355872]">
                      No users matched your current filters.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-[#9CD5FF] transition last:border-b-0 hover:bg-[#F7F8F0]/60"
                    >
                      <td className="px-3 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                            style={{ backgroundColor: colorFromName(user.name) }}
                          >
                            {getInitials(user.name)}
                          </div>

                          <div>
                            <p className="font-semibold leading-none text-[#355872]">
                              {user.name}
                            </p>
                            <p className="mt-2 text-[12px] text-[#7AAACE]">
                              User ID #{user.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-4 text-[13px] text-[#7AAACE]">{user.email}</td>

                      <td className="px-3 py-4">
                        <button
                          onClick={() => {
                            setSelectedUser(user)
                            setShowCreditModal(true)
                          }}
                          className="inline-flex items-center gap-2 font-semibold text-[#355872]"
                          title="Add Credits"
                        >
                          <Coins size={14} className="text-[#7AAACE]" />
                          {user.credits.toLocaleString()}
                        </button>
                      </td>

                      <td className="px-3 py-4 font-semibold text-[#355872]">
                        {user.projects_count}
                      </td>

                      <td className="px-3 py-4 text-[13px] text-[#7AAACE]">
                        {formatDate(user.registration_date)}
                      </td>

                      <td className="px-3 py-4">
                        <span className="rounded-full bg-[#F7F8F0] px-3 py-1.5 text-xs font-medium capitalize text-[#7AAACE]">
                          {user.role}
                        </span>
                      </td>

                      <td className="px-3 py-4">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${
                            user.is_active
                              ? 'bg-[#9CD5FF] text-[#355872]'
                              : 'bg-[#F7F8F0] text-[#7AAACE]'
                          }`}
                        >
                          <span className="h-2 w-2 rounded-full bg-current opacity-70" />
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      <td className="px-3 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleToggleActive(user)}
                            disabled={actionUserId === user.id}
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#9CD5FF] bg-[#F7F8F0] text-[#355872] disabled:opacity-50"
                            title={user.is_active ? 'Deactivate' : 'Activate'}
                          >
                            {user.is_active ? <XCircle size={15} /> : <CheckCircle2 size={15} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showCreditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-md rounded-[24px] border border-[#9CD5FF] bg-[#F7F8F0] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.15)]">
            <h2 className="mb-4 text-[24px] font-bold text-[#355872]">Add Credits</h2>

            <div className="mb-5 space-y-3 text-sm">
              <p className="text-[#7AAACE]">
                User:{' '}
                <span className="font-semibold text-[#355872]">{selectedUser?.name}</span>
              </p>
              <p className="text-[#7AAACE]">
                Current Credits:{' '}
                <span className="font-semibold text-[#355872]">
                  {selectedUser?.credits?.toLocaleString()}
                </span>
              </p>
            </div>

            <input
              type="number"
              min="1"
              value={creditsToAdd}
              onChange={(e) => setCreditsToAdd(Number.parseInt(e.target.value, 10) || 0)}
              placeholder="Enter credits amount"
              className="mb-5 h-12 w-full rounded-2xl border border-[#9CD5FF] bg-[#F7F8F0] px-4 text-sm text-[#355872] outline-none placeholder:text-[#7AAACE]"
            />

            <div className="flex gap-3">
              <button
                onClick={handleAddCredits}
                className="h-11 flex-1 rounded-xl bg-[#355872] font-medium text-white"
              >
                Add Credits
              </button>
              <button
                onClick={() => {
                  setShowCreditModal(false)
                  setCreditsToAdd(0)
                }}
                className="h-11 flex-1 rounded-xl border border-[#9CD5FF] bg-[#F7F8F0] font-medium text-[#355872]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
