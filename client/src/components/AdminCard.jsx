import React from 'react'
import { ShieldCheckIcon } from 'lucide-react'

const AdminCard = ({ admin }) => {
  const nameInitial = admin?.name?.[0]?.toUpperCase() || 'A'
  const emailInitial = admin?.email?.[0]?.toUpperCase() || 'A'

  return (
    <div className='group relative card card-hover overflow-hidden border border-indigo-200/40'>

      {/* Avatar / Header area */}
      <div className='relative aspect-4/3 w-full overflow-hidden bg-gradient-to-br from-indigo-100 via-purple-100 to-rose-100'>

        <div className='w-full h-full flex items-center justify-center'>
          <div className='w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg'>
            <span className='text-2xl font-semibold text-white'>
              {nameInitial}
            </span>
          </div>
        </div>
      </div>

      {/* Role badge */}
      <div className='absolute top-3 left-3 flex gap-2'>

        <span className='bg-rose-500/90 text-white px-2.5 py-1 text-xs font-semibold rounded-lg shadow-md'>
          {admin.userId?.role || 'ROLE'}
        </span>
      </div>

      {/* Highlight glow effect on hover */}
      <div className='absolute inset-0 bg-gradient-to-t from-indigo-600/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity' />

      {/* Content */}
      <div className='p-5 relative'>
        <div className='flex items-center gap-2'>
          <h3 className='text-slate-900 font-semibold'>
            {admin.name}
          </h3>

          <ShieldCheckIcon className='w-4 h-4 text-indigo-600' />
        </div>

        <p className='text-xs text-slate-500 mt-1'>
          {admin.email}
        </p>

        <div className='mt-3 inline-flex items-center gap-2'>
          <span className='text-xs px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 font-medium'>
            {admin.userId?.role || 'ADMIN'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default AdminCard