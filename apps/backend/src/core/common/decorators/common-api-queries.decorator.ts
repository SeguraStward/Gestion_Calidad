// Common decorators for API documentation
export const CommonApiQueries = {
  include: {
    name: 'include',
    required: false,
    type: String,
    description:
      'Comma-separated list of relations to include, e.g., academicLoad,professor,academicLoad.course',
  },
  orderBy: {
    name: 'orderBy',
    required: false,
    type: String,
    description: 'JSON string for order by, e.g., {"name":"asc"}',
  },
};
