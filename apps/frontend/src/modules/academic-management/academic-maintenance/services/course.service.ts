import { GenericService } from '@/services/base/generic.service'
import { CourseWithRelations, CreateCourseInput } from '@/shared/types/course'

export class CourseService extends GenericService<CourseWithRelations, CreateCourseInput, Partial<CreateCourseInput>> {
  constructor() {
    super('courses')
  }
}

export const courseService = new CourseService()
