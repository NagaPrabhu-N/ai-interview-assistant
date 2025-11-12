import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { submitAnswer, moveToNextQuestion } from "@/store/interviewSlice";
import { useEffect, useState } from "react";

const formatTime = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export default function InterviewTimer() {
  const dispatch = useAppDispatch();
  const { currentInterview } = useAppSelector(state => state.interview);

  const { status, currentQuestionIndex, questions, questionsReady } = currentInterview;

  // FIXED: Only get current question if questions are ready and available
  const currentQuestion = 
    status === 'in-progress' &&
    questionsReady &&
    Array.isArray(questions) &&
    questions.length > currentQuestionIndex &&
    currentQuestionIndex < questions.length
      ? questions[currentQuestionIndex]
      : undefined;

  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [hasTimerExpired, setHasTimerExpired] = useState(false); // NEW: Track if timer has expired

  // FIXED: Reset timer when question changes and questions are ready
  useEffect(() => {
    if (currentQuestion && questionsReady) {
      setTimeLeft(currentQuestion.timeLimit);
      setIsTimerActive(true);
      setHasTimerExpired(false); // Reset expiry flag
      // console.log(`Timer set for question ${currentQuestionIndex + 1}: ${currentQuestion.timeLimit} seconds`);
    } else {
      setIsTimerActive(false);
      setTimeLeft(0);
      setHasTimerExpired(false);
    }
  }, [currentQuestion, questionsReady, currentQuestionIndex]);

  // FIXED: Timer countdown logic with improved expiry handling
  useEffect(() => {
    if (!isTimerActive || status !== 'in-progress' || !currentQuestion) {
      return;
    }

    if (timeLeft <= 0 && !hasTimerExpired) {
      // Handle timer expiry ONCE
      setHasTimerExpired(true);
      setIsTimerActive(false);

      console.log(`Time expired for question ${currentQuestionIndex + 1}`);

      // Submit answer for current question
      dispatch(submitAnswer({ 
        question: currentQuestion.text, 
        answer: "No answer provided (time ran out)." 
      }));

      // Move to next question after a brief delay
      setTimeout(() => {
        if (currentQuestionIndex + 1 < 6) {
          dispatch(moveToNextQuestion());
        }
      }, 200);

      return;
    }

    if (timeLeft > 0) {
      const intervalId = setInterval(() => {
        setTimeLeft(prevTime => {
          const newTime = prevTime - 1;
          return newTime;
        });
      }, 1000);

      return () => clearInterval(intervalId);
    }
  }, [timeLeft, status, currentQuestion, dispatch, isTimerActive, currentQuestionIndex, hasTimerExpired]);

  // Display logic
  if (status !== 'in-progress' || !questionsReady) {
    return (
      <div className="flex items-center justify-between text-lg p-2 border rounded-md text-muted-foreground">
        <span>Time Left:</span>
        <span className="font-semibold text-xl">--:--</span>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-between text-lg p-2 border rounded-md text-muted-foreground">
        <span>Time Left:</span>
        <span className="font-semibold text-xl">Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between text-lg p-2 border rounded-md">
      <span>Time Left:</span>
      <span className={`font-semibold text-xl ${timeLeft <= 10 ? 'text-red-500' : timeLeft <= 30 ? 'text-yellow-500' : ''}`}>
        {formatTime(timeLeft)}
      </span>
    </div>
  );
}