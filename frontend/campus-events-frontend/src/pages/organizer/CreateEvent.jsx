// import { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import api from "../../api/axios";
// import DashboardLayout from "../../layouts/DashboardLayout";
// import PageHeader      from "../../components/PageHeader";
// import { getStatus } from "../../utils";
// import { Plus, Minus } from "lucide-react";

// const CATEGORIES = ["Technical","Cultural","Sports","Workshop","Seminar","NSS","Social","Other"];
// const DEPARTMENTS = [
//   "Computer Science & Engineering","Information Technology",
//   "Electronics & Telecommunication","Mechanical Engineering",
//   "Civil Engineering","Electrical Engineering",
//   "Chemical Engineering","Instrumentation Engineering",
//   "Artificial Intelligence & Data Science","First Year Engineering",
// ];

// const CENTRAL_CLUBS = ["NSS","Cultural Committee","Sports Committee","NCC","Entrepreneurship Cell"];

// const EMPTY_FORM = {
//   title:"", description:"", location:"", category:"", department:"",
//   clubName:"", clubDepartment:"", clubWebsite:"", isCentralEvent:"",
//   theme:"", eventType:"", speakerName:"", speakerDetails:"",
//   startDate:"", endDate:"", registrationDeadline:"",
//   maxParticipants:"", entryFee:"", prizePool:"", goodies:"",
//   estimatedBudget:"0",
//   venueExpense:"", foodExpense:"", decorExpense:"", printingExpense:"", otherExpense:"",
//   budgetNotes:"",
// };

// export default function CreateEvent({ onLogout }) {
//   const { id }   = useParams(); // edit mode if id exists
//   const navigate = useNavigate();
//   const user     = JSON.parse(localStorage.getItem("user"));

//   const [form,        setForm]        = useState(EMPTY_FORM);
//   const [coordinators,setCoordinators]= useState([{ name:"", contact:"" }]);
//   const [loading,     setLoading]     = useState(false);
//   const [fetching,    setFetching]    = useState(!!id);
//   const [error,       setError]       = useState("");

//   const isEdit = !!id;

//   useEffect(() => {
//     if (!id) return;
//     setFetching(true);
//     api.get(`/events/${id}`)
//       .then(r => {
//         const ev = r.data;
//         const toLocal = (dt) => dt ? dt.replace("T"," ").substring(0,16) : "";
//         setForm({
//           title:              ev.title        || "",
//           description:        ev.description  || "",
//           location:           ev.location     || "",
//           category:           ev.category     || "",
//           department:         ev.department   || "",
//           clubName:           ev.clubName     || "",
//           clubDepartment:     ev.clubDepartment || "",
//           clubWebsite:        ev.clubWebsite  || "",
//           isCentralEvent:     ev.isCentralEvent || "",
//           theme:              ev.theme        || "",
//           eventType:          ev.eventType    || "",
//           speakerName:        ev.speakerName  || "",
//           speakerDetails:     ev.speakerDetails || "",
//           startDate:          toLocal(ev.startDate),
//           endDate:            toLocal(ev.endDate),
//           registrationDeadline: toLocal(ev.registrationDeadline),
//           maxParticipants:    ev.maxParticipants ?? "",
//           entryFee:           ev.entryFee     ?? "",
//           prizePool:          ev.prizePool    ?? "",
//           goodies:            ev.goodies      || "",
//           estimatedBudget:    ev.estimatedBudget ?? "0",
//           venueExpense:       ev.venueExpense    ?? "",
//           foodExpense:        ev.foodExpense     ?? "",
//           decorExpense:       ev.decorExpense    ?? "",
//           printingExpense:    ev.printingExpense ?? "",
//           otherExpense:       ev.otherExpense    ?? "",
//           budgetNotes:        ev.budgetNotes     || "",
//         });
//         if (ev.coordinatorsJson) {
//           try {
//             const parsed = JSON.parse(ev.coordinatorsJson);
//             if (Array.isArray(parsed) && parsed.length) { setCoordinators(parsed); return; }
//           } catch (_) {}
//         }
//         if (ev.coordinatorName) {
//           setCoordinators([{ name: ev.coordinatorName, contact: ev.coordinatorContact || "" }]);
//         }
//       })
//       .catch(() => setError("Failed to load event."))
//       .finally(() => setFetching(false));
//   }, [id]);

//   const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

//   const setCoord = (i, field, val) =>
//     setCoordinators(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: val } : c));

//   const toISO = (s) => s ? s.replace(" ","T") + ":00" : null;

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!form.title.trim())    { setError("Event title is required."); return; }
//     if (!form.location.trim()) { setError("Venue/location is required."); return; }
//     if (!form.startDate)       { setError("Start date and time is required."); return; }
//     if (coordinators[0]?.name === "") { setError("At least one coordinator name is required."); return; }
//     if (form.estimatedBudget === "" || form.estimatedBudget === undefined)
//                                { setError("Estimated budget is required (enter 0 if none)."); return; }

//     setLoading(true); setError("");
//     const payload = {
//       ...form,
//       organizerId:          user.id,
//       startDate:            toISO(form.startDate),
//       endDate:              toISO(form.endDate),
//       registrationDeadline: toISO(form.registrationDeadline),
//       estimatedBudget:      parseFloat(form.estimatedBudget) || 0,
//       maxParticipants:      form.maxParticipants ? parseInt(form.maxParticipants) : null,
//       entryFee:             form.entryFee  ? parseFloat(form.entryFee)  : null,
//       prizePool:            form.prizePool ? parseFloat(form.prizePool) : null,
//       venueExpense:         form.venueExpense    ? parseFloat(form.venueExpense)    : null,
//       foodExpense:          form.foodExpense     ? parseFloat(form.foodExpense)     : null,
//       decorExpense:         form.decorExpense    ? parseFloat(form.decorExpense)    : null,
//       printingExpense:      form.printingExpense ? parseFloat(form.printingExpense) : null,
//       otherExpense:         form.otherExpense    ? parseFloat(form.otherExpense)    : null,
//       coordinatorsJson:     JSON.stringify(coordinators.filter(c => c.name.trim())),
//       coordinatorName:      coordinators[0]?.name    || "",
//       coordinatorContact:   coordinators[0]?.contact || "",
//     };

//     try {
//       if (isEdit) {
//         await api.put(`/events/${id}`, payload);
//       } else {
//         await api.post("/events", payload);
//       }
//       navigate("/organizer");
//     } catch (err) {
//       setError(err.response?.data || "Failed to save event.");
//     } finally { setLoading(false); }
//   };

//   if (fetching) return (
//     <DashboardLayout onLogout={onLogout}>
//       <div className="text-center mt-20 text-slate-400 text-sm">Loading event…</div>
//     </DashboardLayout>
//   );

//   const fieldCls = "input";
//   const labelCls = "field-label";

//   return (
//     <DashboardLayout onLogout={onLogout}>
//       <PageHeader
//         title={isEdit ? "Edit Event" : "Create New Event"}
//         subtitle={isEdit ? "Update event details and resubmit for review" : "Submit your event for Faculty Advisor review"}
//       />

//       <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
//         {error && (
//           <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
//             {error}
//           </div>
//         )}

//         {/* ── BASIC INFO ── */}
//         <section className="glass-card p-6 space-y-4">
//           <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wide">Basic Info</h2>

//           <div>
//             <label className={labelCls}>Event Title *</label>
//             <input required value={form.title} onChange={e => set("title", e.target.value)}
//               className={fieldCls} placeholder="e.g. National Level Hackathon 2025" />
//           </div>

//           <div>
//             <label className={labelCls}>About / Description</label>
//             <textarea rows={3} value={form.description} onChange={e => set("description", e.target.value)}
//               className={fieldCls + " resize-none"} placeholder="Brief description of the event…" />
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className={labelCls}>Category</label>
//               <select value={form.category} onChange={e => set("category", e.target.value)} className={fieldCls}>
//                 <option value="">Select category</option>
//                 {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
//               </select>
//             </div>
//             <div>
//               <label className={labelCls}>Department</label>
//               <input value={form.department} onChange={e => set("department", e.target.value)}
//                 className={fieldCls} placeholder="Leave blank if central event" />
//             </div>
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className={labelCls}>Club Name</label>
//               <input value={form.clubName} onChange={e => set("clubName", e.target.value)}
//                 className={fieldCls} placeholder="e.g. Tech Club" />
//             </div>
//             <div>
//               <label className={labelCls}>Club Department</label>
//               <input value={form.clubDepartment} onChange={e => set("clubDepartment", e.target.value)}
//                 className={fieldCls} placeholder="central or dept name" />
//             </div>
//           </div>

//           <div className="flex items-center gap-3">
//             <input type="checkbox" id="central" checked={form.isCentralEvent === "true"}
//               onChange={e => set("isCentralEvent", e.target.checked ? "true" : "")}
//               className="rounded" />
//             <label htmlFor="central" className="text-sm text-slate-600 cursor-pointer">
//               🏫 This is a college-level / central event (e.g. NSS) — bypasses dept SDW
//             </label>
//           </div>
//         </section>

//         {/* ── EVENT TYPE & THEME ── */}
//         <section className="glass-card p-6 space-y-4">
//           <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wide">Type & Theme (Optional)</h2>

//           <div>
//             <label className={labelCls}>Theme</label>
//             <input value={form.theme} onChange={e => set("theme", e.target.value)}
//               className={fieldCls} placeholder="e.g. Innovation, Sustainability" />
//           </div>

//           <div>
//             <label className={labelCls}>Event Type</label>
//             <div className="flex gap-2">
//               {["INDIVIDUAL","TEAM","BOTH"].map(t => (
//                 <button key={t} type="button"
//                   onClick={() => set("eventType", form.eventType === t ? "" : t)}
//                   className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all
//                     ${form.eventType === t
//                       ? "bg-indigo-600 text-white border-indigo-600 shadow"
//                       : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300"}`}>
//                   {t}
//                 </button>
//               ))}
//             </div>
//           </div>

//           <div>
//             <label className={labelCls}>Speaker / Guest Name</label>
//             <input value={form.speakerName} onChange={e => set("speakerName", e.target.value)}
//               className={fieldCls} placeholder="e.g. Dr. Rahul Sharma" />
//           </div>
//           {form.speakerName && (
//             <div>
//               <label className={labelCls}>Speaker Details</label>
//               <textarea rows={2} value={form.speakerDetails} onChange={e => set("speakerDetails", e.target.value)}
//                 className={fieldCls + " resize-none"} placeholder="Designation, organization, topic…" />
//             </div>
//           )}
//         </section>

//         {/* ── DATES & VENUE ── */}
//         <section className="glass-card p-6 space-y-4">
//           <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wide">Dates & Venue</h2>

//           <div>
//             <label className={labelCls}>Venue / Location *</label>
//             <input required value={form.location} onChange={e => set("location", e.target.value)}
//               className={fieldCls} placeholder="e.g. Main Auditorium, Room 301" />
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className={labelCls}>Start Date & Time *</label>
//               <input type="datetime-local" required value={form.startDate}
//                 onChange={e => set("startDate", e.target.value)} className={fieldCls} />
//             </div>
//             <div>
//               <label className={labelCls}>End Date & Time</label>
//               <input type="datetime-local" value={form.endDate}
//                 onChange={e => set("endDate", e.target.value)} className={fieldCls} />
//             </div>
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className={labelCls}>Registration Deadline</label>
//               <input type="datetime-local" value={form.registrationDeadline}
//                 onChange={e => set("registrationDeadline", e.target.value)} className={fieldCls} />
//             </div>
//             <div>
//               <label className={labelCls}>Max Participants</label>
//               <input type="number" min="1" value={form.maxParticipants}
//                 onChange={e => set("maxParticipants", e.target.value)}
//                 className={fieldCls} placeholder="Leave blank for unlimited" />
//             </div>
//           </div>

//           <div>
//             <label className={labelCls}>Club Website</label>
//             <input type="url" value={form.clubWebsite} onChange={e => set("clubWebsite", e.target.value)}
//               className={fieldCls} placeholder="https://…" />
//           </div>
//         </section>

//         {/* ── COORDINATORS ── */}
//         <section className="glass-card p-6 space-y-4">
//           <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wide">
//             Event Coordinators * <span className="text-slate-400 font-normal text-xs">(at least one required)</span>
//           </h2>

//           {coordinators.map((c, i) => (
//             <div key={i} className="flex gap-3 items-end">
//               <div className="flex-1">
//                 <label className={labelCls}>Coordinator Name *</label>
//                 <input required={i === 0} value={c.name}
//                   onChange={e => setCoord(i, "name", e.target.value)}
//                   className={fieldCls} placeholder="Full name" />
//               </div>
//               <div className="flex-1">
//                 <label className={labelCls}>Contact Number</label>
//                 <input value={c.contact}
//                   onChange={e => setCoord(i, "contact", e.target.value)}
//                   className={fieldCls} placeholder="Mobile number" />
//               </div>
//               {coordinators.length > 1 && (
//                 <button type="button"
//                   onClick={() => setCoordinators(prev => prev.filter((_, idx) => idx !== i))}
//                   className="btn-danger px-3 py-2.5 mb-0.5">
//                   <Minus size={14} />
//                 </button>
//               )}
//             </div>
//           ))}

//           <button type="button"
//             onClick={() => setCoordinators(prev => [...prev, { name:"", contact:"" }])}
//             className="btn-outline text-xs px-3 py-2 flex items-center gap-1">
//             <Plus size={13} /> Add Coordinator
//           </button>
//         </section>

//         {/* ── FEES & PRIZES ── */}
//         <section className="glass-card p-6 space-y-4">
//           <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wide">Fees & Prizes (Optional)</h2>

//           <div className="grid grid-cols-3 gap-4">
//             <div>
//               <label className={labelCls}>Entry Fee (₹)</label>
//               <input type="number" min="0" step="0.01" value={form.entryFee}
//                 onChange={e => set("entryFee", e.target.value)}
//                 className={fieldCls} placeholder="0 = free" />
//             </div>
//             <div>
//               <label className={labelCls}>Prize Pool (₹)</label>
//               <input type="number" min="0" step="0.01" value={form.prizePool}
//                 onChange={e => set("prizePool", e.target.value)}
//                 className={fieldCls} placeholder="Optional" />
//             </div>
//             <div>
//               <label className={labelCls}>Goodies / Perks</label>
//               <input value={form.goodies} onChange={e => set("goodies", e.target.value)}
//                 className={fieldCls} placeholder="e.g. T-shirt, cert" />
//             </div>
//           </div>
//         </section>

//         {/* ── BUDGET (COMPULSORY) ── */}
//         <section className="glass-card p-6 space-y-4">
//           <div className="flex items-center justify-between">
//             <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wide">
//               Budget Details *
//             </h2>
//             <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
//               Required — enter 0 if no budget
//             </span>
//           </div>

//           <div>
//             <label className={labelCls}>Total Estimated Budget (₹) *</label>
//             <input type="number" required min="0" step="0.01" value={form.estimatedBudget}
//               onChange={e => set("estimatedBudget", e.target.value)}
//               className={fieldCls} placeholder="0" />
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className={labelCls}>Venue / Hall (₹)</label>
//               <input type="number" min="0" step="0.01" value={form.venueExpense}
//                 onChange={e => set("venueExpense", e.target.value)} className={fieldCls} placeholder="0" />
//             </div>
//             <div>
//               <label className={labelCls}>Food & Refreshments (₹)</label>
//               <input type="number" min="0" step="0.01" value={form.foodExpense}
//                 onChange={e => set("foodExpense", e.target.value)} className={fieldCls} placeholder="0" />
//             </div>
//             <div>
//               <label className={labelCls}>Decorations (₹)</label>
//               <input type="number" min="0" step="0.01" value={form.decorExpense}
//                 onChange={e => set("decorExpense", e.target.value)} className={fieldCls} placeholder="0" />
//             </div>
//             <div>
//               <label className={labelCls}>Printing / Banners (₹)</label>
//               <input type="number" min="0" step="0.01" value={form.printingExpense}
//                 onChange={e => set("printingExpense", e.target.value)} className={fieldCls} placeholder="0" />
//             </div>
//             <div>
//               <label className={labelCls}>Other Expenses (₹)</label>
//               <input type="number" min="0" step="0.01" value={form.otherExpense}
//                 onChange={e => set("otherExpense", e.target.value)} className={fieldCls} placeholder="0" />
//             </div>
//           </div>

//           <div>
//             <label className={labelCls}>Budget Notes / Justification</label>
//             <textarea rows={2} value={form.budgetNotes} onChange={e => set("budgetNotes", e.target.value)}
//               className={fieldCls + " resize-none"} placeholder="Brief justification for expenses…" />
//           </div>
//         </section>

//         {/* Submit */}
//         <div className="flex gap-3 pb-8">
//           <button type="submit" disabled={loading} className="btn flex-1 py-3 text-base">
//             {loading
//               ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
//                   {isEdit ? "Updating…" : "Submitting…"}</>
//               : isEdit ? "Update & Resubmit" : "Submit for Faculty Review"}
//           </button>
//           <button type="button" onClick={() => navigate("/organizer")}
//             className="btn-outline px-6 py-3">Cancel</button>
//         </div>
//       </form>
//     </DashboardLayout>
//   );
// }
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/PageHeader";
import { Plus, Minus } from "lucide-react";

import { CATEGORIES, DEPARTMENTS } from "../../constants";

const COMMON_VENUES = ["Seminar Hall", "LRDC Hall", "Auditorium", "Other"];
const VENUE_OPTIONS = [...DEPARTMENTS, ...COMMON_VENUES];

const EMPTY_FORM = {
  title:"", description:"", location:"", category:"",
  department:"", clubName:"", clubDepartment:"",
  clubWebsite:"", isCentralEvent:"",
  theme:"", eventType:"", speakerName:"", speakerDetails:"",
  startDate:"", endDate:"", registrationDeadline:"",
  maxParticipants:"", entryFee:"", prizePool:"", goodies:"",
  estimatedBudget:"0",
  venueExpense:"", foodExpense:"", decorExpense:"", printingExpense:"", otherExpense:"",
  budgetNotes:"",
};

export default function CreateEvent({ onLogout }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [form, setForm] = useState(EMPTY_FORM);
  const [coordinators, setCoordinators] = useState([{ name:"", contact:"" }]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!id);
  const [error, setError] = useState("");
  const [specificLocation, setSpecificLocation] = useState("");

  const isEdit = !!id;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const setCoord = (i, field, val) =>
    setCoordinators(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: val } : c));

  const toISO = (s) => s ? s.replace(" ","T") + ":00" : null;

  // ✅ AUTO-FILL
  useEffect(() => {
    if (!user || isEdit) return;

    setForm(prev => ({
      ...prev,
      department: user.department || "",
      clubName: user.clubName || "",
      clubDepartment: user.clubDepartment || user.department || ""
    }));
  }, [user, isEdit]);

  // ✅ EDIT MODE LOAD (FIXED)
  useEffect(() => {
    if (!id) return;
    setFetching(true);

    api.get(`/events/${id}`)
      .then(r => {
        const ev = r.data;
        const toLocal = (dt) => dt ? dt.replace("T"," ").substring(0,16) : "";

        setForm({
          ...EMPTY_FORM,
          title: ev.title || "",
          description: ev.description || "",
          location: ev.location || "",
          category: ev.category || "",
          department: ev.department || "",
          clubName: ev.clubName || "",
          clubDepartment: ev.clubDepartment || "",
          clubWebsite: ev.clubWebsite || "",
          isCentralEvent: ev.isCentralEvent || "",
          theme: ev.theme || "",
          eventType: ev.eventType || "",
          speakerName: ev.speakerName || "",
          speakerDetails: ev.speakerDetails || "",
          startDate: toLocal(ev.startDate),
          endDate: toLocal(ev.endDate),
          registrationDeadline: toLocal(ev.registrationDeadline),
          maxParticipants: ev.maxParticipants ?? "",
          entryFee: ev.entryFee ?? "",
          prizePool: ev.prizePool ?? "",
          goodies: ev.goodies || "",
          estimatedBudget: ev.estimatedBudget ?? "0",
          venueExpense: ev.venueExpense ?? "",
          foodExpense: ev.foodExpense ?? "",
          decorExpense: ev.decorExpense ?? "",
          printingExpense: ev.printingExpense ?? "",
          otherExpense: ev.otherExpense ?? "",
          budgetNotes: ev.budgetNotes || "",
        });

        // coordinators
        if (ev.coordinatorsJson) {
          try {
            const parsed = JSON.parse(ev.coordinatorsJson);
            if (Array.isArray(parsed) && parsed.length) {
              setCoordinators(parsed);
              return;
            }
          } catch (_) {}
        }

        if (ev.coordinatorName) {
          setCoordinators([{ name: ev.coordinatorName, contact: ev.coordinatorContact || "" }]);
        }
      })
      .catch(() => setError("Failed to load event."))
      .finally(() => setFetching(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) return setError("Event title is required.");
    if (!form.location.trim()) return setError("Venue required.");
    if (!form.startDate) return setError("Start date required.");
    if (!coordinators[0]?.name) return setError("Coordinator required.");

    setLoading(true); setError("");

    const finalLocation =
      form.location === "Other" ? specificLocation : form.location;

    const payload = {
      ...form,
      location: finalLocation,
      organizerId: user.id,
      startDate: toISO(form.startDate),
      endDate: toISO(form.endDate),
      registrationDeadline: toISO(form.registrationDeadline),
      estimatedBudget: parseFloat(form.estimatedBudget) || 0,
      maxParticipants: form.maxParticipants ? parseInt(form.maxParticipants) : null,
      entryFee: form.entryFee ? parseFloat(form.entryFee) : null,
      prizePool: form.prizePool ? parseFloat(form.prizePool) : null,
      venueExpense: form.venueExpense ? parseFloat(form.venueExpense) : null,
      foodExpense: form.foodExpense ? parseFloat(form.foodExpense) : null,
      decorExpense: form.decorExpense ? parseFloat(form.decorExpense) : null,
      printingExpense: form.printingExpense ? parseFloat(form.printingExpense) : null,
      otherExpense: form.otherExpense ? parseFloat(form.otherExpense) : null,
      coordinatorsJson: JSON.stringify(coordinators.filter(c => c.name.trim())),
      coordinatorName: coordinators[0]?.name || "",
      coordinatorContact: coordinators[0]?.contact || "",
    };

    try {
      if (isEdit) await api.put(`/events/${id}`, payload);
      else await api.post("/events", payload);

      navigate("/organizer");
    } catch (err) {
      setError(err.response?.data || "Failed to save event.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <DashboardLayout onLogout={onLogout}>
      <div className="text-center mt-20 text-slate-400 text-sm">Loading…</div>
    </DashboardLayout>
  );

  const fieldCls = "input";
  const labelCls = "field-label";

  return (
    <DashboardLayout onLogout={onLogout}>
      <PageHeader title={isEdit ? "Edit Event" : "Create New Event"} />

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">

        {error && <div className="text-red-600">{error}</div>}

        {/* BASIC INFO */}
        <section className="glass-card p-6 space-y-4">
          <h2 className="font-bold text-sm">Basic Info</h2>

          <input value={form.title} onChange={e=>set("title",e.target.value)} className={fieldCls} placeholder="Title"/>

          <textarea value={form.description} onChange={e=>set("description",e.target.value)}
            className={fieldCls} placeholder="Description"/>

          <select value={form.category} onChange={e=>set("category",e.target.value)} className={fieldCls}>
            <option value="">Select</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <input value={form.department} readOnly className={fieldCls + " bg-slate-100"}/>
          <input value={form.clubName} readOnly className={fieldCls + " bg-slate-100"}/>
        </section>

        {/* VENUE */}
        <section className="glass-card p-6 space-y-4">
          <h2 className="font-bold text-sm">Venue</h2>

          <select
            value={form.location}
            onChange={e => {
              set("location", e.target.value);
              setSpecificLocation("");
            }}
            className={fieldCls}
          >
            <option value="">Select venue</option>
            {VENUE_OPTIONS.map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>

          {form.location === "Other" && (
            <input
              value={specificLocation}
              onChange={e => setSpecificLocation(e.target.value)}
              className={fieldCls}
              placeholder="Enter custom location"
            />
          )}
        </section>

        {/* SUBMIT */}
        <button className="btn w-full py-3">
          {loading ? "Saving..." : isEdit ? "Update Event" : "Create Event"}
        </button>

      </form>
    </DashboardLayout>
  );
}