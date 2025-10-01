// src/features/interviewer/InterviewerView.tsx (updated to use Redux for candidates)
import { useState, useEffect } from "react";
import CandidateList from "./CandidateList";
import CandidateDetail from "./CandidateDetail";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchInterviews, resetAllData, setInterviewRole } from "@/store/interviewSlice"; // NEW: Import fetchInterviews
import { Input } from "@/components/ui/input";
import SetRoleDialog from "./SetRoleDialog";

export default function InterviewerView() {
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: 'name' | 'score' | 'status', direction: 'asc' | 'desc' }>({ key: 'name', direction: 'asc' });
  const dispatch = useAppDispatch();

  // Get data from Redux
  const candidates = useAppSelector(state => state.interview.candidates);
  const role = useAppSelector(state => state.interview.role);

  // Fetch interviews from backend on mount
  useEffect(() => {
    dispatch(fetchInterviews());
  }, [dispatch]);

  // For clearing local redux and selections
  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to delete all candidate data? This cannot be undone.")) {
      dispatch(resetAllData());
      setSelectedCandidateId(null);
    }
  };

  const handleSetRole = (newRole: string) => {
    dispatch(setInterviewRole(newRole));
  };

  const handleSort = (key: 'name' | 'score' | 'status') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <Card className="md:w-[60rem]">
      <CardHeader>
        <CardTitle className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <span className="text-lg sm:text-xl">Interview Results</span>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <SetRoleDialog onSetRole={handleSetRole} currentRole={role} />
            <Button variant="destructive" size="sm" onClick={handleClearAll} className="w-full sm:w-auto">
              Clear All Data
            </Button>
          </div>
        </CardTitle>
        <CardDescription className="text-sm">
          Current Role: <span className="font-medium">{role}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 md:p-6 space-y-4">
        <Input
          placeholder="Search by candidate name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:max-w-sm"
        />

        {/* Mobile: Stack layout, Desktop: Grid layout */}
        <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-6">
          {/* Candidate List */}
          <div className="lg:col-span-1">
            <div className="lg:hidden mb-4">
              <h3 className="text-lg font-semibold mb-2">Candidates</h3>
            </div>
            <CandidateList
              onSelectCandidate={setSelectedCandidateId}
              selectedCandidateId={selectedCandidateId}
              searchTerm={searchTerm}
              sortConfig={sortConfig}
              onSort={handleSort}
              candidates={candidates} // Pass Redux candidates
            />
          </div>

          {/* Candidate Details */}
          <div className="lg:col-span-2">
            <div className="lg:hidden mb-4">
              <h3 className="text-lg font-semibold mb-2">Details</h3>
            </div>
            {selectedCandidateId ? (
              <CandidateDetail candidateId={selectedCandidateId} />
            ) : (
              <div className="flex items-center justify-center h-32 lg:h-full text-muted-foreground rounded-lg border-2 border-dashed">
                <p className="text-center text-sm px-4">
                  Select a candidate from the list to view details
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
