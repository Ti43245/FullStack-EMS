import { useState, useEffect } from "react"
import api from "../api/axios";
import AdminCard from "../components/AdminCard";
import { Search } from "lucide-react"

export default function Admins() {
    const [admins, setAdmins] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")

    const fetchAdmins = async ()=>{
        try {
            const res = await api.get("/admins")
           
            setAdmins(res.data)
            
        } catch (error) {
            console.error("Failed to fetch employees");
        }finally{
            setLoading(false)
        }
    }

    useEffect(()=>{
        fetchAdmins();
    }, [])

/*     useEffect(() => {
        if(admins) console.log('Total Admins Fetched: ', admins[0])
    }, [admins]) */

    const filtered = admins.filter((admin) =>
        `${admin.name} ${admin.email} ${admin.userId?.role}`
        .toLowerCase()
        .includes(search.toLowerCase())
    )

return (
    <div className="animate-fade-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="page-title">Admins</h1>
          <p className="page-subtitle">Manage system administrators</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            placeholder="Search admins..."
            className="w-full pl-10!"
            onChange={(e) => setSearch(e.target.value)}
            value={search}
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">

          {filtered.length === 0 ? (
            <p className="col-span-full text-center py-16 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
              No admins found
            </p>
          ) : (
            filtered.map((admin) => (
              <AdminCard key={admin._id} admin={admin} />
            ))
          )}

        </div>
      )}
    </div>
  )
}
