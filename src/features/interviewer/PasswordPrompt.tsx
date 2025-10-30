import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PasswordPromptProps {
  onUnlock: () => void;
}

const CORRECT_PASSWORD = "admin";

export default function PasswordPrompt({ onUnlock }: PasswordPromptProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (password === CORRECT_PASSWORD) {
      setError(null);
      onUnlock();
    } else {
      setError("Incorrect password. Please try again.");
      setPassword("");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4 md:w[50rem]">
      <div className="w-full max-w-md mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="space-y-3 text-center">
            <CardTitle className="text-2xl font-bold">Access Restricted</CardTitle>
            <CardDescription className="text-base">
              Enter the password to view the interviewer dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <form onSubmit={handleSubmit} autoComplete="on" className="space-y-6">
              {/* Hidden username field to satisfy password form heuristics */}
              <input
                type="text"
                id="username"
                name="username"
                autoComplete="username"
                style={{ display: "none" }}
                aria-hidden="true"
                tabIndex={-1}
              />
              <div className="space-y-3">
                <Label htmlFor="current-password" className="text-sm font-medium">
                  Password
                </Label>
                <Input
                  id="current-password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password..."
                  className="w-full h-12 text-base"
                  autoComplete="current-password"
                  autoFocus
                  required
                />
                {error && (
                  <p className="text-sm text-destructive text-center mt-3">
                    {error}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full h-12 text-base font-medium" size="default">
                Unlock
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
