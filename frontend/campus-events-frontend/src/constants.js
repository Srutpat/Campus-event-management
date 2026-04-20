// ── STATUS: only 5 values ─────────────────────────────────────────────────
export const STATUS_META = {
  PENDING_FACULTY: { label:"Pending Faculty Review", color:"badge-yellow" },
  PENDING_SDW:     { label:"Pending SDW Review",     color:"badge-yellow" },
  PENDING_HOD:     { label:"Pending HoD Approval",   color:"badge-yellow" },
  APPROVED:        { label:"Live ✓",                 color:"badge-green"  },
  REJECTED:        { label:"Rejected",               color:"badge-red"    },
  // Legacy — old DB values shown gracefully
  PENDING_APPROVAL: { label:"Pending Review",        color:"badge-yellow" },
  DRAFT:            { label:"Draft",                 color:"badge-gray"   },
};

// Workflow pipeline steps for WorkflowBadge
export const WORKFLOW_STEPS = [
  { key:"PENDING_FACULTY", label:"Faculty" },
  { key:"PENDING_SDW",     label:"SDW"     },
  { key:"PENDING_HOD",     label:"HoD"     },
  { key:"APPROVED",        label:"Live ✓"  },
];

// ── App branding ───────────────────────────────────────────────────────────
export const APP_NAME    = "EventPulse";
export const APP_TAGLINE = "Where campus events come alive";

// ── Dropdown data ──────────────────────────────────────────────────────────
export const DEPARTMENTS = [
  "Computer Science & Engineering",
  "Information Technology",
  "Electronics & Telecommunication",
  "Mechanical Engineering",
  "Civil Engineering",
  "Electrical Engineering",
  "Chemical Engineering",
  "Instrumentation Engineering",
  "Artificial Intelligence & Data Science",
  "First Year Engineering",
];

export const YEARS     = ["FE","SE","TE","BE"];
export const DIVISIONS = ["A","B","C","D","E"];
export const CATEGORIES = ["Technical","Cultural","Sports","Workshop","Seminar","NSS","Social","Other"];