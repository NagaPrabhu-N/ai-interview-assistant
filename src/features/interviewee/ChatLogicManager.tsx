import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { 
  addChatMessage, 
  updateCurrentCandidateDetails, 
  setInterviewInProgress, 
  generateAllQuestions, 
  processInterviewResults 
} from "@/store/interviewSlice";
import { useEffect } from "react";

export default function ChatLogicManager() {
  const dispatch = useAppDispatch();
  const { candidates, currentInterview, role } = useAppSelector(state => state.interview);
  const currentCandidate = candidates.find(c => c.id === currentInterview.candidateId);
  
  const chatHistory = currentCandidate?.chatHistory || [];

  // Hook 1: Manages info-gathering phase (unchanged)
  useEffect(() => {
    if (!currentCandidate || currentInterview.status !== 'collecting-info') return;

    const lastMessage = chatHistory[chatHistory.length - 1];
    
    if (lastMessage?.role === 'bot') return;

    if (lastMessage?.role === 'user') {
      const botMessages = chatHistory.filter(m => m.role === 'bot');
      const lastBotMessage = botMessages[botMessages.length - 1];

      if (lastBotMessage?.content?.includes("full name")) {
        dispatch(updateCurrentCandidateDetails({ name: lastMessage.content }));
        return;
      }
      if (lastBotMessage?.content?.includes("email address")) {
        dispatch(updateCurrentCandidateDetails({ email: lastMessage.content }));
        return;
      }
      if (lastBotMessage?.content?.includes("phone number")) {
        dispatch(updateCurrentCandidateDetails({ phone: lastMessage.content }));
        return;
      }
    }

    if (!currentCandidate.name) {
      if (lastMessage?.content !== "Hello! I couldn't find a name on your resume. What is your full name?") {
        dispatch(addChatMessage({ role: 'bot', content: "Hello! I couldn't find a name on your resume. What is your full name?" }));
      }
    } else if (!currentCandidate.email) {
      if (lastMessage?.content !== `Thanks, ${currentCandidate.name}. What is your email address?`) {
        dispatch(addChatMessage({ role: 'bot', content: `Thanks, ${currentCandidate.name}. What is your email address?` }));
      }
    } else if (!currentCandidate.phone) {
      if (lastMessage?.content !== "Great. And finally, what is your phone number?") {
        dispatch(addChatMessage({ role: 'bot', content: "Great. And finally, what is your phone number?" }));
      }
    }
  }, [currentCandidate, currentInterview.status, dispatch]);

  // Hook 2: Modified to generate all questions at once
  useEffect(() => {
    if (!currentCandidate) return;

    const { status, questions = [] } = currentInterview;
    const lastMessage = chatHistory[chatHistory.length - 1];

    // Transition from info-gathering to in-progress and generate all questions
    if (status === 'collecting-info' && currentCandidate.name && currentCandidate.email && currentCandidate.phone) {
      if (lastMessage?.content?.includes("begin the interview")) return;
      
      dispatch(addChatMessage({ role: 'bot', content: "Perfect, thank you! Let's begin the interview." }));
      dispatch(setInterviewInProgress());
      
      // Generate all questions at once
      dispatch(generateAllQuestions({ role }));
      return;
    }

    // Handle interview completion
    if (status === 'completed') {
      if (lastMessage?.content?.includes("processing your results")) return;
      dispatch(addChatMessage({ role: 'bot', content: "Thank you! I am now processing your results..." }));
      dispatch(processInterviewResults(currentCandidate.id));
    }
  }, [currentCandidate, currentInterview, role, dispatch]);

  return null;
}