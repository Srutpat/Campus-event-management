import { useEffect, useState } from "react";
import api from "../../api/axios";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader      from "../../components/PageHeader";
import { safeArray, getStatus, formatDateTime } from "../../utils";
import { Download, ChevronDown, ChevronUp, FileText, File } from "lucide-react";

export default function FacultyReports({ onLogout }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const myClubs = (user.clubNames || user.clubName || "")
    .split(",").map(c => c.trim().toLowerCase()).filter(Boolean);

  const [events,     setEvents]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [expanded,   setExpanded]   = useState({});
  const [attendance, setAttendance] = useState({});

  useEffect(() => {
    // Load all events — filter by clubs + only APPROVED ones
    api.get("/events")
      .then(r => {
        const all = safeArray(r.data).filter(e => getStatus(e) === "APPROVED");
        const visible = myClubs.length === 0
          ? all
          : all.filter(e => e.clubName && myClubs.includes(e.clubName.trim().toLowerCase()));
        setEvents(visible);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggle = async (eventId) => {
    const next = { ...expanded, [eventId]: !expanded[eventId] };
    setExpanded(next);
    if (next[eventId] && !attendance[eventId]) {
      try {
        const r = await api.get(`/attendance/event/${eventId}`);
        setAttendance(a => ({ ...a, [eventId]: safeArray(r.data) }));
      } catch { setAttendance(a => ({ ...a, [eventId]: [] })); }
    }
  };

  const exportCSV = (ev, e) => {
    e.stopPropagation();
    const rows = attendance[ev.id] || [];
    if (!rows.length) { alert("No attendance data yet."); return; }
    const header = "PRN,Name,Department,Division,Present,Marked At";
    const lines  = rows.map(a => [
      a.registration?.student?.prn        || "",
      a.registration?.student?.name       || "",
      a.registration?.student?.department || "",
      a.registration?.student?.division   || "",
      a.present ? "Yes" : "No",
      a.markedAt ? new Date(a.markedAt).toLocaleString("en-IN") : "",
    ].join(","));
    const blob = new Blob([[header, ...lines].join("\n")], { type:"text/csv" });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href     = url;
    link.download = `${ev.title.replace(/\s+/g,"_")}_attendance.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Download the PDF report stored as base64
  const downloadReport = (ev, e) => {
    e.stopPropagation();
    if (!ev.reportFileData) { alert("No file uploaded by organizer."); return; }
    const link = document.createElement("a");
    link.href     = ev.reportFileData;  // base64 data URL — browser handles it natively
    link.download = ev.reportFileName || `${ev.title.replace(/\s+/g,"_")}_report.pdf`;
    link.click();
  };

  return (
    <DashboardLayout onLogout={onLogout}>
      <PageHeader title="Attendance & Reports"
        subtitle="Download attendance CSV and post-event reports for your events"/>

      {loading ? (
        <div className="space-y-3 max-w-3xl">{[1,2].map(i=><div key={i} className="skeleton h-16 rounded-2xl"/>)}</div>
      ) : events.length === 0 ? (
        <div className="glass-card p-12 text-center max-w-3xl">
          <p className="text-slate-400 text-sm">No approved events found for your clubs.</p>
        </div>
      ) : (
        <div className="space-y-3 max-w-3xl">
          {events.map(ev => (
            <div key={ev.id} className="glass-card overflow-hidden">
              {/* Header row */}
              <div className="flex items-center justify-between p-4 cursor-pointer"
                onClick={() => toggle(ev.id)}>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800">{ev.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {ev.organizer?.name} · {formatDateTime(ev.startDate || ev.eventDate)}
                    {ev.clubName && ` · ${ev.clubName}`}
                  </p>
                  {/* Report file indicator */}
                  {ev.reportFileName && (
                    <p className="text-xs text-emerald-600 mt-0.5 flex items-center gap-1">
                      <File size={10}/> Report uploaded: {ev.reportFileName}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0 ml-3" onClick={e => e.stopPropagation()}>
                  {/* Download attendance CSV */}
                  <button onClick={e => exportCSV(ev, e)}
                    className="btn-outline text-xs px-3 py-1.5 flex items-center gap-1">
                    <Download size={12}/> Attendance CSV
                  </button>
                  {/* Download event report PDF */}
                  {ev.reportFileData && (
                    <button onClick={e => downloadReport(ev, e)}
                      className="btn text-xs px-3 py-1.5 flex items-center gap-1">
                      <FileText size={12}/> Report PDF
                    </button>
                  )}
                  {expanded[ev.id] ? <ChevronUp size={16} className="text-slate-400"/> : <ChevronDown size={16} className="text-slate-400"/>}
                </div>
              </div>

              {/* Expanded attendance list */}
              {expanded[ev.id] && (
                <div className="border-t border-slate-100 px-4 py-3">
                  {/* Text report */}
                  {ev.eventReport && (
                    <div className="mb-4 bg-slate-50 rounded-xl p-3">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Event Report</p>
                      <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{ev.eventReport}</p>
                    </div>
                  )}
                  {/* Reimbursement */}
                  {ev.reimbursementDetails && (
                    <div className="mb-4 bg-amber-50 rounded-xl p-3">
                      <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-1">Reimbursement</p>
                      <p className="text-sm text-slate-700 whitespace-pre-line">{ev.reimbursementDetails}</p>
                    </div>
                  )}
                  {/* Attendance table */}
                  {!attendance[ev.id] ? (
                    <p className="text-xs text-slate-400">Loading attendance…</p>
                  ) : attendance[ev.id].length === 0 ? (
                    <p className="text-xs text-slate-400">No attendance marked yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-left text-slate-500 border-b border-slate-100">
                            <th className="pb-2 pr-4 font-semibold">PRN</th>
                            <th className="pb-2 pr-4 font-semibold">Name</th>
                            <th className="pb-2 pr-4 font-semibold">Dept / Div</th>
                            <th className="pb-2 font-semibold">Present</th>
                          </tr>
                        </thead>
                        <tbody>
                          {attendance[ev.id].map((a, i) => (
                            <tr key={i} className="border-b border-slate-50">
                              <td className="py-1.5 pr-4 text-slate-600">{a.registration?.student?.prn || "—"}</td>
                              <td className="py-1.5 pr-4 font-medium text-slate-800">{a.registration?.student?.name || "—"}</td>
                              <td className="py-1.5 pr-4 text-slate-500">
                                {a.registration?.student?.department || "—"} / {a.registration?.student?.division || "—"}
                              </td>
                              <td className="py-1.5">
                                <span className={`badge ${a.present ? "badge-green" : "badge-red"}`}>
                                  {a.present ? "✓ Yes" : "✗ No"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}