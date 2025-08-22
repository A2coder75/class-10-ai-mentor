import { Subject, Topic } from "@/types";

const SYLLABUS_STORAGE_KEY = 'syllabus_tracker_data';

export function saveSyllabusData(subjects: Subject[]): void {
  try {
    const dataToSave = {
      subjects,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(SYLLABUS_STORAGE_KEY, JSON.stringify(dataToSave));
    console.log('Syllabus data saved successfully');
  } catch (error) {
    console.error('Failed to save syllabus data:', error);
  }
}

export function loadSyllabusData(): Subject[] | null {
  try {
    const savedData = localStorage.getItem(SYLLABUS_STORAGE_KEY);
    if (!savedData) {
      return null;
    }
    
    const parsedData = JSON.parse(savedData);
    return parsedData.subjects || null;
  } catch (error) {
    console.error('Failed to load syllabus data:', error);
    return null;
  }
}

export function updateTopicStatus(
  subjects: Subject[], 
  subjectId: string, 
  topicId: string, 
  status: Topic['status']
): Subject[] {
  const updatedSubjects = subjects.map(subject => {
    if (subject.id === subjectId) {
      const updatedTopics = subject.topics.map(topic => {
        if (topic.id === topicId) {
          return { ...topic, status };
        }
        return topic;
      });
      
      const completedTopics = updatedTopics.filter(t => t.status === 'completed').length;
      
      return {
        ...subject,
        topics: updatedTopics,
        completedTopics
      };
    }
    return subject;
  });
  
  // Save updated data
  saveSyllabusData(updatedSubjects);
  
  return updatedSubjects;
}

export function getSyllabusProgress(subjects: Subject[]): {
  totalTopics: number;
  completedTopics: number;
  progressPercentage: number;
} {
  const totalTopics = subjects.reduce((sum, subject) => sum + subject.topics.length, 0);
  const completedTopics = subjects.reduce((sum, subject) => 
    sum + subject.topics.filter(topic => topic.status === 'completed').length, 0
  );
  
  const progressPercentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
  
  return {
    totalTopics,
    completedTopics,
    progressPercentage
  };
}