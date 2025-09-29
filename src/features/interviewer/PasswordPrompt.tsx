import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PasswordPromptProps {
  onUnlock: () => void;
}

// For this example, the password is hardcoded.
// In a real application, this should come from an environment variable.
const CORRECT_PASSWORD = "admin";

export default function PasswordPrompt({ onUnlock }: PasswordPromptProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (password === CORRECT_PASSWORD) {
      setError(null);
      onUnlock();
    } else {
      setError("Incorrect password. Please try again.");
      setPassword("");
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="flex items-center justify-center pt-16">
      <Card className="w-[380px]">
        <CardHeader>
          <CardTitle>Access Restricted</CardTitle>
          <CardDescription>Enter the password to view the interviewer dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter password..."
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <Button onClick={handleSubmit} className="w-full">
            Unlock
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
