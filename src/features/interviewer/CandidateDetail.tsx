// src/features/interviewer/CandidateDetail.tsx (unchanged, as it already uses Redux)
import { useAppSelector } from "@/store/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CandidateDetailProps {
  candidateId: string;
}

export default function CandidateDetail({ candidateId }: CandidateDetailProps) {
  const candidate = useAppSelector((state) =>
    state.interview.candidates.find((c) => c.id === candidateId)
  );

  if (!candidate) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>Select a candidate to see their details.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>{candidate.name}</span>
            <span className="text-2xl font-bold">{candidate.score}/100</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{candidate.summary || "Summary not available."}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Interview Transcript</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 h-[400px] overflow-y-auto pr-4">
          {candidate.chatHistory.map((message, index) => (
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
                <p className="font-semibold text-xs mb-1">{message.role === 'bot' ? 'AI Interviewer' : candidate.name}</p>
                {message.content}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
