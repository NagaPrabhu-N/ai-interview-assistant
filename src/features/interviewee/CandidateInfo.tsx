import { useAppSelector } from "@/store/hooks";
import { Mail, Phone, User } from "lucide-react";

export default function CandidateInfo() {
  // Read data from the Redux store
  const { candidates, currentInterview } = useAppSelector((state) => state.interview);

  // Find the current candidate based on the ID in currentInterview
  const currentCandidate = candidates.find(
    (c) => c.id === currentInterview.candidateId
  );

  // Get the details, providing a fallback if no candidate is found yet
  const name = currentCandidate?.name;
  const email = currentCandidate?.email;
  const phone = currentCandidate?.phone;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <User className="w-5 h-5 text-muted-foreground" />
        <span>{name || "Name will appear here"}</span>
      </div>
      <div className="flex items-center gap-3">
        <Mail className="w-5 h-5 text-muted-foreground" />
        <span>{email || "Email will appear here"}</span>
      </div>
      <div className="flex items-center gap-3">
        <Phone className="w-5 h-5 text-muted-foreground" />
        <span>{phone || "Phone will appear here"}</span>
      </div>
    </div>
  );
}
