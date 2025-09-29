import { useAppSelector } from "@/store/hooks";
import { useEffect, useRef } from "react";

export default function ChatHistory() {
  const { candidates, currentInterview } = useAppSelector((state) => state.interview);
  const currentCandidate = candidates.find(c => c.id === currentInterview.candidateId);
  const chatHistory = currentCandidate?.chatHistory || [];
  
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  return (
    <div className="space-y-4 h-[400px] overflow-y-auto pr-4">
      {chatHistory.map((message, index) => (
        <div
          key={index}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg ${
              message.role === 'user'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted'
            }`}
          >
            {message.content}
          </div>
        </div>
      ))}
      <div ref={endOfMessagesRef} />
    </div>
  );
}
