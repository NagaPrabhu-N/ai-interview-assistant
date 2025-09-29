import { useState } from "react";
import CandidateList from "./CandidateList";
import CandidateDetail from "./CandidateDetail";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { resetAllData, setInterviewRole  } from "@/store/interviewSlice";
import { Input } from "@/components/ui/input";
import SetRoleDialog from "./SetRoleDialog";

export default function InterviewerView() {
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: 'name' | 'score' | 'status', direction: 'asc' | 'desc' }>({ key: 'name', direction: 'asc' });
  const dispatch = useAppDispatch();
  
  // Get the current role from the store
  const role = useAppSelector(state => state.interview.role);


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
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Interview Results</span>
          <div className="flex items-center gap-2">
            <SetRoleDialog onSetRole={handleSetRole} currentRole={role} />
            <Button variant="destructive" size="sm" onClick={handleClearAll}>
              Clear All Data
            </Button>
          </div>
        </CardTitle>
        <CardDescription>Current Role: {role}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 md:p-6 space-y-4">
        <Input
          placeholder="Search by candidate name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <CandidateList 
              onSelectCandidate={setSelectedCandidateId} 
              selectedCandidateId={selectedCandidateId}
              searchTerm={searchTerm}
              sortConfig={sortConfig}
              onSort={handleSort}
            />
          </div>
          <div className="lg:col-span-2">
            {selectedCandidateId ? (
              <CandidateDetail candidateId={selectedCandidateId} />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground rounded-lg border-2 border-dashed">
                <p>Select a candidate from the list to view details</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
