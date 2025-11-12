// src/components/ConfirmDeleteWithPassword.tsx
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

// WARNING: Client-side checks are convenience only.
// For real security, pair with Auth + Firestore Rules / Cloud Functions.
const EXPECTED = import.meta.env.VITE_DELETE_PASSWORD;

interface ConfirmDeleteWithPasswordProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void> | void;
}

export default function ConfirmDeleteWithPassword({
  open,
  onOpenChange,
  onConfirm,
}: ConfirmDeleteWithPasswordProps) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleConfirm = async () => {
    if (pw !== EXPECTED) {
      setErr("Incorrect password. Please try again.");
      return;
    }
    setErr(null);
    setBusy(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setBusy(false);
      setPw("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!busy) onOpenChange(v); }}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Confirm deletion</DialogTitle>
          <DialogDescription>
            Enter the owner password to clear all candidate data. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-2">
          <Label htmlFor="delete-password">Password</Label>
          <Input
            id="delete-password"
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Enter password..."
            autoFocus
          />
          {err && <p className="text-sm text-destructive">{err}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={busy}>
            {busy ? "Deleting..." : "Confirm Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
