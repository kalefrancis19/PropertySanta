'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, userAPI } from '@/services/api';
import { toast } from 'sonner';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
    Plus, 
    Edit, 
    Trash2, 
    FileText, 
    Home,
    MapPin,
    Square,
    Building,
    X,
    User as UserIcon,
    Search
  } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';

interface UserFormData {
  _id?: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'cleaner' | 'customer';
  phone: string;
  isActive: boolean;
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    role: 'cleaner',
    phone: '',
    isActive: true
  });

  // Fetch users
  const fetchUsers = async () => {
    try {
      const data = await userAPI.getAll();
      setUsers(data);
      setFilteredUsers(sortUsersByRole([...data]));
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // Sort users by role (admin, customer, cleaner)
  const sortUsersByRole = (userList: User[]) => {
    const roleOrder = { admin: 1, customer: 2, cleaner: 3 };
    return userList.sort((a, b) => {
      return (roleOrder[a.role as keyof typeof roleOrder] || 0) - (roleOrder[b.role as keyof typeof roleOrder] || 0);
    });
  };

  // Filter users by role and search
  const filterUsers = (role: string, search: string) => {
    setSelectedRoleFilter(role);
    setSearchFilter(search);
    
    let filtered = users;
    
    // Filter by role
    if (role) {
      filtered = filtered.filter(user => user.role === role);
    }
    
    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.phone?.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredUsers(sortUsersByRole(filtered));
  };

  // Filter users by role
  const filterUsersByRole = (role: string) => {
    filterUsers(role, searchFilter);
  };

  // Filter users by search
  const filterUsersBySearch = (search: string) => {
    filterUsers(selectedRoleFilter, search);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (formData._id) {
        // Update existing user
        await userAPI.update(formData._id, formData);
        toast.success('User updated successfully');
      } else {
        // Create new user
        if (!formData.password) {
          toast.error('Password is required');
          return;
        }
        await userAPI.create(formData);
        toast.success('User created successfully');
      }
      
      // Reset form and refresh user list
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'cleaner',
        phone: '',
        isActive: true
      });
      setIsModalOpen(false);
      await fetchUsers();
    } catch (error: any) {
      console.error('Error saving user:', error);
      
      // Handle specific error for existing user
      if (error.response?.status === 400 && error.response?.data?.message === 'User already exists') {
        toast.error('A user with this email already exists. Please use a different email address.');
      } else {
        toast.error(`Failed to ${formData._id ? 'update' : 'create'} user`);
      }
    }
  };

  // Handle edit
  const handleEdit = (user: User) => {
    setFormData({
      _id: user._id,
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      phone: user.phone || '',
      isActive: user.isActive ?? true
    });
    setIsModalOpen(true);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    const confirmed = await new Promise<boolean>((resolve) => {
      toast.custom((t) => (
        <div className="flex flex-col space-y-3 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">Delete User</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">Are you sure you want to delete this user? This action cannot be undone.</p>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                toast.dismiss(t);
                resolve(false);
              }}
              className="flex-1 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                toast.dismiss(t);
                resolve(true);
              }}
              className="flex-1 px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      ), {
        duration: Infinity,
      });
    });

    if (!confirmed) return;
    
    try {
      await userAPI.delete(id);
      toast.success('User deleted successfully');
      await fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  // Toggle user status
  const toggleStatus = async (user: User) => {
    try {
      await userAPI.update(user._id, { isActive: !user.isActive });
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`);
      await fetchUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error('Failed to update user status');
    }
  };

  // Handle user row click for navigation
  const handleUserClick = (user: User, event: React.MouseEvent) => {
    // Don't navigate if clicking on action buttons
    const target = event.target as HTMLElement;
    if (target.closest('button') || target.closest('span[onClick]')) {
      return;
    }

    if (user.role === 'customer') {
      // Navigate to properties page with customer filter
      router.push(`/properties?customer=${user._id}`);
    } else if (user.role === 'cleaner') {
      // Navigate to tasks page with cleaner filter
      router.push(`/tasks?cleaner=${user._id}`);
    }
    // Admin users don't navigate anywhere
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage users using propertySanta</p>
          </div>
        <button
          onClick={() => {
            setFormData({
              name: '',
              email: '',
              password: '',
              role: 'cleaner',
              phone: '',
              isActive: true
            });
            setIsModalOpen(true);
          }}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
          <Plus className="h-4 w-4" />
          <span>Add New User</span>
        </button>
        </div>

        {/* Filter Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-end space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name, email, or phone..."
                value={searchFilter}
                onChange={(e) => filterUsersBySearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filter by Role:
            </label>
            <select
              value={selectedRoleFilter}
              onChange={(e) => filterUsersByRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="cleaner">Cleaner</option>
              <option value="customer">Customer</option>
            </select>
            {(selectedRoleFilter || searchFilter) && (
              <button
                onClick={() => {
                  filterUsersByRole('');
                  filterUsersBySearch('');
                }}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Clear All
              </button>
            )}
          </div>
          {(selectedRoleFilter || searchFilter) && (
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-right">
              Showing {filteredUsers.length} of {users.length} users
            </div>
          )}
        </div>

      <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 p-6">
            <div className="flex justify-between items-center mb-4">
              <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white">
                {formData._id ? 'Edit User' : 'Create New User'}
              </Dialog.Title>
              <Dialog.Close className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <X className="h-5 w-5" />
              </Dialog.Close>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-2 border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Password {formData._id && '(leave blank to keep current)'}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full p-2 border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  required={!formData._id}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full p-2 border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  required
                >
                  <option value="admin">Admin</option>
                  <option value="cleaner">Cleaner</option>
                  <option value="customer">Customer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full p-2 border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700 dark:text-white">
                  Active
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="px-4 py-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                  >
                    Cancel
                  </button>
                </Dialog.Close>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  {formData._id ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr className="bg-white dark:bg-gray-800">
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-700 dark:text-gray-300">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr className="bg-white dark:bg-gray-800">
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <UserIcon className="h-8 w-8 text-gray-400" />
                      <p>{selectedRoleFilter ? 'No users found for selected role' : 'No users found'}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr 
                    key={user._id} 
                    className={`bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150 ${
                      user.role === 'customer' || user.role === 'cleaner' ? 'cursor-pointer' : ''
                    }`}
                    onClick={(e) => handleUserClick(user, e)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          <UserIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">ID: {user._id?.substring(0, 6)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-200">{user.email}</div>
                      {user.phone && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{user.phone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200' 
                          : user.role === 'cleaner'
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                            : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                      }`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span 
                        onClick={() => toggleStatus(user)}
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer transition-colors duration-200 ${
                          user.isActive 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800/50' 
                            : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800/50'
                        }`}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3">
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30"
                          title="Edit user"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30"
                          title="Delete user"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </DashboardLayout>
  </ProtectedRoute>
  );
}
