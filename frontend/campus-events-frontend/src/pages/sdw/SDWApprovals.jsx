import { useEffect, useState } from "react";
import api from "../../api/axios";
import DashboardLayout   from "../../layouts/DashboardLayout";
import PageHeader        from "../../components/PageHeader";
import ApprovalModal     from "../../components/ApprovalModal";
import EventDetailDrawer from "../../components/EventDetailDrawer";
import WorkflowBadge     from "../../components/WorkflowBadge";
import { safeArray, getStatus, formatDateTime, filterForSDW } from "../../utils";
import { Eye, CheckCircle, Info, IndianRupee } from "lucide-react";

const TABS = [
  { key:"PENDING_SDW", label:"Pending Review"   },
  { key:"PENDING_HOD", label:"Approved → At HoD"},
  { key:"APPROVED",    label:"Live Events"       },
  { key:"REJECTED",    label:"Rejected"          },
];

export default function SDWApprovals({ onLogout }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const [events,    setEvents]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [tab,       setTab]       = useState("PENDING_SDW");
  const [modal,     setModal]     = useState(null);
  const [drawer,    setDrawer]    = useState(null);
  const [actioning, setActioning] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get("/events")
      .then(r => {
        const all     = safeArray(r.data);
        const visible = filterForSDW(all, user.department);
        setEvents(visible);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = events.filter(e => getStatus(e) === tab);
  const count    = k => events.filter(e => getStatus(e) === k).length;

  const handleAction = async ({ action, comment }) => {
    setActioning(true);
    try {
      const res = await api.post(`/events/${modal.id}/sdw-review`, { action, comment });
      setEvents(prev => prev.map(e => e.id === modal.id ? res.data : e));
      setModal(null);
    } catch (err) { alert(err.response?.data || "Action failed."); }
    finally { setActioning(false); }
  };

  return (
    <DashboardLayout onLogout={onLogout}>
      <PageHeader title="Event & Budget Review"
        subtitle={user.department ? `${user.department} dept` : "SDW Dean — all departments"} />

      {user.department && (
        <div className="glass-card p-3 mb-6 flex items-start gap-3 max-w-3xl border-amber-100 bg-amber-50/50">
          <Info size={15} className="text-amber-500 mt-0.5 shrink-0"/>
          <p className="text-xs text-amber-700">
            You see only <strong>{user.department}</strong> dept events.
            Central events (NSS etc.) are handled by the SDW Dean.
          </p>
        </div>
      )}

      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all
              ${tab === key
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg"
                : "bg-white border border-slate-200 text-slate-600 hover:border-amber-300"}`}>
            {label}
            {count(key) > 0 && (
              <span className={`px-2 py-0.5 rounded-lg text-xs font-bold
                ${tab === key ? "bg-white/25 text-white" : "bg-slate-100 text-slate-600"}`}>
                {count(key)}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3 max-w-3xl">{[1,2,3].map(i => <div key={i} className="skeleton h-28 rounded-2xl"/>)}</div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center max-w-3xl">
          <p className="text-slate-400 text-sm">No events in this category.</p>
        </div>
      ) : (
        <div className="space-y-4 max-w-3xl">
          {filtered.map((ev, i) => (
            <div key={ev.id} style={{ animationDelay:`${i*50}ms` }}
              className="glass-card p-5 animate-[fadeSlideUp_0.3s_ease_both]">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-bold text-slate-800">{ev.title}</h3>
                    {ev.department && <span className="badge badge-blue">{ev.department}</span>}
                    {ev.clubName   && <span className="badge badge-violet">{ev.clubName}</span>}
                  </div>
                  <p className="text-xs text-slate-400">{ev.organizer?.name} · {formatDateTime(ev.startDate || ev.eventDate)}</p>
                  {ev.estimatedBudget ? (
                    <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl text-xs">
                      <span className="font-semibold text-emerald-700 flex items-center gap-1">
                        <IndianRupee size={11}/>Budget: ₹{ev.estimatedBudget.toLocaleString("en-IN")}
                      </span>
                      {ev.budgetNotes && <p className="text-slate-500 mt-0.5 truncate">{ev.budgetNotes}</p>}
                    </div>
                  ) : (
                    <p className="text-xs text-amber-500 mt-1.5">⚠ No budget submitted yet</p>
                  )}
                  {ev.facultyComment && (
                    <div className="mt-2 bg-blue-50 border border-blue-100 rounded-xl p-2.5 text-xs text-slate-600">
                      🏫 Faculty comment: {ev.facultyComment}
                    </div>
                  )}
                  {ev.sdwComment && tab !== "PENDING_SDW" && (
                    <div className="mt-2 bg-slate-50 rounded-xl p-2.5 text-xs text-slate-500">
                      💬 Your comment: {ev.sdwComment}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 shrink-0 items-end">
                  <div onClick={() => setDrawer(ev)}
                    className="btn-outline text-xs px-3 py-1.5 flex items-center gap-1 cursor-pointer select-none">
                    <Eye size={13}/> View
                  </div>
                  {tab === "PENDING_SDW" && (
                    <div onClick={() => setModal(ev)}
                      className="btn text-xs px-3 py-1.5 flex items-center gap-1 cursor-pointer select-none">
                      <CheckCircle size={13}/> Review
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100">
                <WorkflowBadge status={getStatus(ev)}/>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && <ApprovalModal eventTitle={modal.title} onClose={() => setModal(null)} onSubmit={handleAction} loading={actioning}/>}
      {drawer && <EventDetailDrawer event={drawer} onClose={() => setDrawer(null)} showBudget={true}/>}
    </DashboardLayout>
  );
}