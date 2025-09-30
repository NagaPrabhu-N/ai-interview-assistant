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
            <div className="space-y-3">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter password..."
                className="w-full h-12 text-base"
                autoComplete="current-password"
                autoFocus
              />
              {error && (
                <p className="text-sm text-destructive text-center mt-3">
                  {error}
                </p>
              )}
            </div>
            <Button 
              onClick={handleSubmit} 
              className="w-full h-12 text-base font-medium"
              size="default"
            >
              Unlock
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}