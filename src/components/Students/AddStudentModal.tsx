import React, { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { studentsAPI } from '../../api/students';
import toast from 'react-hot-toast';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddStudentModal: React.FC<AddStudentModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<any>({});

  const mutation = useMutation(studentsAPI.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('students');
      toast.success('Student created successfully');
      onClose();
    },
    onError: () => {
      toast.error('Failed to create student');
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('profile.')) {
      const profileField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          [profileField]: value
        }
      }));
    } else if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (parent === 'academicInfo' && (child === 'level' || child === 'yearOfAdmission' || child === 'currentSemester')) {
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: parseInt(value)
          }
        }));
      } else if (parent === 'emergencyContact' || parent === 'guardian') {
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        }));
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">

        <h3 className="text-lg font-semibold mb-4">Add New Student</h3>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" id="profile.firstName" name="profile.firstName" placeholder="First Name" onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-lg" required autoComplete="given-name" />
            <input type="text" id="profile.lastName" name="profile.lastName" placeholder="Last Name" onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-lg" required autoComplete="family-name" />
            <input type="text" id="registrationNumber" name="registrationNumber" placeholder="Registration Number" onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-lg" required autoComplete="off" />
            <input type="date" id="dateOfBirth" name="dateOfBirth" placeholder="Date of Birth" onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-lg" required autoComplete="bday" />
            <select id="gender" name="gender" onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-lg" required autoComplete="sex">
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            <input type="email" id="email" name="email" placeholder="Email" onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-lg" required autoComplete="email" />
            <input type="password" id="password" name="password" placeholder="Password" onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-lg" required autoComplete="new-password" />
            <input type="text" id="phone" name="phone" placeholder="Phone" onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-lg" required autoComplete="tel" />
            <input type="text" id="address.street" name="address.street" placeholder="Street" onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-lg" autoComplete="address-line1" />
            <input type="text" id="address.city" name="address.city" placeholder="City" onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-lg" autoComplete="address-level2" />
            <input type="text" id="address.state" name="address.state" placeholder="State" onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-lg" autoComplete="address-level1" />
            <input type="text" id="address.zipCode" name="address.zipCode" placeholder="Zip Code" onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-lg" autoComplete="postal-code" />
            <input type="text" id="address.country" name="address.country" placeholder="Country" onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-lg" autoComplete="country-name" />
            <input type="text" id="emergencyContact.name" name="emergencyContact.name" placeholder="Emergency Contact Name" onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-lg" required autoComplete="off" />
            <input type="text" id="emergencyContact.relationship" name="emergencyContact.relationship" placeholder="Emergency Contact Relationship" onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-lg" required autoComplete="off" />
            <input type="text" id="emergencyContact.phone" name="emergencyContact.phone" placeholder="Emergency Contact Phone" onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-lg" required autoComplete="off" />
            <input type="text" id="academicInfo.faculty" name="academicInfo.faculty" placeholder="Faculty" onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-lg" required autoComplete="off" />
            <input type="text" id="academicInfo.department" name="academicInfo.department" placeholder="Department" onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-lg" required autoComplete="off" />
            <input type="text" id="academicInfo.program" name="academicInfo.program" placeholder="Program" onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-lg" required autoComplete="off" />
            <input type="number" id="academicInfo.level" name="academicInfo.level" placeholder="Level" onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-lg" required autoComplete="off" />
            <input type="number" id="academicInfo.yearOfAdmission" name="academicInfo.yearOfAdmission" placeholder="Year of Admission" onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-lg" required autoComplete="off" />
            <input type="number" id="academicInfo.currentSemester" name="academicInfo.currentSemester" placeholder="Current Semester" onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-lg" required autoComplete="off" />
            <select id="academicInfo.status" name="academicInfo.status" onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-lg" required autoComplete="off">
              <option value="">Select Status</option>
              <option value="active">Active</option>
              <option value="graduated">Graduated</option>
              <option value="suspended">Suspended</option>
              <option value="withdrawn">Withdrawn</option>
              <option value="deferred">Deferred</option>
            </select>
            <input type="text" id="guardian.name" name="guardian.name" placeholder="Guardian Name" onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-lg" required autoComplete="off" />
            <input type="text" id="guardian.relationship" name="guardian.relationship" placeholder="Guardian Relationship" onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-lg" required autoComplete="off" />
            <input type="text" id="guardian.phone" name="guardian.phone" placeholder="Guardian Phone" onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-lg" required autoComplete="off" />
            <input type="text" id="guardian.address" name="guardian.address" placeholder="Guardian Address" onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-lg" required autoComplete="off" />
          </div>
          <div className="flex space-x-3 mt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Add Student
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudentModal;