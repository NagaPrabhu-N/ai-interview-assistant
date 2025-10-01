import { useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import { Candidate } from "@/store/interviewSlice";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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
    <>
      {/* Desktop Table View - Hidden on mobile */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
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
      </div>

      {/* Mobile Card View - Shown only on mobile */}
      <div className="md:hidden space-y-2">
        {/* Sort Controls for Mobile */}
        <div className="flex justify-between items-center mb-4 text-sm">
          <span className="text-muted-foreground">Sort by:</span>
          <div className="flex gap-2">
            <button
              onClick={() => onSort('name')}
              className={`px-2 py-1 rounded text-xs ${sortConfig.key === 'name' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
            >
              Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
            </button>
            <button
              onClick={() => onSort('score')}
              className={`px-2 py-1 rounded text-xs ${sortConfig.key === 'score' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
            >
              Score {sortConfig.key === 'score' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
            </button>
            <button
              onClick={() => onSort('status')}
              className={`px-2 py-1 rounded text-xs ${sortConfig.key === 'status' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
            >
              Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
            </button>
          </div>
        </div>

        {filteredAndSortedCandidates.length === 0 ? (
          <Card>
            <CardContent className="p-4 text-center text-muted-foreground">
              No matching candidates found.
            </CardContent>
          </Card>
        ) : (
          filteredAndSortedCandidates.map((candidate) => (
            <Card
              key={candidate.id}
              onClick={() => onSelectCandidate(candidate.id)}
              className={`cursor-pointer transition-colors ${
                selectedCandidateId === candidate.id ? 'bg-muted/50 border-primary' : 'hover:bg-muted/30'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-sm">{candidate.name || "N/A"}</h3>
                  <Badge variant={getStatusVariant(candidate.status)} className="text-xs">
                    {candidate.status}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Score:</span>
                  <span className="font-medium text-sm">{candidate.score ?? 'Pending'}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </>
  );
}
