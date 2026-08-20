"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/admin/Toast";
import PageHeader from "@/components/admin/PageHeader";
import { KeyRound } from "lucide-react";

export default function AdminProfilePage() {
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.resolve().then(() => {
      fetch("/api/admin/auth/me")
        .then((r) => r.json())
        .then((data) => setEmail(data.email || ""));
    });
  }, []);

  async function changePassword() {
    if (newPassword !== confirmPassword) {
      showToast("New passwords don't match.", "error");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not update password.");
      showToast("Password updated.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Something went wrong.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-[520px]">
      <PageHeader title="My Profile" description="Manage your admin account." />

      <div className="card p-6 mb-6">
        <span className="admin-label">Signed In As</span>
        <p className="text-ink font-medium mt-1">{email || "—"}</p>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <KeyRound size={17} color="var(--gold-dark)" />
          <h2 className="admin-section-title">Change Password</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="field-label">Current Password</label>
            <input className="field-input" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          </div>
          <div>
            <label className="field-label">New Password</label>
            <input className="field-input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <span className="field-hint">At least 8 characters.</span>
          </div>
          <div>
            <label className="field-label">Confirm New Password</label>
            <input className="field-input" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
          <button
            onClick={changePassword}
            disabled={saving || !currentPassword || !newPassword}
            className="btn btn-primary"
          >
            {saving ? "Updating…" : "Update Password"}
          </button>
        </div>
      </div>
    </div>
  );
}
