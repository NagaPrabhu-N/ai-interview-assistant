import { useState, useEffect, useRef } from "react";
import { Toaster } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeProvider } from "./components/theme-provider";
import IntervieweeView from "./features/interviewee/IntervieweeView";
import InterviewerView from "./features/interviewer/InterviewerView"; 
import PasswordPrompt from "./features/interviewer/PasswordPrompt";
import WelcomeBackModal from "./features/interviewee/WelcomeBackModal";
import { useAppSelector } from "./store/hooks";

function App() {
  const [isInterviewerUnlocked, setIsInterviewerUnlocked] = useState(false);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [activeTab, setActiveTab] = useState("interviewee");
  const isInitialLoad = useRef(true);
  const interviewStatus = useAppSelector(state => state.interview.currentInterview.status);

  useEffect(() => {
    if (isInitialLoad.current) {
      if (interviewStatus === 'in-progress' || interviewStatus === 'collecting-info') {
        setShowWelcomeBack(true);
      }
      isInitialLoad.current = false;
    }
  }, [interviewStatus]);

  useEffect(() => {
    if (activeTab !== 'interviewer') {
      setIsInterviewerUnlocked(false);
    }
  }, [activeTab]);

  const handleUnlock = () => {
    setIsInterviewerUnlocked(true);
  };
  
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="bg-background text-foreground w-full md:ml-[15rem] min-h-screen">
        <WelcomeBackModal
          isOpen={showWelcomeBack}
          onContinue={() => setShowWelcomeBack(false)}
          onStartNew={() => setShowWelcomeBack(false)}
        />
        <div className="w-full p-4 md:p-6">
          <header className="mb-6 md:w-[60rem] w-full text-center">
            <h1 className="text-4xl font-bold tracking-tight">AI Interview Assistant</h1>
            <p className="text-muted-foreground mt-2">
              Conduct automated, AI-powered technical interviews.
            </p>
          </header>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid md:w-[60rem] w-full grid-cols-2">
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
        </div>
      </div>
      <Toaster richColors />
    </ThemeProvider>
  );
}

export default App;