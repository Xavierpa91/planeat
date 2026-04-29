// Icon set — line icons (lucide-style, hand-rolled to avoid bundle)
// + monochrome food glyphs

const Ico = ({ name, size = 22, stroke = 2, ...rest }) => {
  const common = {
    width: size, height: size, viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor", strokeWidth: stroke,
    strokeLinecap: "round", strokeLinejoin: "round",
    ...rest,
  };
  switch (name) {
    case "chef":
      return (
        <svg {...common}>
          <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/>
          <line x1="6" y1="17" x2="18" y2="17"/>
        </svg>
      );
    case "calendar":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <path d="M16 2v4M8 2v4M3 10h18"/>
        </svg>
      );
    case "cart":
      return (
        <svg {...common}>
          <circle cx="8" cy="21" r="1"/>
          <circle cx="19" cy="21" r="1"/>
          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
        </svg>
      );
    case "users":
      return (
        <svg {...common}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      );
    case "plus":
      return (<svg {...common}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>);
    case "x":
      return (<svg {...common}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>);
    case "left":
      return (<svg {...common}><polyline points="15 18 9 12 15 6"/></svg>);
    case "right":
      return (<svg {...common}><polyline points="9 18 15 12 9 6"/></svg>);
    case "logout":
      return (
        <svg {...common}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
      );
    case "home":
      return (<svg {...common}><path d="M3 9.5 12 3l9 6.5V20a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2Z"/></svg>);
    case "search":
      return (<svg {...common}><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>);
    case "edit":
      return (<svg {...common}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z"/></svg>);
    case "trash":
      return (<svg {...common}><polyline points="3 6 5 6 21 6"/><path d="M19 6 17.5 20a2 2 0 0 1-2 1.93h-7A2 2 0 0 1 6.5 20L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg>);
    case "copy":
      return (<svg {...common}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>);
    case "send":
      return (<svg {...common}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>);
    case "check":
      return (<svg {...common}><polyline points="20 6 9 17 4 12"/></svg>);
    case "drag":
      return (<svg {...common}><circle cx="9" cy="6" r="1" fill="currentColor"/><circle cx="9" cy="12" r="1" fill="currentColor"/><circle cx="9" cy="18" r="1" fill="currentColor"/><circle cx="15" cy="6" r="1" fill="currentColor"/><circle cx="15" cy="12" r="1" fill="currentColor"/><circle cx="15" cy="18" r="1" fill="currentColor"/></svg>);
    case "mail":
      return (<svg {...common}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/></svg>);
    case "google":
      // generic colorful "G" mark — original lozenge composition (not Google's actual mark)
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" fill="#fff" stroke="currentColor" strokeWidth="0.5"/>
          <text x="12" y="16.5" textAnchor="middle" fontFamily="Plus Jakarta Sans, sans-serif" fontWeight="800" fontSize="14" fill="#222">G</text>
        </svg>
      );
    case "spark":
      return (<svg {...common}><path d="M12 3v3M12 18v3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M3 12h3M18 12h3M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>);
    case "leaf":
      return (<svg {...common}><path d="M11 20A7 7 0 0 1 4 13c0-2.5 2-5 4-7 2.5-2.5 5-3 7-3 0 2 -.5 4.5 -3 7-2 2-4.5 4-7 4Z"/><path d="M2 22c5-3 7-7 9-12"/></svg>);
    default:
      return null;
  }
};

// Food glyphs — minimal monochrome placeholders associated with recipe categories
const FoodIco = ({ kind, size = 22 }) => {
  const common = {
    width: size, height: size, viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor", strokeWidth: 1.7,
    strokeLinecap: "round", strokeLinejoin: "round",
  };
  switch (kind) {
    case "pasta":
      return (
        <svg {...common}>
          <path d="M4 14h16"/>
          <path d="M5 14c0-3 1-6 7-6s6 3 6 6"/>
          <path d="M8 14v5M12 14v5M16 14v5"/>
        </svg>
      );
    case "salad":
      return (
        <svg {...common}>
          <path d="M3 11h18a9 9 0 0 1-18 0Z"/>
          <path d="M7 8c1-2 3-2 4 0M13 7c1-2 3-2 4 0M10 6c0-2 2-3 3-2"/>
        </svg>
      );
    case "chicken":
      return (
        <svg {...common}>
          <path d="M5 19c0-5 3-9 8-9 3 0 6 2 6 5 0 2-1 3-3 4l1 3-3-1-3 1 1-3-3-1c-2-1-4 1-4 1Z"/>
        </svg>
      );
    case "fish":
      return (
        <svg {...common}>
          <path d="M3 12c4-5 9-5 13-3 2 1 3 3 5 3-2 0-3 2-5 3-4 2-9 2-13-3Z"/>
          <circle cx="14" cy="11" r=".7" fill="currentColor"/>
        </svg>
      );
    case "soup":
      return (
        <svg {...common}>
          <path d="M3 11h18l-1 6a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3Z"/>
          <path d="M8 7c1-1 1-2 0-3M12 7c1-1 1-2 0-3M16 7c1-1 1-2 0-3"/>
        </svg>
      );
    case "bowl":
      return (
        <svg {...common}>
          <path d="M3 12h18a8 8 0 0 1-8 8h-2a8 8 0 0 1-8-8Z"/>
          <circle cx="9" cy="8" r="1.2"/>
          <circle cx="13" cy="6" r="1.2"/>
          <circle cx="16" cy="9" r="1.2"/>
        </svg>
      );
    case "pizza":
      return (
        <svg {...common}>
          <path d="M2 9c4-6 16-6 20 0L12 22Z"/>
          <circle cx="9" cy="11" r=".9" fill="currentColor"/>
          <circle cx="14" cy="12" r=".9" fill="currentColor"/>
          <circle cx="11" cy="15" r=".9" fill="currentColor"/>
        </svg>
      );
    case "wrap":
      return (
        <svg {...common}>
          <path d="M3 7c4-3 14-3 18 0v10c-4 3-14 3-18 0Z"/>
          <path d="M7 8v8M11 8v8M15 8v8"/>
        </svg>
      );
    case "rice":
      return (
        <svg {...common}>
          <path d="M4 14h16a8 8 0 0 1-8 6 8 8 0 0 1-8-6Z"/>
          <path d="M7 11c1-1 1-2 0-3M11 12c1-1 1-2 0-3M15 11c1-1 1-2 0-3"/>
        </svg>
      );
    case "egg":
      return (<svg {...common}><path d="M12 3c-4 0-7 6-7 11a7 7 0 0 0 14 0c0-5-3-11-7-11Z"/></svg>);
    default:
      return (<svg {...common}><circle cx="12" cy="12" r="8"/></svg>);
  }
};

Object.assign(window, { Ico, FoodIco });
