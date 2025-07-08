import React from 'react';
import { useQuery } from 'react-query';
import { studentsAPI } from '../api/students';
import { useAuth } from '../hooks/useAuth';

const MyStudents: React.FC = () => {
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery(
    ['my-students', user?._id],
    () => studentsAPI.getStudentsByStaff(user?._id),
    {
      enabled: !!user?._id,
    }
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading students</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Students</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.students.map((student: any) => (
          <div key={student._id} className="bg-white p-4 border rounded-lg">
            <h2 className="font-semibold">{student.userId.profile.firstName} {student.userId.profile.lastName}</h2>
            <p className="text-sm text-gray-600">{student.registrationNumber}</p>
            <p className="text-sm text-gray-600">{student.academicInfo.department}</p>
            <p className="text-sm text-gray-600">Level {student.academicInfo.level}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyStudents;
