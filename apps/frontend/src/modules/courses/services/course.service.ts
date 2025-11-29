import HttpClient from '@/lib/http-client'
import type {
  BulkImportCoursesDto,
  BulkImportCoursesResultDto
} from '../types/course.types'

const COURSES_ENDPOINT = 'courses'

export const courseService = {
  /**
   * Bulk import courses from Excel
   */
  async bulkImportCourses(data: BulkImportCoursesDto): Promise<BulkImportCoursesResultDto> {
    const response = await HttpClient.post<BulkImportCoursesResultDto>(
      `/${COURSES_ENDPOINT}/bulk-import`,
      data
    )
    return response.data
  }
}
