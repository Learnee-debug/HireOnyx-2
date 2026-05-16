export default function Footer() {
  return (
    <footer className="bg-surface-container-lowest border-t border-border-default">
      <div className="max-w-[1440px] mx-auto px-margin-page py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <span className="font-mono font-bold text-[13px] text-text-primary tracking-tight">HireOnyx</span>
          <span className="font-mono text-[11px] text-text-muted">© 2024 HireOnyx. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-6 text-body-sm">
          <a href="#" className="text-text-secondary hover:text-primary transition-colors underline underline-offset-2">Privacy</a>
          <a href="#" className="text-text-secondary hover:text-primary transition-colors underline underline-offset-2">Terms</a>
          <a href="#" className="text-text-secondary hover:text-primary transition-colors underline underline-offset-2">Cookie Policy</a>
        </div>
      </div>
    </footer>
  );
}
