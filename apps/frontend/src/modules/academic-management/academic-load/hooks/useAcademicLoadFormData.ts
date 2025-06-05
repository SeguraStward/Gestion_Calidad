import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { academicLoadService } from '../services/academic-load.service';

// Define types for form data
interface FormDataItem {
  id: string;
  name: string;
  [key: string]: any;
}

interface FormData {
  courses: FormDataItem[];
  isLoadingCourses: boolean;
  professors: FormDataItem[];
  isLoadingProfessors: boolean;
  academicCycles: FormDataItem[];
  isLoadingAcademicCycles: boolean;
  campuses: FormDataItem[];
  isLoadingCampuses: boolean;
  groups: FormDataItem[];
  isLoadingGroups: boolean;
  classrooms: FormDataItem[];
  isLoadingClassrooms: boolean;
  schedules: FormDataItem[];
  isLoadingSchedules: boolean;
}

// Helper function to fetch and transform data
async function fetchAndTransformData(endpoint: string, transform: (item: any) => FormDataItem) {
  try {
    const res = await academicLoadService.list({ include: endpoint });
    return res.data
      .map((item: any) => transform(item[endpoint]))
      .filter(Boolean)
      .filter((item: FormDataItem, index: number, self: FormDataItem[]) => 
        index === self.findIndex((t) => t.id === item.id)
      );
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return [];
  }
}

// Transform functions for each entity
const transforms = {
  course: (course: any) => ({
    id: course.id,
    name: course.name,
    code: course.code,
    credits: course.credits
  }),
  professor: (professor: any) => ({
    id: professor.id,
    name: `${professor.fullName} ${professor.fullLastName || ''}`.trim(),
    email: professor.email
  }),
  academicCycle: (cycle: any) => ({
    id: cycle.id,
    name: cycle.name,
    year: cycle.year,
    cycleNumber: cycle.cycleNumber
  }),
  campus: (campus: any) => ({
    id: campus.id,
    name: campus.name,
    code: campus.code
  }),
  group: (group: any) => ({
    id: group.id,
    name: group.name || group.number,
    number: group.number
  }),
  classroom: (classroom: any) => ({
    id: classroom.id,
    name: classroom.roomNumber,
    capacity: classroom.capacity
  }),
  schedule: (schedule: any) => ({
    id: schedule.id,
    name: `${schedule.day || schedule.dayOfWeek || ''} ${schedule.startTime}-${schedule.endTime}`.trim(),
    day: schedule.day || schedule.dayOfWeek,
    startTime: schedule.startTime,
    endTime: schedule.endTime
  })
};

export function useAcademicLoadFormData(): FormData {
  // Fetch all required data in parallel
  const { data: courses = [], isLoading: isLoadingCourses } = useQuery({
    queryKey: ['courses'],
    queryFn: () => fetchAndTransformData('course', transforms.course)
  });

  const { data: professors = [], isLoading: isLoadingProfessors } = useQuery({
    queryKey: ['professors'],
    queryFn: () => fetchAndTransformData('professor', transforms.professor)
  });

  const { data: academicCycles = [], isLoading: isLoadingAcademicCycles } = useQuery({
    queryKey: ['academicCycles'],
    queryFn: () => fetchAndTransformData('academicCycle', transforms.academicCycle)
  });

  const { data: campuses = [], isLoading: isLoadingCampuses } = useQuery({
    queryKey: ['campuses'],
    queryFn: () => fetchAndTransformData('campus', transforms.campus)
  });

  const { data: groups = [], isLoading: isLoadingGroups } = useQuery({
    queryKey: ['groups'],
    queryFn: () => fetchAndTransformData('group', transforms.group)
  });

  const { data: classrooms = [], isLoading: isLoadingClassrooms } = useQuery({
    queryKey: ['classrooms'],
    queryFn: () => fetchAndTransformData('classroom', transforms.classroom)
  });

  const { data: schedules = [], isLoading: isLoadingSchedules } = useQuery({
    queryKey: ['schedules'],
    queryFn: () => fetchAndTransformData('schedule', transforms.schedule)
  });

  return useMemo(() => ({
    courses,
    isLoadingCourses,
    professors,
    isLoadingProfessors,
    academicCycles,
    isLoadingAcademicCycles,
    campuses,
    isLoadingCampuses,
    groups,
    isLoadingGroups,
    classrooms,
    isLoadingClassrooms,
    schedules,
    isLoadingSchedules,
  }), [
    courses, isLoadingCourses,
    professors, isLoadingProfessors,
    academicCycles, isLoadingAcademicCycles,
    campuses, isLoadingCampuses,
    groups, isLoadingGroups,
    classrooms, isLoadingClassrooms,
    schedules, isLoadingSchedules,
  ]);
}
