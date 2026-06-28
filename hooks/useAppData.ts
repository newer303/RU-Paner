import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CalendarEvent, Course, DegreePlan, DegreeCategory,
  Status, EventFormData, PlannerCourse, CompletedCourse, SemesterPlan
} from '@/types';
import { getEventStatus, formatThaiDateRange, calculateGPAX } from '@/lib/utils';

export function useAppData() {
  const [activeTab, setActiveTab] = useState('home');

  // Persistence for activeTab
  useEffect(() => {
    const savedTab = localStorage.getItem('activeTab');
    if (savedTab) setActiveTab(savedTab);
  }, []);

  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  // Calendar State
  const [filterRegion, setFilterRegion] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [eventFormData, setEventFormData] = useState<EventFormData>({
    id: null,
    title: '',
    startDate: '',
    endDate: '',
    type: 'lecture',
    region: 'all',
    sendNotify: false
  });

  // Planner State
  const [selectedCourses, setSelectedCourses] = useState<PlannerCourse[]>([]);
  const [mr30Courses, setMr30Courses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [plannerError, setPlannerError] = useState('');
  const [isManualCourseModalOpen, setIsManualCourseModalOpen] = useState(false);
  const [manualCourseData, setManualCourseData] = useState<Course>({
    code: '',
    name: '',
    credit: 3,
    day: 'จันทร์',
    time: '09:30 - 11:20',
    room: '',
    examDate: '',
    examTime: 'เช้า (09:30-12:00)'
  });

  // Degree Plan State
  const [isDegreeEditMode, setIsDegreeEditMode] = useState(false);
  const [degreePlan, setDegreePlan] = useState<DegreePlan>({ major: 'กำลังโหลด...', totalCredits: 0, categories: [], completedCourses: [] });
  const [isDegreeLoading, setIsDegreeLoading] = useState(true);
  const [completedCourses, setCompletedCourses] = useState<CompletedCourse[]>([]);
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [targetCategoryId, setTargetCategoryId] = useState<string | null>(null);
  const [courseSearchQuery, setCourseSearchQuery] = useState('');

  // Roadmap State
  const [semesterRoadmap, setSemesterRoadmap] = useState<SemesterPlan[]>([]);

  // Notifications State
  const [notifyLine, setNotifyLine] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(false);
  const [lineToken, setLineToken] = useState('');

  // --- Utility ---
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  }, []);

  // --- Data Fetching ---
  const fetchWithTimeout = async (url: string, options = {}, timeout = 5000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(id);
      return response;
    } catch (error: any) {
      clearTimeout(id);
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms: ${url}`);
      }
      throw error;
    }
  };

  const fetchDegreePlan = useCallback(async () => {
    try {
      const res = await fetchWithTimeout('/api/degree-plan', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch degree plan');
      const degreeData = await res.json();
      const plan = {
        major: degreeData.major || 'ยังไม่ได้ระบุชื่อหลักสูตร',
        totalCredits: degreeData.totalCredits || 0,
        categories: Array.isArray(degreeData.categories) ? degreeData.categories : [],
        completedCourses: Array.isArray(degreeData.completedCourses) ? degreeData.completedCourses : []
      };
      setDegreePlan(plan);
      setCompletedCourses(plan.completedCourses);
      return plan;
    } catch (err) {
      console.error('Error fetching degree plan:', err);
      throw err;
    }
  }, []);

  const loadAllData = useCallback(async (isInitialLoad = false) => {
    if (isInitialLoad) setIsDegreeLoading(true);
    console.log('[useAppData] Starting loadAllData...');
    
    try {
      const cachedCourses = localStorage.getItem('mr30Courses');
      if (cachedCourses) {
        setMr30Courses(JSON.parse(cachedCourses));
      }
    } catch (e) {
      console.error('Failed to load cached courses', e);
    }

    try {
      const endpoints = [
        { key: 'calendar', url: '/api/calendar' },
        { key: 'courses', url: '/api/courses' },
        { key: 'planner', url: '/api/planner' },
        { key: 'settings', url: '/api/settings' },
        { key: 'degree', url: '/api/degree-plan' },
        { key: 'roadmap', url: '/api/roadmap' },
      ];

      const results: any = {};
      for (const endpoint of endpoints) {
        try {
          console.log(`[useAppData] Fetching ${endpoint.key}...`);
          const res = await fetchWithTimeout(endpoint.url, { cache: 'no-store' });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          results[endpoint.key] = await res.json();
          console.log(`[useAppData] Successfully fetched ${endpoint.key}`);
        } catch (e: any) {
          console.error(`[useAppData] Failed to fetch ${endpoint.key}: ${e.message}`);
          results[endpoint.key] = null; 
        }
      }

      const { calendar, courses, planner, settings, degree, roadmap } = results;

      if (calendar) setCalendarEvents(calendar);
      if (courses) {
        setMr30Courses(courses);
        try {
          localStorage.setItem('mr30Courses', JSON.stringify(courses));
        } catch (e) {
          console.error('Failed to cache courses', e);
        }
      }
      if (planner) setSelectedCourses(planner);
      if (roadmap) setSemesterRoadmap(roadmap);

      if (settings) {
        if (settings.notifyLine !== undefined) setNotifyLine(settings.notifyLine === 'true');
        if (settings.notifyEmail !== undefined) setNotifyEmail(settings.notifyEmail === 'true');
        if (settings.lineToken !== undefined) setLineToken(settings.lineToken);
      }

      if (degree) {
        const plan = {
          major: degree.major || 'ยังไม่ได้ระบุชื่อหลักสูตร',
          totalCredits: degree.totalCredits || 0,
          categories: Array.isArray(degree.categories) ? degree.categories : [],
          completedCourses: Array.isArray(degree.completedCourses) ? degree.completedCourses : []
        };
        setDegreePlan(plan);
        setCompletedCourses(plan.completedCourses);
      }
    } catch (err) {
      console.error('Critical error in loadAllData:', err);
      showToast('ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsDegreeLoading(false);
      console.log('[useAppData] loadAllData completed');
    }
  }, [showToast]);

  useEffect(() => {
    loadAllData(true);
  }, [loadAllData]);

  const updateSetting = async (key: string, value: string | boolean) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      });
      if (!res.ok) throw new Error('Failed to update settings');
      await loadAllData();
    } catch (err) {
      console.error(err);
      showToast('ไม่สามารถบันทึกการตั้งค่าได้');
    }
  };

  // --- Roadmap Logic ---
  const addCourseToSemester = async (semesterId: string, courseCode: string) => {
    try {
      const res = await fetch('/api/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ semesterId, courseCode }),
      });
      if (!res.ok) throw new Error('Add to roadmap failed');
      await loadAllData();
      showToast(`เพิ่มวิชา ${courseCode} ลงแผนเทอม ${semesterId} แล้ว`);
    } catch (err) {
      showToast('เพิ่มวิชาลงแผนไม่สำเร็จ');
    }
  };

  const removeCourseFromSemester = async (semesterId: string, courseCode: string) => {
    try {
      const res = await fetch(`/api/roadmap?semesterId=${semesterId}&courseCode=${courseCode}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Remove from roadmap failed');
      await loadAllData();
    } catch (err) {
      showToast('ลบวิชาจากแผนไม่สำเร็จ');
    }
  };

  const removeSemester = async (semesterId: string) => {
    try {
      const res = await fetch(`/api/roadmap?semesterId=${semesterId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Remove semester failed');
      await loadAllData();
      showToast(`ลบแผนเทอม ${semesterId} เรียบร้อยแล้ว`);
    } catch (err) {
      showToast('ลบเทอมไม่สำเร็จ');
    }
  };

  const renameSemester = async (oldSemesterId: string, newSemesterId: string) => {
    try {
      const res = await fetch('/api/roadmap', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldSemesterId, newSemesterId, action: 'renameSemester' }),
      });
      if (!res.ok) throw new Error('Rename semester failed');
      await loadAllData();
      showToast(`เปลี่ยนชื่อเทอมเป็น ${newSemesterId} แล้ว`);
    } catch (err) {
      showToast('เปลี่ยนชื่อเทอมไม่สำเร็จ');
    }
  };

  const moveCourseToSemester = async (courseCode: string, oldSemesterId: string, newSemesterId: string) => {
    try {
      const res = await fetch('/api/roadmap', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseCode, oldSemesterId, newSemesterId }),
      });
      if (!res.ok) throw new Error('Move course failed');
      await loadAllData();
      showToast(`ย้ายวิชา ${courseCode} ไปเทอม ${newSemesterId} แล้ว`);
    } catch (err) {
      showToast('ย้ายวิชาไม่สำเร็จ');
    }
  };

  // --- Calendar Logic ---
  const filteredCalendar = useMemo(() => {
    return calendarEvents.filter(item => {
      const matchRegion = filterRegion === 'all' || item.region === filterRegion || item.region === 'all';
      const matchType = filterType === 'all' || item.type === filterType;
      return matchRegion && matchType;
    }).sort((a, b) => {
      const statusA = getEventStatus(a.startDate, a.endDate);
      const statusB = getEventStatus(b.startDate, b.endDate);

      const getPriority = (status: Status) => {
        if (status.label === 'กำลังดำเนินการ') return 0;
        if (status.label === 'เร็วๆ นี้') return 1;
        return 2;
      };

      return getPriority(statusA) - getPriority(statusB);
    });
  }, [calendarEvents, filterRegion, filterType]);

  const handleOpenEventModal = (event: CalendarEvent | null = null) => {
    if (event) {
      setEventFormData({ ...event, sendNotify: event.sendNotify ?? false });
    } else {
      const todayStr = new Date().toISOString().split('T')[0];
      setEventFormData({ id: null, title: '', startDate: todayStr, endDate: todayStr, type: 'lecture', region: 'all', sendNotify: true });
    }
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = async () => {
    if (!eventFormData.title || !eventFormData.startDate || !eventFormData.endDate) {
      showToast('กรุณากรอกข้อมูลให้ครบถ้วน (ชื่อ, วันเริ่มต้น, วันสิ้นสุด)');
      return;
    }

    const dateStr = formatThaiDateRange(eventFormData.startDate, eventFormData.endDate);

    const eventData = {
      id: eventFormData.id,
      title: eventFormData.title,
      startDate: eventFormData.startDate,
      endDate: eventFormData.endDate,
      type: eventFormData.type,
      region: eventFormData.region,
      dateStr,
      sendNotify: eventFormData.sendNotify,
    };

    try {
      let res;
      if (eventFormData.id) {
        res = await fetch('/api/calendar', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData),
        });
      } else {
        res = await fetch('/api/calendar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData),
        });
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.error || 'Failed to save event');
      }

      await loadAllData();
      setIsEventModalOpen(false);
      showToast(eventFormData.id ? `อัปเดต "${eventFormData.title}" เรียบร้อยแล้ว` : `เพิ่ม "${eventFormData.title}" เรียบร้อยแล้ว`);
    } catch (error: any) {
      console.error(error);
      showToast(`เกิดข้อผิดพลาด: ${error.message}`);
    }
  };

  const handleDeleteEvent = async () => {
    if (confirmDeleteId) {
      try {
        const res = await fetch(`/api/calendar?id=${confirmDeleteId}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete event');
        await loadAllData();
        setConfirmDeleteId(null);
        showToast('ลบกำหนดการเรียบร้อยแล้ว');
      } catch (error) {
        console.error(error);
        showToast('เกิดข้อผิดพลาดในการลบข้อมูล');
      }
    }
  };

  // --- Planner Logic ---
  const searchResults = useMemo(() => {
    return searchQuery.length >= 2
      ? mr30Courses.filter(c => c.code.toLowerCase().includes(searchQuery.toLowerCase()) || c.name.includes(searchQuery))
      : [];
  }, [searchQuery, mr30Courses]);

  const addCourseToPlanner = async (course: Course) => {
    setPlannerError('');
    if (selectedCourses.some(c => c.code === course.code)) {
      setPlannerError(`วิชา ${course.code} อยู่ในตารางแล้ว`);
      return;
    }

    const examConflict = selectedCourses.find(
      c => c.examDate && course.examDate && c.examDate === course.examDate && c.examTime === course.examTime
    );

    if (examConflict) {
      const confirmAdd = window.confirm(`⚠️ วันสอบซ้ำซ้อน!

วิชา ${course.code} สอบวันเดียวกับ ${examConflict.code}
(${course.examDate} ${course.examTime})

คุณยังต้องการเพิ่มวิชานี้ลงในแผนการเรียนหรือไม่?`);
      if (!confirmAdd) return;
    }

    try {
      const res = await fetch('/api/planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseCode: course.code }),
      });
      if (!res.ok) throw new Error('Add failed');
      await loadAllData();
      setSearchQuery('');
      if (examConflict) {
        showToast(`เพิ่มวิชา ${course.code} แล้ว (ระวังวันสอบซ้ำซ้อน!)`);
      } else {
        showToast(`เพิ่มวิชา ${course.code} เข้าตารางแล้ว`);
      }
    } catch (err) {
      setPlannerError('เพิ่มวิชาไม่สำเร็จ');
    }
  };

  const removeCourseFromPlanner = async (code: string) => {
    try {
      const res = await fetch(`/api/planner?courseCode=${code}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Remove failed');
      await loadAllData();
    } catch (err) {
      showToast('ลบวิชาไม่สำเร็จ');
    }
  };

  const handleSaveManualCourse = async () => {
    if (!manualCourseData.code || !manualCourseData.name) {
      showToast('กรุณากรอกรหัสวิชาและชื่อวิชา');
      return;
    }

    try {
      // 1. Save to courses table
      const resCourse = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(manualCourseData),
      });
      if (!resCourse.ok) throw new Error('Failed to save course details');

      // 2. Add to planner
      const resPlanner = await fetch('/api/planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseCode: manualCourseData.code }),
      });
      if (!resPlanner.ok) throw new Error('Failed to add to planner');

      await loadAllData();
      setIsManualCourseModalOpen(false);
      showToast(`เพิ่มวิชา ${manualCourseData.code} เข้าตารางแล้ว`);
      
      // Reset form
      setManualCourseData({
        code: '', name: '', credit: 3, day: 'จันทร์', time: '09:30 - 11:20',
        room: '', examDate: '', examTime: 'เช้า (09:30-12:00)'
      });
    } catch (err) {
      console.error(err);
      showToast('เกิดข้อผิดพลาดในการเพิ่มวิชา');
    }
  };

  const totalCompletedCredits = useMemo(() => {
    return completedCourses.reduce((sum, completed) => {
      if (!completed.course_code || completed.course_code === 'TEST') return sum;
      const course = mr30Courses.find(c => c.code === completed.course_code);
      return sum + (course?.credit || 0);
    }, 0);
  }, [completedCourses, mr30Courses]);

  const toggleCourseCompletion = async (courseCode: string) => {
    if (isDegreeEditMode) return;
    const existing = completedCourses.find(c => c.course_code === courseCode);
    const isCompleted = !!existing && !existing.is_reexam;
    const newCompletedStatus = !isCompleted;

    // Optimistic Update
    setCompletedCourses(prev => {
      if (isCompleted) {
        return prev.filter(c => c.course_code !== courseCode);
      } else {
        return [...prev, { course_code: courseCode, is_reexam: false, grade: 'A' }];
      }
    });

    try {
      const res = await fetch('/api/degree-plan/completed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          courseCode, 
          completed: newCompletedStatus,
          is_reexam: false,
          grade: newCompletedStatus ? 'A' : null 
        }),
      });
      if (!res.ok) throw new Error('Failed to update course completion');
      await fetchDegreePlan();
    } catch (error) {
      console.error(error);
      await fetchDegreePlan(); // Rollback
      showToast('ไม่สามารถบันทึกสถานะวิชาได้');
    }
  };

  const toggleReExam = async (courseCode: string) => {
    if (isDegreeEditMode) return;
    const existing = completedCourses.find(c => c.course_code === courseCode);
    const isReExam = !!existing && existing.is_reexam;
    const newReExamStatus = !isReExam;

    // Optimistic Update
    setCompletedCourses(prev => {
      const filtered = prev.filter(c => c.course_code !== courseCode);
      if (newReExamStatus) {
        return [...filtered, { course_code: courseCode, is_reexam: true, grade: 'F' }];
      }
      return filtered;
    });

    try {
      const res = await fetch('/api/degree-plan/completed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          courseCode, 
          completed: false,
          is_reexam: newReExamStatus,
          grade: newReExamStatus ? 'F' : null 
        }),
      });
      if (!res.ok) throw new Error('Failed to update re-exam status');
      await fetchDegreePlan();
    } catch (error) {
      console.error(error);
      await fetchDegreePlan(); // Rollback
      showToast('ไม่สามารถบันทึกสถานะสอบซ่อมได้');
    }
  };

  const updateCourseGrade = async (courseCode: string, grade: string) => {
    // Optimistic Update
    setCompletedCourses(prev => 
      prev.map(c => c.course_code === courseCode ? { ...c, grade } : c)
    );

    try {
      const res = await fetch('/api/degree-plan/completed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseCode, completed: true, grade }),
      });
      if (!res.ok) throw new Error('Failed to update grade');
      await fetchDegreePlan();
    } catch (error) {
      console.error(error);
      await fetchDegreePlan(); // Rollback
      showToast('ไม่สามารถบันทึกเกรดได้');
    }
  };

  const handleSaveDegreeSettings = async (major: string, totalCredits: number, categories: DegreeCategory[]) => {
    try {
      showToast('กำลังบันทึกข้อมูล...');
      const res = await fetch('/api/degree-plan', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ major, totalCredits, categories }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.error || 'Failed to update degree settings');
      }

      await fetchDegreePlan();
      showToast('บันทึกข้อมูลหลักสูตรเรียบร้อยแล้ว');
      setIsDegreeEditMode(false);
    } catch (error: any) {
      console.error(error);
      showToast(`เกิดข้อผิดพลาด: ${error.message}`);
    }
  };

  const handleAddCategory = () => {
    setIsAddCategoryModalOpen(true);
  };

  const closeAddCategoryModal = () => {
    setIsAddCategoryModalOpen(false);
    setNewCategoryName('');
  };

  const confirmAddCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;
    const id = Date.now().toString();
    try {
      const res = await fetch('/api/degree-plan/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name, required: 0 }),
      });
      if (!res.ok) throw new Error('Failed to add category');
      await fetchDegreePlan();
      closeAddCategoryModal();
    } catch (error) {
      console.error(error);
      showToast('ไม่สามารถเพิ่มหมวดวิชาได้');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      showToast('กำลังลบหมวดหมู่...');
      const res = await fetch(`/api/degree-plan/categories?id=${id}`, { method: 'DELETE' });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.error || 'Failed to delete category');
      }

      await fetchDegreePlan();
      showToast('ลบหมวดหมู่เรียบร้อยแล้ว');
    } catch (error: any) {
      console.error('[handleDeleteCategory] Error:', error);
      showToast(`ไม่สามารถลบหมวดวิชาได้: ${error.message}`);
      await fetchDegreePlan();
    }
  };

  const handleAddCourse = (catId: string) => {
    setTargetCategoryId(catId);
    setCourseSearchQuery('');
    setIsAddCourseModalOpen(true);
  };

  const confirmAddCourseToCategory = async (courseCode: string) => {
    if (targetCategoryId) {
      const category = degreePlan.categories.find(c => c.id === targetCategoryId);
      if (category?.courses.includes(courseCode)) {
        showToast(`วิชา ${courseCode} มีอยู่ในหมวดนี้แล้ว`);
        return;
      }

      try {
        const res = await fetch('/api/degree-plan/courses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ categoryId: targetCategoryId, courseCode }),
        });
        if (!res.ok) throw new Error('Failed to add course to category');
        await fetchDegreePlan();
        setIsAddCourseModalOpen(false);
        showToast(`เพิ่มวิชา  ${courseCode} เรียบร้อยแล้ว`);
      } catch (error) {
        console.error(error);
        showToast('ไม่สามารถเพิ่มวิชาได้');
      }
    }
  };

  const degreeSearchResults = useMemo(() => {
    if (courseSearchQuery.length < 2) return [];
    return mr30Courses.filter(c =>
      c.code.toLowerCase().includes(courseSearchQuery.toLowerCase()) ||
      c.name.includes(courseSearchQuery)
    );
  }, [courseSearchQuery, mr30Courses]);

  const handleDeleteCourse = async (catId: string, courseCode: string) => {
    try {
      const res = await fetch(`/api/degree-plan/courses?categoryId=${catId}&courseCode=${courseCode}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete course');
      await fetchDegreePlan();
    } catch (error) {
      console.error(error);
      showToast('ไม่สามารถลบวิชาได้');
    }
  };

  const gpax = useMemo(() => {
    return calculateGPAX(completedCourses, mr30Courses);
  }, [completedCourses, mr30Courses]);

  return {
    activeTab, setActiveTab,
    filterRegion, setFilterRegion,
    filterType, setFilterType,
    calendarEvents, filteredCalendar,
    isEventModalOpen, setIsEventModalOpen,
    confirmDeleteId, setConfirmDeleteId,
    toastMessage, showToast,
    eventFormData, setEventFormData,
    selectedCourses, mr30Courses,
    searchQuery, setSearchQuery,
    plannerError, setPlannerError,
    isManualCourseModalOpen, setIsManualCourseModalOpen,
    manualCourseData, setManualCourseData,
    isDegreeEditMode, setIsDegreeEditMode,
    degreePlan, setDegreePlan,
    isDegreeLoading,
    completedCourses,
    isAddCourseModalOpen, setIsAddCourseModalOpen,
    isAddCategoryModalOpen, setIsAddCategoryModalOpen,
    newCategoryName, setNewCategoryName,
    courseSearchQuery, setCourseSearchQuery,
    notifyLine, setNotifyLine,
    notifyEmail, setNotifyEmail,
    lineToken, setLineToken,
    loadAllData, updateSetting,
    handleOpenEventModal, handleSaveEvent, handleDeleteEvent,
    searchResults, addCourseToPlanner, removeCourseFromPlanner, handleSaveManualCourse,
    totalCompletedCredits, toggleCourseCompletion, toggleReExam, updateCourseGrade, handleSaveDegreeSettings,
    gpax,
    semesterRoadmap, addCourseToSemester, removeCourseFromSemester, moveCourseToSemester, renameSemester, removeSemester,
    handleAddCategory, closeAddCategoryModal, confirmAddCategory, handleDeleteCategory,
    handleAddCourse, confirmAddCourseToCategory, degreeSearchResults, handleDeleteCourse
  };
}
