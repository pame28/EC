import { useState } from "react";
import {
  Menu, X, Search, Bell, ChevronDown, LayoutDashboard, Users,
  UserCog, BarChart3, Settings, LogOut, Plus, Pencil, Trash2,
  RotateCcw, ArrowRight, Check
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  1. DESIGN TOKENS                                                   */
/*  Single source of truth for the brand palette + scale.              */
/*  In a real project this file becomes src/design-system/tokens.js    */
/* ------------------------------------------------------------------ */
const tokens = {
  color: {
    azulExperto: "#003865",
    azulFinanciero: "#2D8C9E",
    aquaDigital: "#00C1D4",
    amarilloOptimista: "#FFB81C",
    amarilloEmpatico: "#FDD26E",
    blanco: "#FFFFFF",
    grisNeutro: "#9EA2A2",
  },
  radius: { sm: "6px", md: "10px", lg: "16px" },
  shadow: "0 1px 2px rgba(0,56,101,0.06), 0 1px 3px rgba(0,56,101,0.08)",
};

/* ------------------------------------------------------------------ */
/*  2. GLOBAL CSS — hover/focus states live here because inline        */
/*  styles can't express pseudo-classes. In a real project this is     */
/*  design-system/tokens.css, imported once at the app root.           */
/* ------------------------------------------------------------------ */
const globalCss = `
  .ds-root {
    --navy: ${tokens.color.azulExperto};
    --blue-fin: ${tokens.color.azulFinanciero};
    --aqua: ${tokens.color.aquaDigital};
    --gold: ${tokens.color.amarilloOptimista};
    --gold-soft: ${tokens.color.amarilloEmpatico};
    --white: ${tokens.color.blanco};
    --gray: ${tokens.color.grisNeutro};
    font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: var(--navy);
    background: #F5F7F8;
  }

  /* ---- Buttons ---- */
  .btn { display:inline-flex; align-items:center; justify-content:center; gap:8px;
    border-radius:${tokens.radius.sm}; font-weight:600; cursor:pointer;
    border:1.5px solid transparent; transition: background .15s ease, border-color .15s ease, color .15s ease, transform .05s ease;
    white-space:nowrap; }
  .btn:active { transform: translateY(1px); }
  .btn:disabled { opacity:.45; cursor:not-allowed; transform:none; }
  .btn-sm { padding:6px 12px; font-size:13px; }
  .btn-md { padding:10px 18px; font-size:14px; }
  .btn-lg { padding:13px 24px; font-size:15px; }

  .btn-primary { background:var(--gold); color:var(--navy); border-color:var(--gold); }
  .btn-primary:hover:not(:disabled) { background:#E8A70F; border-color:#E8A70F; }

  .btn-secondary { background:var(--white); color:var(--navy); border-color:var(--navy); }
  .btn-secondary:hover:not(:disabled) { background:rgba(0,56,101,0.06); }

  .btn-tertiary { background:transparent; color:var(--blue-fin); border-color:transparent; padding-left:4px; padding-right:4px; }
  .btn-tertiary:hover:not(:disabled) { color:var(--navy); text-decoration:underline; }

  /* ---- Inputs ---- */
  .field { display:flex; flex-direction:column; gap:6px; }
  .field label { font-size:13px; font-weight:600; color:var(--navy); }
  .field input, .field select {
    height:38px; border-radius:${tokens.radius.sm}; border:1.5px solid #DCE1E3;
    padding:0 12px; font-size:14px; color:var(--navy); background:var(--white);
    outline:none; transition:border-color .15s ease, box-shadow .15s ease;
  }
  .field input::placeholder { color:var(--gray); }
  .field input:focus, .field select:focus {
    border-color:var(--aqua); box-shadow:0 0 0 3px rgba(0,193,212,0.18);
  }

  /* ---- Nav ---- */
  .navlink { display:flex; align-items:center; gap:10px; padding:10px 14px; border-radius:${tokens.radius.sm};
    color:rgba(255,255,255,0.78); font-size:14px; font-weight:600; cursor:pointer; border-left:3px solid transparent; }
  .navlink:hover { background:rgba(255,255,255,0.06); color:var(--white); }
  .navlink.active { background:rgba(0,193,212,0.14); color:var(--white); border-left-color:var(--aqua); }

  .icon-btn { display:inline-flex; align-items:center; justify-content:center; width:36px; height:36px;
    border-radius:${tokens.radius.sm}; border:none; background:transparent; color:var(--navy); cursor:pointer; }
  .icon-btn:hover { background:rgba(0,56,101,0.06); }

  .card { background:var(--white); border:1px solid #E3E7E8; border-radius:${tokens.radius.md}; }

  @media (max-width: 860px) {
    .ds-sidebar { position:fixed; left:0; top:64px; bottom:0; z-index:40;
      transform:translateX(-100%); transition:transform .2s ease; }
    .ds-sidebar.open { transform:translateX(0); box-shadow:2px 0 12px rgba(0,0,0,0.18); }
    .ds-overlay { position:fixed; inset:64px 0 0 0; background:rgba(0,20,35,0.35); z-index:35; }
  }
`;

/* ------------------------------------------------------------------ */
/*  3. PRIMITIVES — Typography                                         */
/*  In a real project: design-system/components/Typography.jsx         */
/* ------------------------------------------------------------------ */
function Heading({ level = 1, children, style }) {
  const Tag = `h${level}`;
  const sizes = { 1: 30, 2: 24, 3: 19, 4: 16 };
  return (
    <Tag style={{
      margin: 0, color: tokens.color.azulExperto, fontWeight: 700,
      letterSpacing: "-0.01em", lineHeight: 1.25,
      fontSize: sizes[level] || 16, ...style,
    }}>
      {children}
    </Tag>
  );
}

function Text({ variant = "body", children, style }) {
  const map = {
    body: { fontSize: 15, color: "#33475B", lineHeight: 1.6 },
    muted: { fontSize: 13.5, color: tokens.color.grisNeutro, lineHeight: 1.5 },
    label: { fontSize: 12.5, color: tokens.color.azulExperto, fontWeight: 700, letterSpacing: "0.02em" },
  };
  return <p style={{ margin: 0, ...map[variant], ...style }}>{children}</p>;
}

/* ------------------------------------------------------------------ */
/*  4. PRIMITIVES — Button                                              */
/*  In a real project: design-system/components/Button.jsx             */
/*  API: <Button variant="primary|secondary|tertiary" size="sm|md|lg">  */
/* ------------------------------------------------------------------ */
function Button({ variant = "primary", size = "md", icon: Icon, children, ...props }) {
  return (
    <button className={`btn btn-${variant} btn-${size}`} {...props}>
      {Icon && <Icon size={16} strokeWidth={2.25} />}
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  5. PRIMITIVES — Badge (mirrors Activo / Vacaciones / Inactivo)      */
/* ------------------------------------------------------------------ */
function Badge({ status = "activo", children }) {
  const styles = {
    activo:     { bg: "rgba(0,193,212,0.14)", fg: "#00707D" },
    vacaciones: { bg: "rgba(253,210,110,0.28)", fg: "#8A5A00" },
    inactivo:   { bg: "rgba(158,162,162,0.20)", fg: "#5C5F5F" },
  };
  const s = styles[status] || styles.inactivo;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: s.bg, color: s.fg, fontSize: 12.5, fontWeight: 700,
      padding: "4px 10px", borderRadius: 999,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: s.fg }} />
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  6. LAYOUT — Navbar                                                  */
/*  In a real project: design-system/components/Navbar.jsx             */
/* ------------------------------------------------------------------ */
function Navbar({ onMenuClick }) {
  return (
    <header style={{
      height: 64, background: tokens.color.azulExperto, display: "flex",
      alignItems: "center", justifyContent: "space-between", padding: "0 20px",
      position: "sticky", top: 0, zIndex: 50, borderBottom: `3px solid ${tokens.color.amarilloOptimista}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button className="icon-btn" style={{ color: "#fff", display: "none" }} id="ds-menu-btn" onClick={onMenuClick}>
          <Menu size={20} />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: tokens.color.amarilloOptimista,
            display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800,
            color: tokens.color.azulExperto, fontSize: 14,
          }}>eC</div>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 16, letterSpacing: "-0.01em" }}>eCoaching</span>
        </div>
      </div>

      <div style={{ flex: 1, maxWidth: 420, margin: "0 24px", position: "relative" }} className="ds-search">
        <Search size={16} color="rgba(255,255,255,0.55)" style={{ position: "absolute", left: 12, top: 10 }} />
        <input
          placeholder="Buscar equipo, usuario..."
          style={{
            width: "100%", height: 36, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.16)",
            borderRadius: 8, color: "#fff", fontSize: 13.5, padding: "0 12px 0 36px", outline: "none",
          }}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <button className="icon-btn" style={{ color: "#fff" }}><Bell size={19} /></button>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: 8, paddingLeft: 12, borderLeft: "1px solid rgba(255,255,255,0.16)" }}>
          <div style={{ textAlign: "right", display: "none" }} className="ds-user-meta">
            <div style={{ color: "#fff", fontSize: 13.5, fontWeight: 700 }}>Carlos Méndez</div>
            <div style={{ color: tokens.color.amarilloEmpatico, fontSize: 11.5, fontWeight: 700 }}>Administrador operativo</div>
          </div>
          <div style={{
            width: 34, height: 34, borderRadius: "50%", background: tokens.color.aquaDigital,
            display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, color: tokens.color.azulExperto,
          }}>CM</div>
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  7. LAYOUT — Sidebar                                                 */
/*  In a real project: design-system/components/Sidebar.jsx            */
/* ------------------------------------------------------------------ */
const NAV_ITEMS = [
  { key: "dashboard", label: "Panel general", icon: LayoutDashboard },
  { key: "usuarios", label: "Mantenimiento de usuarios", icon: Users },
  { key: "lideres", label: "Mantenimiento de líder", icon: UserCog },
  { key: "reportes", label: "Reportes", icon: BarChart3 },
  { key: "config", label: "Configuración", icon: Settings },
];

function Sidebar({ open, active, onSelect }) {
  return (
    <>
      {open && <div className="ds-overlay" />}
      <aside className={`ds-sidebar ${open ? "open" : ""}`} style={{
        width: 250, background: tokens.color.azulExperto, minHeight: "calc(100vh - 64px)",
        padding: "18px 12px", display: "flex", flexDirection: "column", gap: 4,
      }}>
        <Text variant="label" style={{ color: "rgba(255,255,255,0.5)", padding: "6px 14px 4px" }}>MÓDULO</Text>
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
          <div key={key} className={`navlink ${active === key ? "active" : ""}`} onClick={() => onSelect(key)}>
            <Icon size={17} strokeWidth={2.25} />
            {label}
          </div>
        ))}
        <div style={{ marginTop: "auto", borderTop: "1px solid rgba(255,255,255,0.12)", paddingTop: 10 }}>
          <div className="navlink"><LogOut size={17} /> Cerrar sesión</div>
        </div>
      </aside>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  8. COMPOSITE EXAMPLE — Team card (built from the primitives above)  */
/* ------------------------------------------------------------------ */
function TeamCard({ area, name, leader, members }) {
  return (
    <div className="card" style={{ padding: 18, boxShadow: tokens.shadow }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Text variant="label" style={{ color: tokens.color.azulFinanciero }}>{area}</Text>
        <div style={{ display: "flex", gap: 4 }}>
          <button className="icon-btn"><Pencil size={15} /></button>
          <button className="icon-btn"><Trash2 size={15} /></button>
        </div>
      </div>
      <Heading level={3} style={{ marginTop: 6 }}>{name}</Heading>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%", background: tokens.color.azulFinanciero,
            color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13,
          }}>{leader.split(" ").map(w => w[0]).slice(0, 2).join("")}</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: tokens.color.azulExperto }}>{leader}</div>
            <Text variant="muted">Líder del equipo</Text>
          </div>
        </div>
        <Button variant="tertiary" size="sm">Cambiar líder</Button>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18, marginBottom: 8 }}>
        <Text variant="label">Miembros ({members.length})</Text>
        <Button variant="primary" size="sm" icon={Plus}>Agregar</Button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {members.map((m) => (
          <div key={m.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", borderRadius: 8, background: "#F5F7F8" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%", background: tokens.color.aquaDigital,
                color: tokens.color.azulExperto, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 11.5,
              }}>{m.name.split(" ").map(w => w[0]).slice(0, 2).join("")}</div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: tokens.color.azulExperto }}>{m.name}</div>
                <Text variant="muted">{m.role}</Text>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Badge status={m.status}>{m.statusLabel}</Badge>
              <button className="icon-btn"><RotateCcw size={14} /></button>
              <button className="icon-btn"><X size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  9. SHOWCASE PAGE — demonstrates every piece together                */
/* ------------------------------------------------------------------ */
function Swatch({ hex, name }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ height: 56, borderRadius: 10, background: hex, border: "1px solid rgba(0,0,0,0.06)" }} />
      <Text variant="body" style={{ fontSize: 13, fontWeight: 700 }}>{name}</Text>
      <Text variant="muted" style={{ fontSize: 12 }}>{hex}</Text>
    </div>
  );
}

export default function DesignSystemDemo() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [active, setActive] = useState("lideres");

  return (
    <div className="ds-root">
      <style>{globalCss}</style>
      <Navbar onMenuClick={() => setSidebarOpen((v) => !v)} />

      <div style={{ display: "flex" }}>
        <Sidebar open={sidebarOpen} active={active} onSelect={(k) => { setActive(k); setSidebarOpen(false); }} />

        <main style={{ flex: 1, padding: "28px 24px", maxWidth: 1180, margin: "0 auto", width: "100%" }}>
          <div style={{ marginBottom: 24 }}>
            <Heading level={1}>Sistema de diseño — eCoaching</Heading>
            <Text variant="body" style={{ marginTop: 6, maxWidth: 640 }}>
              Componentes base listos para usar en cualquier módulo: solo importa el objeto,
              pásale las props y mantiene la identidad visual sin repetir estilos.
            </Text>
          </div>

          {/* Colors */}
          <section style={{ marginBottom: 32 }}>
            <Heading level={2} style={{ marginBottom: 4 }}>Paleta de colores</Heading>
            <Text variant="muted" style={{ marginBottom: 14 }}>Tokens definidos una sola vez y reutilizados en todos los componentes.</Text>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 14 }}>
              <Swatch hex={tokens.color.azulExperto} name="Azul experto" />
              <Swatch hex={tokens.color.azulFinanciero} name="Azul financiero" />
              <Swatch hex={tokens.color.aquaDigital} name="Aqua digital" />
              <Swatch hex={tokens.color.amarilloOptimista} name="Amarillo optimista" />
              <Swatch hex={tokens.color.amarilloEmpatico} name="Amarillo empático" />
              <Swatch hex={tokens.color.grisNeutro} name="Gris neutro" />
            </div>
          </section>

          {/* Typography */}
          <section style={{ marginBottom: 32 }} className="card" >
            <div style={{ padding: 20 }}>
              <Heading level={2} style={{ marginBottom: 14 }}>Tipografía</Heading>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <Heading level={1}>Heading level 1 — 30px / 700</Heading>
                <Heading level={2}>Heading level 2 — 24px / 700</Heading>
                <Heading level={3}>Heading level 3 — 19px / 700</Heading>
                <Heading level={4}>Heading level 4 — 16px / 700</Heading>
                <Text variant="body">Body text — 15px / 400. Úsalo para párrafos y contenido general de las pantallas.</Text>
                <Text variant="muted">Texto secundario / muted — para ayudas, fechas y metadatos.</Text>
                <Text variant="label">ETIQUETA — 12.5px / 700 / letter-spacing</Text>
              </div>
            </div>
          </section>

          {/* Buttons */}
          <section style={{ marginBottom: 32 }} className="card">
            <div style={{ padding: 20 }}>
              <Heading level={2} style={{ marginBottom: 4 }}>Botones</Heading>
              <Text variant="muted" style={{ marginBottom: 16 }}>Tres niveles de énfasis, tres tamaños.</Text>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", marginBottom: 12 }}>
                <Button variant="primary" size="lg" icon={Check}>Primario</Button>
                <Button variant="secondary" size="lg">Secundario</Button>
                <Button variant="tertiary" size="lg" icon={ArrowRight}>Terciario</Button>
                <Button variant="primary" size="lg" disabled>Deshabilitado</Button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
                <Button variant="primary" size="sm">Chico</Button>
                <Button variant="primary" size="md">Mediano</Button>
                <Button variant="primary" size="lg">Grande</Button>
              </div>
            </div>
          </section>

          {/* Form + badges */}
          <section style={{ marginBottom: 32, display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 20 }} className="ds-grid-2">
            <div className="card" style={{ padding: 20 }}>
              <Heading level={2} style={{ marginBottom: 14 }}>Campos de formulario</Heading>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div className="field">
                  <label>Nombre del equipo</label>
                  <input placeholder="Ej. Equipo La Ceiba A" />
                </div>
                <div className="field">
                  <label>Área</label>
                  <select><option>HN - Agencias</option><option>HN - Sucursales</option></select>
                </div>
              </div>
            </div>
            <div className="card" style={{ padding: 20 }}>
              <Heading level={2} style={{ marginBottom: 14 }}>Estados / badges</Heading>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <Badge status="activo">Activo</Badge>
                <Badge status="vacaciones">Vacaciones</Badge>
                <Badge status="inactivo">Inactivo</Badge>
              </div>
            </div>
          </section>

          {/* Composite example */}
          <section>
            <Heading level={2} style={{ marginBottom: 4 }}>Componente compuesto de ejemplo</Heading>
            <Text variant="muted" style={{ marginBottom: 16 }}>Armado 100% con los primitivos de arriba — así se ven combinados en una pantalla real.</Text>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 18 }}>
              <TeamCard
                area="HN - Agencias" name="Equipo La Ceiba A" leader="Ana Rodríguez"
                members={[
                  { name: "Jorge Flores", role: "Cajero — La Ceiba", status: "activo", statusLabel: "Activo" },
                  { name: "Miguel Torres", role: "Cajero — La Ceiba", status: "vacaciones", statusLabel: "Vacaciones" },
                  { name: "Pedro Álvarez", role: "Cajero — Tegucigalpa Norte", status: "inactivo", statusLabel: "Inactivo" },
                ]}
              />
              <TeamCard
                area="HN - Agencias" name="Equipo SPS Norte" leader="Jorge Mendoza"
                members={[
                  { name: "Patricia Reyes", role: "Asesora — SPS", status: "activo", statusLabel: "Activo" },
                  { name: "Sofía Gutiérrez", role: "Asesora — SPS Sur", status: "activo", statusLabel: "Activo" },
                ]}
              />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
