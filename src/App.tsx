import { useState, useEffect, useRef } from "react"; // Import useState
import { Toaster } from "sonner"; // <-- CORRECTED IMPORT
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeProvider } from "./components/theme-provider";
import IntervieweeView from "./features/interviewee/IntervieweeView";
import InterviewerView from "./features/interviewer/InterviewerView"; 
import PasswordPrompt from "./features/interviewer/PasswordPrompt"; // Import the new component
import WelcomeBackModal from "./features/interviewee/WelcomeBackModal"; // Import the new modal
import { useAppSelector } from "./store/hooks"; // Import the selector hook



function App() {

    // State to manage if the interviewer tab has been unlocked
  const [isInterviewerUnlocked, setIsInterviewerUnlocked] = useState(false);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);

  // --- THE FIX: Track the active tab ---
  const [activeTab, setActiveTab] = useState("interviewee");

    // Ref to track if this is the initial load of the application
  const isInitialLoad = useRef(true);

  // Get the status of the current interview from the Redux store
  const interviewStatus = useAppSelector(state => state.interview.currentInterview.status);

  // Logic for the "Welcome Back" modal remains the same.
  useEffect(() => {
if (isInitialLoad.current) {
      // Check if the restored state has an interview in progress
      if (interviewStatus === 'in-progress' || interviewStatus === 'collecting-info') {
        setShowWelcomeBack(true);
      }
      // After the first check, set the ref to false so this block never runs again
      isInitialLoad.current = false;
    }
  }, [interviewStatus]);

    // --- THE FIX: Add an effect to re-lock the tab when the user switches away ---
  useEffect(() => {
    // If the user is no longer on the interviewer tab, reset the lock.
    if (activeTab !== 'interviewer') {
      setIsInterviewerUnlocked(false);
    }
  }, [activeTab]); // This effect runs whenever the active tab changes.


  // Callback function to be passed to the PasswordPrompt component
  const handleUnlock = () => {
    setIsInterviewerUnlocked(true);
  };
  
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="bg-background text-foreground min-h-screen p-4 md:p-8">
        <WelcomeBackModal
          isOpen={showWelcomeBack}
          onContinue={() => setShowWelcomeBack(false)}
          onStartNew={() => setShowWelcomeBack(false)}
        />
        <header className="max-w-5xl mx-auto mb-6">
          <h1 className="text-4xl font-bold tracking-tight">AI Interview Assistant</h1>
        <p className="text-muted-foreground mt-2">
          Conduct automated, AI-powered technical interviews.
        </p>
        </header>
        <main className="max-w-5xl mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="interviewee">Interviewee</TabsTrigger>
          <TabsTrigger value="interviewer">Interviewer</TabsTrigger>
        </TabsList>
        <TabsContent value="interviewee" className="mt-4">
          <IntervieweeView />
        </TabsContent>
        <TabsContent value="interviewer" className="mt-4">
          {isInterviewerUnlocked ? (
            <InterviewerView />
          ) : (
            <PasswordPrompt onUnlock={handleUnlock} />
          )}
        </TabsContent>
      </Tabs>

        </main>
      </div>
      <Toaster richColors />
    </ThemeProvider>
  );
}

export default App;
