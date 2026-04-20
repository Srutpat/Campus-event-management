import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader      from "../../components/PageHeader";
import { eventHasEnded, formatDateTime } from "../../utils";
import { FileText, Upload, AlertCircle, Download } from "lucide-react";

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB

export default function PostEventReport({ onLogout }) {
  const { id }   = useParams();
  const navigate = useNavigate();
  const fileRef  = useRef();

  const [event,    setEvent]    = useState(null);
  const [form,     setForm]     = useState({ eventReport:"", actualExpenditure:"", reimbursementDetails:"" });
  const [file,     setFile]     = useState(null);      // File object
  const [fileB64,  setFileB64]  = useState("");         // base64 data URL
  const [loading,  setLoading]  = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState("");

  useEffect(() => {
    api.get(`/events/${id}`)
      .then(r => {
        setEvent(r.data);
        setForm({
          eventReport:          r.data.eventReport          || "",
          actualExpenditure:    r.data.actualExpenditure    ?? "",
          reimbursementDetails: r.data.reimbursementDetails || "",
        });
        // If a report file was previously saved, note it
        if (r.data.reportFileName) setFile({ name: r.data.reportFileName, existing: true });
      })
      .catch(() => setError("Event not found."))
      .finally(() => setFetching(false));
  }, [id]);

  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleFile = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > MAX_FILE_BYTES) { setError("File must be under 5 MB."); return; }
    setFile(f);
    // Read as base64 data URL
    const reader = new FileReader();
    reader.onload = () => setFileB64(reader.result);
    reader.readAsDataURL(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.eventReport.trim() && !fileB64 && !file?.existing) {
      setError("Please enter a report or upload a file."); return;
    }
    setLoading(true); setError(""); setSuccess("");
    try {
      await api.post(`/events/${id}/post-event`, {
        eventReport:          form.eventReport,
        actualExpenditure:    form.actualExpenditure ? parseFloat(form.actualExpenditure) : null,
        reimbursementDetails: form.reimbursementDetails,
        reportFileData:       fileB64 || undefined,           // full base64 data URL
        reportFileName:       file && !file.existing ? file.name : undefined,
      });
      setSuccess("Report submitted! Faculty and SDW can now view and download it.");
      setTimeout(() => navigate("/organizer"), 2000);
    } catch (err) {
      setError(err.response?.data || "Failed to submit report.");
    } finally { setLoading(false); }
  };

  if (fetching) return <DashboardLayout onLogout={onLogout}><div className="text-center mt-20 text-slate-400">Loading…</div></DashboardLayout>;

  if (event && !eventHasEnded(event)) {
    return (
      <DashboardLayout onLogout={onLogout}>
        <PageHeader title="Post-Event Report" subtitle={event.title}/>
        <div className="max-w-2xl glass-card p-8 text-center">
          <AlertCircle size={40} className="text-amber-400 mx-auto mb-4"/>
          <h3 className="font-bold text-slate-800 text-lg mb-2">Event hasn't ended yet</h3>
          <p className="text-slate-500 text-sm mb-2">Reports can only be submitted after the event concludes.</p>
          {(event.endDate || event.startDate) && (
            <p className="text-xs text-slate-400 mb-6">
              Event ends: {formatDateTime(event.endDate || event.startDate)}
            </p>
          )}
          <button onClick={() => navigate("/organizer")} className="btn">Back to Dashboard</button>
        </div>
      </DashboardLayout>
    );
  }

  const variance = event?.estimatedBudget && form.actualExpenditure
    ? parseFloat(form.actualExpenditure) - event.estimatedBudget : null;

  return (
    <DashboardLayout onLogout={onLogout}>
      <PageHeader title="Post-Event Report" subtitle={event?.title || ""}/>
      <div className="max-w-2xl">

        {/* Budget comparison */}
        {event?.estimatedBudget > 0 && (
          <div className="glass-card p-5 mb-6 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-slate-400 mb-1">Estimated</p>
              <p className="text-lg font-bold text-slate-700">₹{event.estimatedBudget.toLocaleString("en-IN")}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Actual Spent</p>
              <p className="text-lg font-bold text-slate-700">
                {form.actualExpenditure ? `₹${parseFloat(form.actualExpenditure).toLocaleString("en-IN")}` : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Variance</p>
              {variance !== null
                ? <p className={`text-lg font-bold ${variance > 0 ? "text-red-500" : "text-emerald-600"}`}>
                    {variance > 0 ? "+" : ""}₹{Math.abs(variance).toLocaleString("en-IN")}
                  </p>
                : <p className="text-lg font-bold text-slate-300">—</p>}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="glass-card p-8 flex flex-col gap-5">
          {error   && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</div>}
          {success && <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">✓ {success}</div>}

          {/* Text report */}
          <div>
            <label className="field-label"><FileText size={13} className="inline mr-1"/>Event Report</label>
            <p className="text-xs text-slate-400 mb-1">Describe highlights, attendance, outcomes, learnings.</p>
            <textarea name="eventReport" value={form.eventReport} onChange={set} rows={6}
              placeholder="The event was held on [date] and attended by [N] students…"
              className="input resize-none"/>
          </div>

          {/* PDF/File upload — stores as base64 so faculty/SDW can download */}
          <div>
            <label className="field-label"><Upload size={13} className="inline mr-1"/>Upload Report File (PDF / Word / Image, max 5 MB)</label>
            <p className="text-xs text-slate-400 mb-1">
              Faculty and SDW can <strong>view and download</strong> this file from their Reports section.
            </p>

            <div onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all
                ${file && !file.existing ? "border-emerald-400 bg-emerald-50" : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"}`}>
              <input ref={fileRef} type="file" className="hidden"
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                onChange={handleFile}/>
              {file ? (
                <div>
                  <p className="font-semibold text-sm text-emerald-700">✓ {file.name}</p>
                  {!file.existing && (
                    <p className="text-xs text-emerald-500 mt-0.5">
                      {(file.size / 1024).toFixed(0)} KB · Click to change
                    </p>
                  )}
                  {file.existing && <p className="text-xs text-slate-400 mt-0.5">Previously uploaded · Click to replace</p>}
                </div>
              ) : (
                <div>
                  <Upload size={22} className="text-slate-300 mx-auto mb-2"/>
                  <p className="text-sm text-slate-500">Click to upload PDF, Word doc, or image</p>
                  <p className="text-xs text-slate-400 mt-1">Stored securely — reviewers can download it</p>
                </div>
              )}
            </div>
          </div>

          {/* Actual expenditure */}
          <div>
            <label className="field-label">Actual Expenditure (₹)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm">₹</span>
              <input name="actualExpenditure" type="number" min="0" step="0.01"
                value={form.actualExpenditure} onChange={set} placeholder="0" className="input pl-8"/>
            </div>
          </div>

          {/* Reimbursement */}
          <div>
            <label className="field-label">Reimbursement Details</label>
            <textarea name="reimbursementDetails" value={form.reimbursementDetails} onChange={set}
              rows={3} className="input resize-none"
              placeholder="Bill 1: Venue – ₹5,000 (paid by organizer, reimbursement needed)"/>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn flex-1 py-2.5">
              {loading ? "Submitting…" : event?.eventReport ? "Update Report" : "Submit Report"}
            </button>
            <button type="button" onClick={() => navigate("/organizer")} className="btn-outline px-6 py-2.5">Cancel</button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}