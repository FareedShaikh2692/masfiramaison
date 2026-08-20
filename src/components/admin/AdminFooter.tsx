export default function AdminFooter() {
  return (
    <footer className="px-5 md:px-8 py-4 border-t border-border flex flex-wrap items-center justify-between gap-2 text-[0.76rem] text-text-muted">
      <span>© {new Date().getFullYear()} Masfira Maison — Admin Dashboard</span>
      <span>Version 1.0.0</span>
    </footer>
  );
}
