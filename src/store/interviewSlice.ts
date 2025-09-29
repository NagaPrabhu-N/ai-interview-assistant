import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

// --- Interfaces and Initial State (with new `role` property) ---
interface Question {
  text: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeLimit: number;
}
export interface Candidate {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  score: number | null;
  summary: string | null;
  status: 'Interviewed' | 'Hired' | 'Rejected';
  chatHistory: { role: 'bot' | 'user'; content: string }[];
}
interface InterviewState {
  candidates: Candidate[];
  role: string; // <-- ADDED: The role for the interview questions
  currentInterview: {
    status: 'not-started' | 'collecting-info' | 'in-progress' | 'completed';
    candidateId: string | null;
    questions: Question[];
    currentQuestionIndex: number;
    answers: { question: string; answer: string }[];
    timer: number;
    questionsReady: boolean; // NEW: Track if questions are ready
  };
}
const initialState: InterviewState = {
  candidates: [],
  role: "Full Stack (React/Node) Developer", // <-- ADDED: Default role
  currentInterview: {
    status: 'not-started',
    candidateId: null,
    questions: [],
    currentQuestionIndex: 0,
    answers: [],
    timer: 0,
    questionsReady: false, // NEW: Initialize as false
  },
};
interface StartPayload {
  name: string | null;
  email: string | null;
  phone: string | null;
}
const MOCK_QUESTIONS = [
    { text: "(Fallback) What is the CSS Box Model?", difficulty: 'Easy' as 'Easy', timeLimit: 20 },
    { text: "(Fallback) Explain `var`, `let`, and `const` in JavaScript.", difficulty: 'Easy' as 'Easy', timeLimit: 20 },
    { text: "(Fallback) What are the main features of React Hooks?", difficulty: 'Medium' as 'Medium', timeLimit: 60 },
    { text: "(Fallback) Describe the JavaScript Event Loop.", difficulty: 'Medium' as 'Medium', timeLimit: 60 },
    { text: "(Fallback) What are the pros and cons of a microservices architecture?", difficulty: 'Hard' as 'Hard', timeLimit: 120 },
    { text: "(Fallback) Explain how Server-Side Rendering (SSR) works in a web application.", difficulty: 'Hard' as 'Hard', timeLimit: 120 },
];
const DUMMY_SCORING_RESULT = {
  score: 82,
  summary: "(Fallback) The candidate demonstrated a solid understanding of fundamental concepts. Further probing on system design would be beneficial.",
  status: 'Hired'
};

// --- Helper function for retries ---
const fetchWithRetry = async (
  url: string,
  options: RequestInit,
  retries = 5,
  delay = 1000
): Promise<Response> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, options);

      // Retry only if status is 503 (Service Unavailable) or 500 (Internal Server Error)
      if (![500, 503].includes(response.status)) {
        return response; // success or other error → return as-is
      }

      if (attempt === retries) {
        throw new Error(`Max retries reached for Gemini API. Last status: ${response.status}`);
      }

      console.warn(`Attempt ${attempt} failed with ${response.status}. Retrying in ${delay * attempt}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay * attempt)); // exponential backoff
    } catch (err) {
      // This handles fetch-level errors (e.g., network down, DNS failure)
      if (attempt === retries) {
        throw new Error(`Fetch failed after ${retries} attempts: ${err}`);
      }
      console.warn(`Attempt ${attempt} threw error. Retrying in ${delay * attempt}ms...`, err);
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  throw new Error("Unexpected error in retry logic");
};

// --- Helper function ---
const cleanGeminiResponse = (text: string) => {
  return text.replace(/``````/g, "").trim();
};

export const processInterviewResults = createAsyncThunk(
  'interview/processResults',
  async (candidateId: string, { getState }) => {
    try {
      const state = getState() as { interview: InterviewState };
      const answers = state.interview.currentInterview.answers;
      if (!answers || answers.length === 0) throw new Error('No answers to process.');

      const fullTranscript = answers.map(a => `Q: ${a.question}\nA: ${a.answer}`).join('\n\n');
      const prompt = `Evaluate this interview transcript for a "full stack" role. Transcript: --- ${fullTranscript} --- Respond with ONLY a valid JSON object: {"score": <0-100>, "summary": "<2-3 sentence summary>", "status": <"Hired" or "Rejected">}.`;

      const model = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash';
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error('GEMINI_API_KEY is missing from environment variables.');

      const response = await fetchWithRetry(
        `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        },
        3,
        1000
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Gemini API HTTP error:', errorData);
        throw new Error(`Gemini API failed: ${errorData.error?.message || response.statusText} (Status: ${response.status})`);
      }

      const data = await response.json();
      console.log('Gemini raw response:', data);

      if (data.error) {
        console.error('Gemini API error in response:', data.error);
        throw new Error(`Gemini API error: ${data.error.message}`);
      }

      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('No content generated by Gemini API.');

      const cleanedText = text.replace(/```json\n?|```/g, '').trim();
      let parsed: { score: number; summary: string; status: 'Hired' | 'Rejected' } = DUMMY_SCORING_RESULT;
      try {
        parsed = JSON.parse(cleanedText);
      } catch (parseError) {
        console.warn('Failed to parse Gemini output as JSON. Using fallback scoring:', parseError);
      }

      return { ...parsed, candidateId };
    } catch (error: any) {
      console.warn(`Gemini API failed for scoring (Error: ${error.message}). Using fallback scoring.`);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing
      return { ...DUMMY_SCORING_RESULT, candidateId };
    }
  }
);

// Add new async thunk to generate all 6 questions at once
export const generateAllQuestions = createAsyncThunk(
  'interview/generateAllQuestions',
  async ({ role }: { role: string }) => {
    try {
      const difficulties: ('Easy' | 'Medium' | 'Hard')[] = ['Easy', 'Easy', 'Medium', 'Medium', 'Hard', 'Hard'];
      // FIXED: Updated time limits according to requirements: Easy 20s, Medium 60s, Hard 120s
      const timeLimits = [20, 20, 60, 60, 120, 120]; // Easy: 20s, Medium: 60s, Hard: 120s

      const prompt = `Generate exactly 6 unique interview questions for a "${role}" role. 
      - Questions 1-2: Easy 
      - Questions 3-4: Medium 
      - Questions 5-6: Hard 
      Return ONLY a valid JSON array with this exact format:
      [
        {"text": "Question 1 here"},
        {"text": "Question 2 here"}, 
        {"text": "Question 3 here"},
        {"text": "Question 4 here"},
        {"text": "Question 5 here"},
        {"text": "Question 6 here"}
      ]`;

      const model = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash';
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error('GEMINI_API_KEY is missing from environment variables.');

      const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetchWithRetry(
        url,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        },
        10,
        1000
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Gemini API HTTP error:', errorData);
        throw new Error(`Gemini API failed: ${errorData.error?.message || response.statusText} (Status: ${response.status})`);
      }

      const data = await response.json();
      console.log('Gemini raw response:', data);

      if (data.error) {
        console.error('Gemini API error in response:', data.error);
        throw new Error(`Gemini API error: ${data.error.message}`);
      }

      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('No content generated by Gemini API.');

      // Clean and parse JSON from response
      const cleanedText = text.replace(/```json\n?|```/g, '').trim();
      let parsedQuestions: { text: string }[] = [];

      try {
        parsedQuestions = JSON.parse(cleanedText);
      } catch (parseError) {
        console.warn('Failed to parse Gemini output as JSON. Using fallback questions:', parseError);
        throw new Error('Failed to parse questions');
      }

      // Combine with difficulty and time limits
      const questions: Question[] = parsedQuestions.map((q, index) => ({
        text: q.text,
        difficulty: difficulties[index],
        timeLimit: timeLimits[index]
      }));

      return questions;
    } catch (error: any) {
      console.warn(`Gemini API failed for question generation (Error: ${error.message}). Using fallback questions.`);
      return MOCK_QUESTIONS;
    }
  }
);

// --- The Slice Definition ---
const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    // --- ADDED: New reducer to set the interview role ---
    setInterviewRole: (state, action: PayloadAction<string>) => {
        state.role = action.payload;
    },
    startNewInterview: (state, action: PayloadAction<StartPayload>) => {
      const newCandidate: Candidate = { 
        id: crypto.randomUUID(), 
        name: action.payload.name, 
        email: action.payload.email, 
        phone: action.payload.phone, 
        score: null, 
        summary: null, 
        status: 'Interviewed', 
        chatHistory: [] 
      };
      state.candidates.push(newCandidate);
      state.currentInterview = { 
        ...initialState.currentInterview, 
        status: 'collecting-info', 
        candidateId: newCandidate.id 
      };
    },
    addChatMessage: (state, action: PayloadAction<{ role: 'bot' | 'user'; content: string }>) => {
        const currentCandidate = state.candidates.find(c => c.id === state.currentInterview.candidateId);
        if (currentCandidate) currentCandidate.chatHistory.push(action.payload);
    },
    updateCurrentCandidateDetails: (state, action: PayloadAction<{ name?: string; email?: string; phone?: string }>) => {
        const currentCandidate = state.candidates.find(c => c.id === state.currentInterview.candidateId);
        if (currentCandidate) Object.assign(currentCandidate, action.payload);
    },
    setInterviewInProgress: (state) => {
        state.currentInterview.status = 'in-progress';
    },
    // Add new reducer to set all questions at once
    setAllQuestions: (state, action: PayloadAction<Question[]>) => {
      state.currentInterview.questions = action.payload;
      state.currentInterview.questionsReady = true; // NEW: Mark questions as ready
    },
    // Add reducer to show next question during interview
    showNextQuestion: (state) => {
      const { currentQuestionIndex, questions } = state.currentInterview;
      const currentCandidate = state.candidates.find(c => c.id === state.currentInterview.candidateId);

      if (currentCandidate && currentQuestionIndex < questions.length) {
        const question = questions[currentQuestionIndex];
        currentCandidate.chatHistory.push({ role: 'bot', content: question.text });
      }
    },
    // FIXED: Modified submitAnswer to NOT automatically show next question (timer will handle that)
    submitAnswer: (state, action: PayloadAction<{ question: string; answer: string }>) => {
      state.currentInterview.answers.push(action.payload);
      const nextIndex = state.currentInterview.currentQuestionIndex + 1;

      if (nextIndex >= 6) {
        // Interview completed
        state.currentInterview.status = 'completed';
      } else {
        // Just move to next question index, don't add to chat yet
        state.currentInterview.currentQuestionIndex = nextIndex;
      }
    },
    // NEW: Separate action to move to next question and add it to chat
    moveToNextQuestion: (state) => {
      const { currentQuestionIndex, questions } = state.currentInterview;
      const currentCandidate = state.candidates.find(c => c.id === state.currentInterview.candidateId);

      if (currentCandidate && currentQuestionIndex < questions.length) {
        const question = questions[currentQuestionIndex];
        currentCandidate.chatHistory.push({ role: 'bot', content: question.text });
      }
    },
    resetAllData: (state) => {
        Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder
    .addCase(generateAllQuestions.pending, (state) => {
        // Show loading message
        const currentCandidate = state.candidates.find(c => c.id === state.currentInterview.candidateId);
        if (currentCandidate) {
          currentCandidate.chatHistory.push({ 
            role: 'bot', 
            content: 'Generating interview questions, please wait...' 
          });
        }
        state.currentInterview.questionsReady = false; // NEW: Mark as not ready
      })
      .addCase(generateAllQuestions.fulfilled, (state, action) => {
        // Store all questions
        state.currentInterview.questions = action.payload;
        state.currentInterview.questionsReady = true; // NEW: Mark questions as ready

        const currentCandidate = state.candidates.find(c => c.id === state.currentInterview.candidateId);
        if (currentCandidate) {
          // Remove the loading message
          currentCandidate.chatHistory.pop();
          // FIXED: Add the first question (action.payload[0], not action.payload.text)
          currentCandidate.chatHistory.push({ 
            role: 'bot', 
            content: action.payload[0].text 
          });
        }
      })
      .addCase(generateAllQuestions.rejected, (state) => {
        // Handle error case
        const currentCandidate = state.candidates.find(c => c.id === state.currentInterview.candidateId);
        if (currentCandidate) {
          // Remove the loading message
          currentCandidate.chatHistory.pop();
          // Add error message and first fallback question
          currentCandidate.chatHistory.push({ 
            role: 'bot', 
            content: 'Had some issues generating questions, using default ones. Let\'s start:' 
          });
          currentCandidate.chatHistory.push({ 
            role: 'bot', 
            content: MOCK_QUESTIONS[0].text 
          });
        }
        // Set fallback questions
        state.currentInterview.questions = MOCK_QUESTIONS;
        state.currentInterview.questionsReady = true; // NEW: Mark questions as ready
      })
      .addCase(processInterviewResults.fulfilled, (state, action) => {
        const { candidateId, score, summary, status } = action.payload;
        const candidate = state.candidates.find(c => c.id === candidateId);
        if (candidate) {
          candidate.score = score;
          candidate.summary = summary;
          candidate.status = status;
        }
        state.currentInterview = initialState.currentInterview;
      });
  },
});

// Export new actions
export const { 
  startNewInterview, 
  setInterviewRole, 
  addChatMessage, 
  updateCurrentCandidateDetails, 
  setInterviewInProgress, 
  submitAnswer, 
  resetAllData,
  setAllQuestions,
  showNextQuestion,
  moveToNextQuestion  // NEW: Export the new action
} = interviewSlice.actions;
export default interviewSlice.reducer;