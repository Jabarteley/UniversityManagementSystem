// src/components/staff/AddStaffModal.tsx
import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { staffAPI } from '../../api/staff';
import { coursesAPI } from '../../api/courses';

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff?: any;
}

const AddStaffModal: React.FC<AddStaffModalProps> = ({ isOpen, onClose, staff }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<any>({});

  const { data: coursesData } = useQuery('courses', coursesAPI.getAll, { enabled: isOpen });

  useEffect(() => {
    if (staff) {
      setFormData(staff);
    } else {
      setFormData({});
    }
  }, [staff, isOpen]);

  const mutation = useMutation(staffAPI.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('staff');
      toast.success('Staff created successfully');
      onClose();
    },
    onError: (err: any) => {
      console.error(err);
      toast.error('Failed to create staff');
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'teachingLoad.courses') {
      const selectedCourses = Array.from(e.target.selectedOptions, option => option.value);
      setFormData(prev => ({
        ...prev,
        teachingLoad: {
          ...prev.teachingLoad,
          courses: selectedCourses,
        },
      }));
    } else if (name.includes('.')) {
      const keys = name.split('.');
      setFormData((prev: any) => {
        let temp = { ...prev };
        let current = temp;
        for (let i = 0; i < keys.length - 1; i++) {
          current[keys[i]] = current[keys[i]] || {};
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        return temp;
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const {
      staffId,
      email,
      password,
      profile,
      phone,
      gender,
      dateOfBirth,
      address,
      emergencyContact,
      nextOfKin,
      employmentInfo,
      compensation,
    } = formData;

    const payload = {
      staffId,
      email,
      password,
      profile,
      phone,
      gender,
      dateOfBirth,
      address,
      emergencyContact,
      nextOfKin,
      employmentInfo: {
        ...employmentInfo,
        dateOfAppointment: new Date(employmentInfo.dateOfAppointment),
        currentStatus: employmentInfo.currentStatus,
      },
      compensation: {
        basicSalary: Number(compensation?.basicSalary) || 0,
        allowances: {
          housing: Number(compensation?.allowances?.housing) || 0,
          transport: Number(compensation?.allowances?.transport) || 0,
          medical: Number(compensation?.allowances?.medical) || 0,
          other: Number(compensation?.allowances?.other) || 0,
        },
        totalSalary: 0, // auto-calculated in backend
        payGrade: compensation?.payGrade || '',
      },
    };

    mutation.mutate(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">Add New Staff</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="staffId" placeholder="Staff ID" onChange={handleChange} required className="input" />
          <input name="email" placeholder="Email" type="email" onChange={handleChange} required className="input" />
          <input name="password" placeholder="Password" type="password" onChange={handleChange} required className="input" />
          <input name="profile.firstName" placeholder="First Name" onChange={handleChange} required className="input" />
          <input name="profile.lastName" placeholder="Last Name" onChange={handleChange} required className="input" />
          <input name="phone" placeholder="Phone" onChange={handleChange} required className="input" />
          <input name="gender" placeholder="Gender" onChange={handleChange} required className="input" />
          <input name="dateOfBirth" type="date" placeholder="Date of Birth" onChange={handleChange} required className="input" />
          <input name="address.street" placeholder="Street" onChange={handleChange} className="input" />
          <input name="address.city" placeholder="City" onChange={handleChange} className="input" />
          <input name="address.state" placeholder="State" onChange={handleChange} className="input" />
          <input name="address.zipCode" placeholder="Zip Code" onChange={handleChange} className="input" />
          <input name="address.country" placeholder="Country" onChange={handleChange} className="input" />
          <input name="emergencyContact.name" placeholder="Emergency Contact Name" onChange={handleChange} className="input" />
          <input name="emergencyContact.relationship" placeholder="Emergency Contact Relationship" onChange={handleChange} className="input" />
          <input name="emergencyContact.phone" placeholder="Emergency Contact Phone" onChange={handleChange} className="input" />
          <input name="nextOfKin.name" placeholder="Next of Kin Name" onChange={handleChange} className="input" />
          <input name="nextOfKin.relationship" placeholder="Next of Kin Relationship" onChange={handleChange} className="input" />
          <input name="nextOfKin.phone" placeholder="Next of Kin Phone" onChange={handleChange} className="input" />
          <input name="nextOfKin.address" placeholder="Next of Kin Address" onChange={handleChange} className="input" />
          <input name="employmentInfo.department" placeholder="Department" onChange={handleChange} className="input" />
          <input name="employmentInfo.faculty" placeholder="Faculty" onChange={handleChange} className="input" />
          <input name="employmentInfo.position" placeholder="Position" onChange={handleChange} className="input" />
          <input name="employmentInfo.rank" placeholder="Rank" onChange={handleChange} className="input" />
          <select name="employmentInfo.employmentType" onChange={handleChange} className="input">
            <option value="">Select Type</option>
            <option value="academic">Academic</option>
            <option value="administrative">Administrative</option>
            <option value="support">Support</option>
            <option value="contract">Contract</option>
          </select>
          <input name="employmentInfo.dateOfAppointment" type="date" onChange={handleChange} className="input" />
          <select name="employmentInfo.currentStatus" onChange={handleChange} className="input">
            <option value="">Select Status</option>
            <option value="active">Active</option>
            <option value="on-leave">On Leave</option>
            <option value="suspended">Suspended</option>
            <option value="retired">Retired</option>
            <option value="terminated">Terminated</option>
          </select>
          <input name="compensation.basicSalary" type="number" placeholder="Basic Salary" onChange={handleChange} className="input" />
          <input name="compensation.allowances.housing" type="number" placeholder="Housing Allowance" onChange={handleChange} className="input" />
          <input name="compensation.allowances.transport" type="number" placeholder="Transport Allowance" onChange={handleChange} className="input" />
          <input name="compensation.allowances.medical" type="number" placeholder="Medical Allowance" onChange={handleChange} className="input" />
          <input name="compensation.allowances.other" type="number" placeholder="Other Allowances" onChange={handleChange} className="input" />
          <input name="compensation.payGrade" placeholder="Pay Grade" onChange={handleChange} className="input" />

          <div className="md:col-span-2">
            <label htmlFor="courses" className="block text-sm font-medium text-gray-700">Assign Courses</label>
            <select 
              multiple 
              name="teachingLoad.courses" 
              onChange={handleChange} 
              className="input mt-1 block w-full h-32"
              value={formData.teachingLoad?.courses || []}
            >
              {coursesData?.courses.map((course: any) => (
                <option key={course._id} value={course._id}>
                  {course.courseName} ({course.courseCode})
                </option>
              ))}
            </select>
          </div>
        </form>
        <div className="flex justify-end gap-4 mt-6">
          <button onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded">Create Staff</button>
        </div>
      </div>
    </div>
  );
};

export default AddStaffModal;
