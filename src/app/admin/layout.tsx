export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-root min-h-dvh">
      <style>{`
        .admin-root {
          color-scheme: light;
          --surface-1: #fcfcfb;
          --page-plane: #f9f9f7;
          --text-primary: #0b0b0b;
          --text-secondary: #52514e;
          --muted: #898781;
          --gridline: #e1e0d9;
          --border: rgba(11,11,11,0.10);
          --series-1: #2a78d6;
          --series-1-soft: #cde2fb;
          background: var(--page-plane);
          color: var(--text-primary);
        }
        @media (prefers-color-scheme: dark) {
          :root:not([data-theme="light"]) .admin-root {
            color-scheme: dark;
            --surface-1: #1a1a19;
            --page-plane: #0d0d0d;
            --text-primary: #ffffff;
            --text-secondary: #c3c2b7;
            --muted: #898781;
            --gridline: #2c2c2a;
            --border: rgba(255,255,255,0.10);
            --series-1: #3987e5;
            --series-1-soft: #184f95;
          }
        }
        :root[data-theme="dark"] .admin-root {
          color-scheme: dark;
          --surface-1: #1a1a19;
          --page-plane: #0d0d0d;
          --text-primary: #ffffff;
          --text-secondary: #c3c2b7;
          --muted: #898781;
          --gridline: #2c2c2a;
          --border: rgba(255,255,255,0.10);
          --series-1: #3987e5;
          --series-1-soft: #184f95;
        }
      `}</style>
      {children}
    </div>
  );
}
