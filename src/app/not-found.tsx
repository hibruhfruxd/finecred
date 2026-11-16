import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/frontend/components/brand/Logo";

export default function NotFound() {
  return (
    <main className="not-found">
      <div className="not-found-card">
        <Logo />
        <p className="eyebrow">404</p>
        <h1>Page not found</h1>
        <p>
          This demo route does not exist. Return to the dashboard to continue the FinCred
          prototype journey.
        </p>
        <div className="not-found-actions">
          <Link href="/dashboard" className="btn btn-primary">
            <ArrowLeft size={16} aria-hidden="true" />
            Back to dashboard
          </Link>
          <Link href="/" className="btn btn-secondary">
            Public site
          </Link>
        </div>
      </div>
    </main>
  );
}
