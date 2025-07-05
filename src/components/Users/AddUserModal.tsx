import React, { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { usersAPI } from '../../api/users';
import toast from 'react-hot-toast';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<any>({});

  const mutation = useMutation(usersAPI.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('users');
      toast.success('User created successfully');
      onClose();
    },
    onError: () => {
      toast.error('Failed to create user');
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Add New User</h3>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" name="username" placeholder="Username" onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-lg" />
            <input type="email" name="email" placeholder="Email" onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-lg" />
            <input type="password" name="password" placeholder="Password" onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-lg" />
            <select name="role" onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-lg">
              <option value="">Select Role</option>
              <option value="student">Student</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex space-x-3 mt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Add User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;