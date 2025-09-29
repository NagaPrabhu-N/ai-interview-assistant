import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set up the worker for pdf.js. This is required for it to work in a web environment.
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.mjs`;

// --- Regular Expressions to find information ---
// This email regex is robust and handles most common formats.
const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/;
// This phone regex looks for various formats like (123) 456-7890, 123-456-7890, etc.
const phoneRegex = /(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*/;

// --- Main Parser Function ---
export const parseResume = async (file: File): Promise<{ name: string | null; email: string | null; phone: string | null; }> => {
  let text = '';
  // --- Handle PDF files ---
  if (file.type === 'application/pdf') {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      fullText += content.items.map(item => item.str).join(' ');
    }
    text = fullText;
  } 
  // --- Handle DOCX files ---
  else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    text = result.value;
  } 
  // --- Handle unsupported files ---
  else {
    throw new Error('Unsupported file type. Please upload a PDF or DOCX.');
  }

  // --- Extract details from the text ---
  return extractDetails(text);
};

// --- Helper function to extract details using regex ---
const extractDetails = (text: string) => {
  // A simple heuristic for the name: find the first line with 2-3 words, likely a name.
  // This is a naive approach but works for many standard resume formats.
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  let name: string | null = null;
  for (const line of lines) {
    const words = line.split(' ');
    if (words.length >= 2 && words.length <= 3) {
      // Check if it doesn't contain an email or phone number
      if (!emailRegex.test(line) && !phoneRegex.test(line)) {
        name = line;
        break; // Assume the first such line is the name
      }
    }
  }
  
  // If no suitable name is found, fall back to the very first line.
  if (!name && lines.length > 0) {
    name = lines[0].split(' ').slice(0, 3).join(' ');
  }

  const email = text.match(emailRegex)?.[0] || null;
  const phone = text.match(phoneRegex)?.[0]?.trim() || null;

  return { name, email, phone };
};
