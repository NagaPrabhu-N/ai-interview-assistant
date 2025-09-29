import { Card, CardContent } from "@/components/ui/card";
import ResumeUploader from "./ResumeUploader";
import CandidateInfo from "./CandidateInfo";
import InterviewTimer from "./InterviewTimer";
import ChatHistory from "./ChatHistory";
import ChatInput from "./ChatInput";
import { useAppDispatch, useAppSelector } from "@/store/hooks"; // Make sure hooks are imported
import { Button } from "@/components/ui/button";
import ChatLogicManager from "./ChatLogicManager"; // <-- Import the new component

export default function IntervieweeView() {
    const dispatch = useAppDispatch();

  return (
    <> {/* Use a React Fragment to wrap both components */}
      <ChatLogicManager /> {/* This component handles the chat logic */}
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel */}
            <div className="lg:col-span-1 space-y-6">
              <ResumeUploader />
              <CandidateInfo />
              <InterviewTimer />
            </div>


            {/* Right Panel (Chat) */}
            <div className="lg:col-span-2 flex flex-col">
              <div className="flex-grow">
                <ChatHistory />
              </div>
              <ChatInput />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
