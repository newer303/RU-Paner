export interface CalendarEvent {
  id: number | null;
  dateStr: string;
  startDate: string;
  endDate: string;
  title: string;
  type: string;
  region: string;
  sendNotify?: boolean;
}

export interface Course {
  code: string;
  name: string;
  credit: number;
  day: string;
  time: string;
  room: string;
  examDate: string;
  examTime: string;
}

export interface DegreeCategory {
  id: string;
  name: string;
  required: number;
  courses: string[];
}

export interface CompletedCourse {
  course_code: string;
  grade?: string;
  is_reexam?: boolean;
}

export interface SemesterPlan {
  semester_id: string; // e.g. "1/2567"
  courses: Course[];
}

export interface DegreePlan {
  major: string;
  totalCredits: number;
  categories: DegreeCategory[];
  completedCourses: CompletedCourse[];
}

export interface Status {
  label: string;
  color: string;
}

export type EventFormData = {
  id: number | null;
  title: string;
  startDate: string;
  endDate: string;
  type: string;
  region: string;
  sendNotify: boolean;
  dateStr?: string;
};

export type PlannerCourse = Course;
