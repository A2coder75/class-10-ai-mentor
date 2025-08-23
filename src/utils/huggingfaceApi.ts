// Utility functions for fetching data from HuggingFace repository

const HUGGINGFACE_BASE_URL = "https://huggingface.co/datasets/A2coder75/QnA_All/tree/main";
const HUGGINGFACE_API_BASE = "https://huggingface.co/api/datasets/A2coder75/QnA_All";

export interface SubjectInfo {
  name: string;
  path: string;
  displayName: string;
  color: string;
  icon: string;
  description: string;
}

export interface PaperInfo {
  name: string;
  path: string;
  displayName: string;
  subject: string;
  year?: string;
  type?: string;
}

// Fetch available subjects from the repository
export async function fetchSubjects(): Promise<SubjectInfo[]> {
  try {
    const response = await fetch(`${HUGGINGFACE_API_BASE}/tree/main`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch subjects: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Filter for directories (subjects)
    const subjects = data
      .filter((item: any) => item.type === 'directory')
      .map((item: any) => ({
        name: item.path,
        path: item.path,
        displayName: formatSubjectName(item.path),
        color: getSubjectColor(item.path),
        icon: getSubjectIcon(item.path),
        description: getSubjectDescription(item.path)
      }));
    
    return subjects;
  } catch (error) {
    console.error('Error fetching subjects:', error);
    
    // Return fallback subjects if API fails
    return [
      {
        name: 'physics',
        path: 'physics',
        displayName: 'Physics',
        color: 'from-blue-500 to-cyan-500',
        icon: '⚛️',
        description: 'Study of matter, energy, and their interactions'
      },
      {
        name: 'chemistry',
        path: 'chemistry',
        displayName: 'Chemistry',
        color: 'from-green-500 to-emerald-500',
        icon: '🧪',
        description: 'Science of atoms, molecules, and chemical reactions'
      },
      {
        name: 'maths',
        path: 'maths',
        displayName: 'Mathematics',
        color: 'from-purple-500 to-indigo-500',
        icon: '📐',
        description: 'Numbers, equations, and mathematical reasoning'
      },
      {
        name: 'biology',
        path: 'biology',
        displayName: 'Biology',
        color: 'from-emerald-500 to-teal-500',
        icon: '🧬',
        description: 'Study of living organisms and life processes'
      }
    ];
  }
}

// Fetch papers for a specific subject
export async function fetchPapersForSubject(subjectPath: string): Promise<PaperInfo[]> {
  try {
    const response = await fetch(`${HUGGINGFACE_API_BASE}/tree/main/${subjectPath}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch papers for ${subjectPath}: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Filter for files (papers) - typically JSON or other formats
    const papers = data
      .filter((item: any) => item.type === 'file' || item.path.includes('.'))
      .map((item: any) => ({
        name: item.path.split('/').pop() || item.path,
        path: item.path,
        displayName: formatPaperName(item.path),
        subject: subjectPath,
        year: extractYear(item.path),
        type: extractPaperType(item.path)
      }));
    
    return papers;
  } catch (error) {
    console.error(`Error fetching papers for ${subjectPath}:`, error);
    
    // Return fallback papers if API fails
    return [
      {
        name: `${subjectPath}_sample_2024`,
        path: `${subjectPath}/${subjectPath}_sample_2024`,
        displayName: `${formatSubjectName(subjectPath)} Sample Paper 2024`,
        subject: subjectPath,
        year: '2024',
        type: 'Board Exam'
      },
      {
        name: `${subjectPath}_sample_2023`,
        path: `${subjectPath}/${subjectPath}_sample_2023`,
        displayName: `${formatSubjectName(subjectPath)} Sample Paper 2023`,
        subject: subjectPath,
        year: '2023',
        type: 'Board Exam'
      }
    ];
  }
}

// Helper functions for formatting and styling
function formatSubjectName(path: string): string {
  const subjectMap: Record<string, string> = {
    'physics': 'Physics',
    'chemistry': 'Chemistry',
    'maths': 'Mathematics',
    'mathematics': 'Mathematics',
    'biology': 'Biology',
    'english': 'English',
    'history': 'History',
    'geography': 'Geography',
    'computer-science': 'Computer Science',
    'cs': 'Computer Science'
  };
  
  return subjectMap[path.toLowerCase()] || path.charAt(0).toUpperCase() + path.slice(1);
}

function formatPaperName(path: string): string {
  const filename = path.split('/').pop() || path;
  
  // Remove file extension
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
  
  // Extract meaningful parts
  const parts = nameWithoutExt.split(/[_-]/);
  
  // Try to identify year, board, subject
  const year = parts.find(part => /^\d{4}$/.test(part));
  const board = parts.find(part => /^(icse|cbse|board)$/i.test(part));
  const subject = parts.find(part => /^(physics|chemistry|maths|biology|english)$/i.test(part));
  
  let displayName = '';
  
  if (subject) {
    displayName += formatSubjectName(subject);
  }
  
  if (board) {
    displayName += ` ${board.toUpperCase()}`;
  }
  
  if (year) {
    displayName += ` ${year}`;
  }
  
  // Fallback to cleaned filename
  if (!displayName.trim()) {
    displayName = nameWithoutExt
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }
  
  return displayName || filename;
}

function getSubjectColor(subject: string): string {
  const colorMap: Record<string, string> = {
    'physics': 'from-blue-500 to-cyan-500',
    'chemistry': 'from-green-500 to-emerald-500',
    'maths': 'from-purple-500 to-indigo-500',
    'mathematics': 'from-purple-500 to-indigo-500',
    'biology': 'from-emerald-500 to-teal-500',
    'english': 'from-pink-500 to-rose-500',
    'history': 'from-red-500 to-pink-500',
    'geography': 'from-cyan-500 to-blue-500',
    'computer-science': 'from-violet-500 to-purple-500',
    'cs': 'from-violet-500 to-purple-500'
  };
  
  return colorMap[subject.toLowerCase()] || 'from-gray-500 to-slate-500';
}

function getSubjectIcon(subject: string): string {
  const iconMap: Record<string, string> = {
    'physics': '⚛️',
    'chemistry': '🧪',
    'maths': '📐',
    'mathematics': '📐',
    'biology': '🧬',
    'english': '📚',
    'history': '🏛️',
    'geography': '🌍',
    'computer-science': '💻',
    'cs': '💻'
  };
  
  return iconMap[subject.toLowerCase()] || '📖';
}

function getSubjectDescription(subject: string): string {
  const descriptionMap: Record<string, string> = {
    'physics': 'Study of matter, energy, and their interactions',
    'chemistry': 'Science of atoms, molecules, and chemical reactions',
    'maths': 'Numbers, equations, and mathematical reasoning',
    'mathematics': 'Numbers, equations, and mathematical reasoning',
    'biology': 'Study of living organisms and life processes',
    'english': 'Language, literature, and communication skills',
    'history': 'Past events, civilizations, and historical analysis',
    'geography': 'Earth's features, climate, and human geography',
    'computer-science': 'Programming, algorithms, and computational thinking',
    'cs': 'Programming, algorithms, and computational thinking'
  };
  
  return descriptionMap[subject.toLowerCase()] || 'Academic subject study materials';
}

function extractYear(path: string): string | undefined {
  const yearMatch = path.match(/(\d{4})/);
  return yearMatch ? yearMatch[1] : undefined;
}

function extractPaperType(path: string): string {
  const filename = path.toLowerCase();
  
  if (filename.includes('board')) return 'Board Exam';
  if (filename.includes('sample')) return 'Sample Paper';
  if (filename.includes('mock')) return 'Mock Test';
  if (filename.includes('practice')) return 'Practice Paper';
  if (filename.includes('prelim')) return 'Preliminary Exam';
  
  return 'Question Paper';
}