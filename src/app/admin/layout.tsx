export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-root min-h-dvh">
      <style>{`
        .admin-root {
          color-scheme: light;
          --surface-1: #ffffff;
          --page-plane: #fff9f2;
          --text-primary: #0a0a0b;
          --text-secondary: #52525b;
          --muted: #a1a1aa;
          --gridline: #e4e4e7;
          --border: rgba(10,10,11,0.12);
          --series-1: #16a34a;
          --series-1-soft: #dcfce7;
          background: var(--page-plane);
          color: var(--text-primary);
        }
      `}</style>
      {children}
    </div>
  );
}
