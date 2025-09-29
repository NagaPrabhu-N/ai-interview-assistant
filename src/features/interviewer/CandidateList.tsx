import { useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import { Candidate } from "@/store/interviewSlice";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown } from "lucide-react";

interface CandidateListProps {
  onSelectCandidate: (candidateId: string) => void;
  selectedCandidateId: string | null;
  searchTerm: string;
  sortConfig: { key: 'name' | 'score' | 'status', direction: 'asc' | 'desc' };
  onSort: (key: 'name' | 'score' | 'status') => void;
}

export default function CandidateList({ onSelectCandidate, selectedCandidateId, searchTerm, sortConfig, onSort }: CandidateListProps) {
  const candidates = useAppSelector((state) => state.interview.candidates);

  const filteredAndSortedCandidates = useMemo(() => {
    let processableCandidates = [...candidates];

    if (searchTerm) {
      processableCandidates = processableCandidates.filter(candidate =>
        candidate.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    processableCandidates.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue === null) return 1;
      if (bValue === null) return -1;
      
      let comparison = 0;
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

    return processableCandidates;
  }, [candidates, searchTerm, sortConfig]);

  const getStatusVariant = (status: Candidate['status']) => {
    switch (status) {
      case 'Hired': return 'success';
      case 'Rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  const getSortIcon = (key: 'name' | 'score' | 'status') => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="ml-2 h-4 w-4 opacity-30 inline" />;
    }
    return sortConfig.direction === 'asc' ? '▲' : '▼';
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {/* --- THE FIX: Use onClick on TableHead, not Button --- */}
          <TableHead onClick={() => onSort('name')} className="cursor-pointer">
            Name {getSortIcon('name')}
          </TableHead>
          <TableHead onClick={() => onSort('score')} className="cursor-pointer">
            Score {getSortIcon('score')}
          </TableHead>
          <TableHead onClick={() => onSort('status')} className="cursor-pointer">
            Status {getSortIcon('status')}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredAndSortedCandidates.length === 0 ? (
          <TableRow>
            <TableCell colSpan={3} className="text-center">No matching candidates found.</TableCell>
          </TableRow>
        ) : (
          filteredAndSortedCandidates.map((candidate) => (
            <TableRow
              key={candidate.id}
              onClick={() => onSelectCandidate(candidate.id)}
              className={`cursor-pointer ${selectedCandidateId === candidate.id ? 'bg-muted/50' : ''}`}
            >
              <TableCell className="font-medium">{candidate.name || "N/A"}</TableCell>
              <TableCell>{candidate.score ?? 'Pending'}</TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(candidate.status)}>{candidate.status}</Badge>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
