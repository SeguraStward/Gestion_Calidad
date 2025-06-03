import { HttpClient } from '@/lib/http-client'; // Import HttpClient
import { GenericService } from '@/services/base/generic.service';
import type {
  AcademicLoadWithRelations,
  CreateAcademicLoadInput,
  UpdateAcademicLoadInput,
  SimpleCourse,
  SimpleProfessor,
  AcademicCycleWithRelations,
  AcademicLoadGroupWithRelations,
  ScheduleWithRelations
} from '../types/academic-load';
import type { CampusWithRelations } from '@/modules/academic-management/academic-maintenance/types/institutional/campus';
import type { ClassroomWithRelations } from '@/modules/academic-management/academic-maintenance/types/institutional/classroom';

// This service will interact with the backend API for AcademicLoad entities
export class AcademicLoadService extends GenericService<
  AcademicLoadWithRelations,
  CreateAcademicLoadInput,
  UpdateAcademicLoadInput
> {
  constructor() {
    super('academic-loads');
  }

  private async fetchData<T>(endpoint: string, params?: any): Promise<T[]> {
    try {
      const response = await HttpClient.get(endpoint, { params });
      // Assuming backend returns { data: [...] } or just [...]
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error(`Failed to fetch data from ${endpoint}:`, error);
      // this.handleError(error); // If handleError is accessible and desired
      throw error; // Re-throw or handle as appropriate
    }
  }

  fetchSimplifiedCourses = async (): Promise<SimpleCourse[]> => {
    // Assuming endpoint returns SimpleCourse[] or { data: SimpleCourse[] }
    // Adjust endpoint and params as per your backend API for courses
    return this.fetchData<SimpleCourse>('/courses', { simplified: true });  }

  fetchSimplifiedProfessors = async (): Promise<SimpleProfessor[]> => {
    // Assuming endpoint returns SimpleProfessor[] or { data: SimpleProfessor[] }
    // Adjust endpoint and params as per your backend API for users
    // Corrected filter to query by role name within the 'roles' relation
    return this.fetchData<SimpleProfessor>('/users', {
      where: {
        roles: {
          some: {
            // Assuming your UserRole model has a 'name' field for the role title
            // If your UserRole model uses a different field for the role title (e.g., 'title', 'roleName'),
            // adjust 'name' to that field.
            name: 'PROFESSOR',
          },
        },
      },
      simplified: true,
    });
  }

  fetchAcademicCycles = async (): Promise<AcademicCycleWithRelations[]> => { // Or AcademicCycle[] if that's what backend provides
    return this.fetchData<AcademicCycleWithRelations>('/academic-cycles');
  }

  fetchCampuses = async (): Promise<CampusWithRelations[]> => {
    return this.fetchData<CampusWithRelations>('/campuses');
  }

  fetchClassrooms = async (): Promise<ClassroomWithRelations[]> => {
    return this.fetchData<ClassroomWithRelations>('/classrooms');
  }

  fetchAcademicLoadGroups = async (): Promise<AcademicLoadGroupWithRelations[]> => { // Or AcademicLoadGroup[]
    return this.fetchData<AcademicLoadGroupWithRelations>('/academic-load-groups');
  }

  fetchSchedules = async (): Promise<ScheduleWithRelations[]> => { // Or Schedule[]
    return this.fetchData<ScheduleWithRelations>('/schedules');
  }

  // fetchAssignments, addAssignment, updateAssignment, deleteAssignment
  // are now handled by the GenericService base class methods:
  // list(), create(), update(), remove() respectively.
}

const academicLoadServiceInstance = new AcademicLoadService();

// Export specific fetch methods for form data population
export const fetchSimplifiedCourses = academicLoadServiceInstance.fetchSimplifiedCourses;
export const fetchSimplifiedProfessors = academicLoadServiceInstance.fetchSimplifiedProfessors;
export const fetchAcademicCycles = academicLoadServiceInstance.fetchAcademicCycles;
export const fetchCampuses = academicLoadServiceInstance.fetchCampuses;
export const fetchClassrooms = academicLoadServiceInstance.fetchClassrooms;
export const fetchAcademicLoadGroups = academicLoadServiceInstance.fetchAcademicLoadGroups;
export const fetchSchedules = academicLoadServiceInstance.fetchSchedules;

// Export the instance for direct use by CRUD hooks (useList, useCreate, etc.)
export { academicLoadServiceInstance as academicLoadService };
