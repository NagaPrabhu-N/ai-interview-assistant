import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SetRoleDialogProps {
  onSetRole: (role: string) => void;
  currentRole: string;
}

export default function SetRoleDialog({ onSetRole, currentRole }: SetRoleDialogProps) {
  const [roleInput, setRoleInput] = useState(currentRole);
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = () => {
    if (roleInput.trim()) {
      onSetRole(roleInput.trim());
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Set Interview Role</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Set Interview Role</DialogTitle>
          <DialogDescription>
            Specify the job role to generate tailored interview questions.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              Role
            </Label>
            <Input
              id="role"
              value={roleInput}
              onChange={(e) => setRoleInput(e.target.value)}
              className="col-span-3"
              placeholder="e.g., Senior Frontend Developer"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Save Role</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
