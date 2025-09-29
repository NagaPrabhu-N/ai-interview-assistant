import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAppDispatch } from "@/store/hooks";
import { resetAllData } from "@/store/interviewSlice";

interface WelcomeBackModalProps {
  isOpen: boolean;
  onContinue: () => void;
  onStartNew: () => void;
}

export default function WelcomeBackModal({ isOpen, onContinue, onStartNew }: WelcomeBackModalProps) {
  const dispatch = useAppDispatch();

  const handleStartNew = () => {
    dispatch(resetAllData());
    onStartNew();
  };

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Welcome Back!</AlertDialogTitle>
          <AlertDialogDescription>
            It looks like you have an interview in progress. Would you like to continue where you left off or start a new interview?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onContinue}>Continue Interview</AlertDialogAction>
          <AlertDialogCancel onClick={handleStartNew}>Start New</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
