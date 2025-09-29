import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addChatMessage, submitAnswer, moveToNextQuestion } from "@/store/interviewSlice";

export default function ChatInput() {
  const [inputValue, setInputValue] = useState("");
  const dispatch = useAppDispatch();
  const { status, questions, currentQuestionIndex, questionsReady } = useAppSelector(state => state.interview.currentInterview);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || status === 'not-started' || status === 'completed') return;

    // Always add the user's message to the chat history
    dispatch(addChatMessage({ role: 'user', content: inputValue }));

    // FIXED: Only dispatch submitAnswer if the interview is actually in progress and questions are ready
    if (status === 'in-progress' && questionsReady) {
        const currentQuestion = questions[currentQuestionIndex];
        if (currentQuestion) {
            dispatch(submitAnswer({ question: currentQuestion.text, answer: inputValue }));
            
            // FIXED: Add slight delay before showing next question to prevent race conditions
            setTimeout(() => {
              if (currentQuestionIndex + 1 < 6) {
                dispatch(moveToNextQuestion());
              }
            }, 100);
        }
    }
    
    setInputValue("");
  };

  const isInputDisabled = status === 'not-started' || status === 'completed';

  return (
    <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2 mt-4">
      <Input
        type="text"
        placeholder={isInputDisabled ? "Interview has not started" : "Type your answer..."}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        disabled={isInputDisabled}
        autoFocus
      />
      <Button type="submit" size="icon" disabled={!inputValue.trim() || isInputDisabled}>
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}