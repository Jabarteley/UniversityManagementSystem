import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { coursesAPI } from '../api/courses';
import { useAuth } from '../hooks/useAuth';

const CourseRegistration: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  // Fetch available courses
  const { data: coursesData, isLoading: coursesLoading } = useQuery('courses', coursesAPI.getAll);

  // Get the current student's ID from the auth context
  const studentId = user?.studentId; // Assuming studentId is available in the user object

  const mutation = useMutation(
    (courseIds: string[]) => studentsAPI.registerCourses(studentId!, courseIds),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['students', studentId]);
        toast.success('Courses registered successfully');
        setSelectedCourses([]);
      },
      onError: () => {
        toast.error('Failed to register courses');
      },
    }
  );

  const handleCourseSelection = (courseId: string) => {
    setSelectedCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId) 
        : [...prev, courseId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) {
      toast.error('Student ID not found. Please log in as a student.');
      return;
    }
    mutation.mutate(selectedCourses);
  };

  if (coursesLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Course Registration</h1>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coursesData?.data?.map((course: any) => (
            <div key={course._id} className={`p-4 border rounded-lg cursor-pointer ${selectedCourses.includes(course._id) ? 'bg-blue-100 border-blue-500' : 'bg-white'}`}>
              <input 
                type="checkbox" 
                id={course._id} 
                checked={selectedCourses.includes(course._id)} 
                onChange={() => handleCourseSelection(course._id)} 
                className="mr-2"
              />
              <label htmlFor={course._id} className="font-semibold">{course.courseName}</label>
              <p className="text-sm text-gray-600">{course.courseCode}</p>
              <p className="text-sm text-gray-600">Credit Hours: {course.creditHours}</p>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg" disabled={selectedCourses.length === 0}>
            Register Selected Courses
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseRegistration;
