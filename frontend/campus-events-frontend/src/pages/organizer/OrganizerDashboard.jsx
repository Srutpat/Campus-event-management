import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import DashboardLayout   from "../../layouts/DashboardLayout";
import StatCard          from "../../components/StatCard";
import PageHeader        from "../../components/PageHeader";
import WorkflowBadge     from "../../components/WorkflowBadge";
import EventDetailDrawer from "../../components/EventDetailDrawer";
import { STATUS_META }   from "../../constants";
import {
  Calendar, Clock, CheckCircle, PlusCircle,
  ChevronRight, FileText, Trash2, Edit2, IndianRupee
} from "lucide-react";

function eventHasEnded(ev) {
  const endDt = ev.endDate || ev.startDate || ev.eventDate;
  if (!endDt) return false;
  return new Date(endDt) < new Date();
}

function getStatus(ev) {
  return ev.status; // adjust based on your backend
}

export default function OrganizerDashboard({ onLogout }) {
  const user     = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const [events,   setEvents]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    // ✅ Proper useEffect pattern — no async directly
    function load() {
      api.get(`/events/organizer/${user.id}`)
        .then(r => setEvents(Array.isArray(r.data) ? r.data : []))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
    load();
  }, []);

  const deleteEvent = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this event?")) return;
    setDeleting(id);
    try {
      await api.delete(`/events/${id}`);
      setEvents(p => p.filter(ev => ev.id !== id));
    } catch { alert("Cannot delete — it may have registrations."); }
    finally { setDeleting(null); }
  };

  const counts = {
    total:    events.length,
    pending:  events.filter(e => ["PENDING_FACULTY","PENDING_SDW","PENDING_HOD"].includes(getStatus(e))).length,
    approved: events.filter(e => getStatus(e) === "APPROVED").length,
    rejected: events.filter(e => getStatus(e) === "REJECTED").length,
  };

  // Determine what action buttons to show per event
  const getActions = (ev) => {
    const actions = [];
    const ended   = eventHasEnded(ev);
    const status  = getStatus(ev);

    // Edit: allowed when rejected OR when pending/in-review (not when APPROVED and live)
    const canEdit = [
      "PENDING_FACULTY","PENDING_SDW","PENDING_HOD","REJECTED",
    ].includes(status);

    if (canEdit) {
      actions.push({
        label: "Edit",
        icon:  Edit2,
        color: "btn-outline",
        onClick: (e) => { e.stopPropagation(); navigate(`/organizer/edit/${ev.id}`); }
      });
    }

    // Submit budget: only after faculty approval
    if (status === "PENDING_SDW") {  // organizer submitted, budget already included
      actions.push({
        label: "Submit Budget →",
        icon:  IndianRupee,
        color: "btn",
        onClick: (e) => { e.stopPropagation(); navigate(`/organizer/budget/${ev.id}`); }
      });
    }

    // Post-event report: only after event has ended and is approved
    if (status === "APPROVED" && ended) {
      actions.push({
        label: ev.eventReport ? "Update Report" : "Submit Report",
        icon:  FileText,
        color: "btn-outline",
        onClick: (e) => { e.stopPropagation(); navigate(`/organizer/report/${ev.id}`); }
      });
    }

    // Delete: only when not approved or not yet in SDW/HoD hands
    const canDelete = status === "PENDING_FACULTY" || status === "REJECTED";
    if (canDelete) {
      actions.push({
        label:     deleting === ev.id ? "…" : "Delete",
        icon:      Trash2,
        color:     "btn-danger",
        onClick:   (e) => deleteEvent(ev.id, e),
        disabled:  deleting === ev.id,
      });
    }

    return actions;
  };

  return (
    <DashboardLayout onLogout={onLogout}>
      <PageHeader title="Organizer Dashboard" subtitle={`Manage your events, ${user.name}`}>
        <button onClick={() => navigate("/organizer/create")} className="btn flex items-center gap-2">
          <PlusCircle size={16}/> Create Event
        </button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Events" value={counts.total}    icon={Calendar}    color="blue"/>
        <StatCard label="In Review"    value={counts.pending}  icon={Clock}       color="amber"/>
        <StatCard label="Live Events"  value={counts.approved} icon={CheckCircle} color="emerald"/>
        <StatCard label="Needs Edit"   value={counts.rejected} icon={FileText}    color="red"/>
      </div>

      <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
        Your Events
      </h2>

      {loading ? (
        <div className="text-center text-slate-400 mt-16 text-sm">Loading…</div>
      ) : events.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <p className="text-slate-500 mb-4">No events yet. Create your first one!</p>
          <button onClick={() => navigate("/organizer/create")} className="btn">
            + Create Event
          </button>
        </div>
      ) : (
        <div className="space-y-3 max-w-3xl">
          {events.map(ev => {
            const evStatus = getStatus(ev);
            const meta    = STATUS_META[evStatus] || { label: evStatus, color:"badge-gray" };
            const actions = getActions(ev);
            const ended   = eventHasEnded(ev);

            return (
              <div key={ev.id}
                onClick={() => setSelected(ev)}
                className="glass-card p-4 cursor-pointer hover:shadow-md transition-all duration-200
                  hover:-translate-y-0.5 group">

                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Status badges */}
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`badge ${meta.color}`}>{meta.label}</span>
                      {ev.clubName && <span className="badge badge-violet">{ev.clubName}</span>}
                      {getStatus(ev) === "APPROVED" && ended && (
                        <span className="badge badge-gray">Event Ended</span>
                      )}
                      {getStatus(ev) === "APPROVED" && !ended && (
                        <span className="badge badge-green">🟢 Live</span>
                      )}
                    </div>

                    <p className="font-semibold text-slate-800 truncate">{ev.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {ev.startDate
                        ? new Date(ev.startDate).toLocaleDateString("en-IN",
                            { day:"numeric", month:"short", year:"numeric" })
                        : "—"}
                      {ev.location && ` · ${ev.location}`}
                    </p>

                    {/* Workflow */}
                    <div className="mt-3">
                      <WorkflowBadge status={getStatus(ev)}/>
                    </div>

                    {/* Reviewer feedback — show for rejected only */}
                    {getStatus(ev) === "REJECTED" &&
                      (ev.facultyComment || ev.sdwComment || ev.hodComment) && (
                      <div className="mt-2 bg-red-50 border border-red-100 rounded-lg p-2">
                        <p className="text-xs text-red-600 font-medium mb-0.5">
                          Reviewer feedback — please address before resubmitting:
                        </p>
                        <p className="text-xs text-slate-600">
                          {ev.facultyComment || ev.sdwComment || ev.hodComment}
                        </p>
                      </div>
                    )}

                    {/* Approved but not ended — tell organizer no edit */}
                    {getStatus(ev) === "APPROVED" && !ended && (
                      <p className="text-xs text-slate-400 mt-2">
                        🔒 Live event cannot be edited. Post-event report available after the event ends.
                      </p>
                    )}

                    {/* Approved and ended — prompt report */}
                    {getStatus(ev) === "APPROVED" && ended && !ev.eventReport && (
                      <p className="text-xs text-amber-500 mt-2">
                        ⚠ Event has ended — please submit your post-event report.
                      </p>
                    )}
                    {getStatus(ev) === "APPROVED" && ended && ev.eventReport && (
                      <p className="text-xs text-emerald-600 mt-2">
                        ✓ Post-event report submitted.
                      </p>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 transition"/>
                    {actions.map((action, i) => {
                      const Icon = action.icon;
                      return (
                        <button key={i}
                          onClick={action.onClick}
                          disabled={action.disabled}
                          className={`${action.color} text-xs px-3 py-1.5 flex items-center gap-1 whitespace-nowrap`}>
                          <Icon size={12}/> {action.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <EventDetailDrawer
          event={selected}
          onClose={() => setSelected(null)}
          showBudget={true}
        />
      )}
    </DashboardLayout>
  );
}