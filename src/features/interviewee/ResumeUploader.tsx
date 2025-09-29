import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { Card, CardContent } from "@/components/ui/card";
import { UploadCloud } from 'lucide-react';
import { parseResume } from '@/lib/resumeParser';
import { startNewInterview } from '@/store/interviewSlice';

export default function ResumeUploader() {
  const dispatch = useDispatch();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const toastId = toast.loading("Parsing resume...");
      try {
        const extractedData = await parseResume(file);
        dispatch(startNewInterview(extractedData));
        toast.success("Resume parsed successfully!", { id: toastId });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "An unknown error occurred.", { id: toastId });
      }
    }
  }, [dispatch]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
  });

  return (
    <Card
      {...getRootProps()}
      className={`border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer ${isDragActive ? 'border-primary' : ''}`}
    >
      <CardContent className="p-6">
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2">
          <UploadCloud className="w-12 h-12 text-muted-foreground" />
          <p className="text-lg font-semibold">
            {isDragActive ? 'Drop the file here' : 'Upload Resume'}
          </p>
          <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
        </div>
      </CardContent>
    </Card>
  );
}
