export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-root min-h-dvh">
      <style>{`
        .admin-root {
          color-scheme: dark;
          --surface-1: #141416;
          --page-plane: #0a0a0b;
          --text-primary: #ffffff;
          --text-secondary: #a1a1aa;
          --muted: #71717a;
          --gridline: #232326;
          --border: rgba(255,255,255,0.10);
          --series-1: #22c55e;
          --series-1-soft: #14351f;
          background: var(--page-plane);
          color: var(--text-primary);
        }
      `}</style>
      {children}
    </div>
  );
}
