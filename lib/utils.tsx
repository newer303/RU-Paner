import { Status, Course, CalendarEvent } from '@/types';
import { BookOpen, List, AlertCircle, Calendar as CalendarIcon } from 'lucide-react';
import React from 'react';

export const generateICS = (courses: Course[], events: CalendarEvent[]): string => {
  let icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Planner//TH',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ];

  const formatICSDate = (dateStr: string) => dateStr.replace(/-/g, '') + 'T000000Z';

  // Add Courses
  courses.forEach(course => {
    if (!course.examDate) return;
    icsLines.push('BEGIN:VEVENT');
    icsLines.push(`SUMMARY:สอบ ${course.code}: ${course.name}`);
    icsLines.push(`DTSTART:${formatICSDate(course.examDate)}`);
    icsLines.push(`DTEND:${formatICSDate(course.examDate)}`);
    icsLines.push(`DESCRIPTION:เวลาสอบ: ${course.examTime}\\nห้องสอบ: ${course.room}`);
    icsLines.push('STATUS:CONFIRMED');
    icsLines.push('END:VEVENT');
  });

  // Add University Events
  events.forEach(event => {
    icsLines.push('BEGIN:VEVENT');
    icsLines.push(`SUMMARY:${event.title}`);
    icsLines.push(`DTSTART:${formatICSDate(event.startDate)}`);
    icsLines.push(`DTEND:${formatICSDate(event.endDate)}`);
    icsLines.push(`DESCRIPTION:ประเภท: ${event.type}\\nส่วนการศึกษา: ${event.region}`);
    icsLines.push('STATUS:CONFIRMED');
    icsLines.push('END:VEVENT');
  });

  icsLines.push('END:VCALENDAR');
  return icsLines.join('\\r\\n');
};

export const calculateGPAX = (completedCourses: { course_code: string, grade?: string }[], allCourses: Course[]): string => {
  const gradePoints: Record<string, number> = {
    'A': 4.0, 'B+': 3.5, 'B': 3.0, 'C+': 2.5, 'C': 2.0, 'D+': 1.5, 'D': 1.0, 'F': 0.0
  };

  let totalPoints = 0;
  let totalCredits = 0;

  completedCourses.forEach(completed => {
    if (!completed.grade || !gradePoints.hasOwnProperty(completed.grade)) return;
    
    const course = allCourses.find(c => c.code === completed.course_code);
    const credits = course?.credit || 3;
    
    totalPoints += gradePoints[completed.grade] * credits;
    totalCredits += credits;
  });

  if (totalCredits === 0) return '0.00';
  return (totalPoints / totalCredits).toFixed(2);
};

export const getCalendarIcon = (type: string) => {
  switch (type) {
    case 'lecture': return <BookOpen className="text-blue-500" size={20} />;
    case 'registration': return <List className="text-green-500" size={20} />;
    case 'exam': return <AlertCircle className="text-red-500" size={20} />;
    default: return <CalendarIcon className="text-gray-500" size={20} />;
  }
};

export const getEventStatus = (startDate: string, endDate: string): Status => {
  const parseLocalDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = parseLocalDate(startDate);
  start.setHours(0, 0, 0, 0);

  const end = parseLocalDate(endDate);
  end.setHours(23, 59, 59, 999);

  if (today > end) {
    return { label: 'ผ่านมาแล้ว', color: 'bg-gray-100 text-gray-500 border-gray-200' };
  } else if (today >= start && today <= end) {
    return { label: 'กำลังดำเนินการ', color: 'bg-green-100 text-green-700 border-green-300 shadow-sm' };
  } else {
    return { label: 'เร็วๆ นี้', color: 'bg-blue-100 text-blue-700 border-blue-200' };
  }
};

export const calculateEventProgress = (startDate: string, endDate: string): number => {
  const parseLocalDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const now = new Date();
  const start = parseLocalDate(startDate);
  start.setHours(0, 0, 0, 0);
  
  const end = parseLocalDate(endDate);
  end.setHours(23, 59, 59, 999);

  if (now < start) return 0;
  if (now > end) return 100;

  const total = end.getTime() - start.getTime();
  const elapsed = now.getTime() - start.getTime();
  
  return Math.min(Math.max((elapsed / total) * 100, 0), 100);
};

export const formatThaiDateRange = (startDate: string, endDate: string): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

  const startDay = start.getDate();
  const startMonth = months[start.getMonth()];
  const startYear = start.getFullYear();

  const endDay = end.getDate();
  const endMonth = months[end.getMonth()];
  const endYear = end.getFullYear();

  if (startDate === endDate) {
    return `${startDay} ${startMonth} ${startYear}`;
  } else if (startMonth === endMonth && startYear === endYear) {
    return `${startDay}-${endDay} ${startMonth} ${startYear}`;
  } else {
    return `${startDay} ${startMonth} ${startYear} - ${endDay} ${endMonth} ${endYear}`;
  }
};
