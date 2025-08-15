'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { propertyAPI, Property } from '@/services/api';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';

interface Task {
  description: string;
}

interface RoomTask {
  roomType: string;
  estimatedTime: string; // e.g. "15 minutes"
  tasks: Task[];
  specialInstructions: string[];
}

interface FormData {
  name: string;
  propertyId: string;
  address: string;
  type: 'apartment' | 'house' | 'office';
  squareFootage: string;
  roomTasks: RoomTask[];
}

export default function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params); // unwrap Promise

  type PropertyWithoutExtra = Omit<Property, 'roomTasks'> & {
    roomTasks: Array<Omit<Property['roomTasks'][number], never>>;
  };

  const [property, setProperty] = useState<PropertyWithoutExtra | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    propertyId: '',
    address: '',
    type: 'apartment',
    squareFootage: '0',
    roomTasks: []
  });

  const [newRoomType, setNewRoomType] = useState('');
  const [newTask, setNewTask] = useState<Pick<Task, 'description'>>({ description: '' });
  const [newSpecialInstruction, setNewSpecialInstruction] = useState('');

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) {
        toast.error('Invalid property ID');
        setLoading(false);
        return;
      }

      try {
        const data = await propertyAPI.getById(id);
        if (!data) throw new Error('No data returned from API');

        const roomTasksTransformed: RoomTask[] = (data.roomTasks || []).map(room => ({
          roomType: room.roomType,
          estimatedTime: room.estimatedTime || 'not set',
          tasks: (room.tasks || []).map(task => ({
            description: task.description
          })),
          specialInstructions: room.specialInstructions || []
        }));

        setProperty({
          ...data,
          roomTasks: roomTasksTransformed
        });

        setFormData({
          name: data.name || '',
          propertyId: data.propertyId || '',
          address: data.address || '',
          type: data.type || 'apartment',
          squareFootage: data.squareFootage?.toString() || '0',
          roomTasks: roomTasksTransformed
        });
      } catch (error: any) {
        console.error('Error fetching property:', error);
        toast.error(error?.response?.data?.message || 'Failed to load property');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property?._id) return;

    try {
      const updateData: any = {
        name: formData.name,
        propertyId: formData.propertyId,
        address: formData.address,
        type: formData.type,
        squareFootage: parseInt(formData.squareFootage, 10) || 0,
        roomTasks: formData.roomTasks.map(room => ({
          roomType: room.roomType,
          tasks: room.tasks.map(task => ({
            description: task.description
          })),
          estimatedTime: room.estimatedTime,
          specialInstructions: room.specialInstructions
        }))
      };

      await propertyAPI.update(property._id, updateData);
      toast.success('Property updated successfully');
      router.push('/properties');
    } catch (error: any) {
      console.error('Error updating property:', error);
      toast.error(error?.response?.data?.message || 'Failed to update property');
    }
  };

  const addRoom = () => {
    if (!newRoomType.trim()) return;

    const newRoom: RoomTask = {
      roomType: newRoomType,
      estimatedTime: '15 minutes',
      tasks: [],
      specialInstructions: []
    };

    setFormData(prev => ({
      ...prev,
      roomTasks: [...prev.roomTasks, newRoom]
    }));

    setNewRoomType('');
  };

  const removeRoom = (index: number) => {
    setFormData(prev => ({
      ...prev,
      roomTasks: prev.roomTasks.filter((_, i) => i !== index)
    }));
  };

  const addTask = (roomIndex: number) => {
    if (!newTask.description.trim()) return;

    const updatedRooms = [...formData.roomTasks];
    updatedRooms[roomIndex].tasks.push({ description: newTask.description });

    setFormData(prev => ({ ...prev, roomTasks: updatedRooms }));
    setNewTask({ description: '' });
  };

  const updateTask = (roomIndex: number, taskIndex: number, value: string) => {
    const updatedRooms = [...formData.roomTasks];
    updatedRooms[roomIndex].tasks[taskIndex].description = value;

    setFormData(prev => ({ ...prev, roomTasks: updatedRooms }));
  };

  const updateRoomTime = (roomIndex: number, time: string) => {
    const updatedRooms = [...formData.roomTasks];
    updatedRooms[roomIndex].estimatedTime = time || '15';

    setFormData(prev => ({ ...prev, roomTasks: updatedRooms }));
  };

  const removeTask = (roomIndex: number, taskIndex: number) => {
    const updatedRooms = [...formData.roomTasks];
    updatedRooms[roomIndex].tasks = updatedRooms[roomIndex].tasks.filter((_, i) => i !== taskIndex);

    setFormData(prev => ({ ...prev, roomTasks: updatedRooms }));
  };

  const addSpecialInstruction = (roomIndex: number) => {
    if (!newSpecialInstruction.trim()) return;

    const updatedRooms = [...formData.roomTasks];
    updatedRooms[roomIndex].specialInstructions.push(newSpecialInstruction);

    setFormData(prev => ({ ...prev, roomTasks: updatedRooms }));
    setNewSpecialInstruction('');
  };

  const removeSpecialInstruction = (roomIndex: number, instructionIndex: number) => {
    const updatedRooms = [...formData.roomTasks];
    updatedRooms[roomIndex].specialInstructions = updatedRooms[roomIndex].specialInstructions.filter(
      (_, i) => i !== instructionIndex
    );

    setFormData(prev => ({ ...prev, roomTasks: updatedRooms }));
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!property) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Property not found</h2>
          <Link
            href="/properties"
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          >
            Back to Properties
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/properties"
              className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Properties
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Edit Property: {property.name || 'Untitled Property'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Update property details and settings</p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Property Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Property Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            {/* Property ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Property ID
              </label>
              <input
                type="text"
                value={formData.propertyId}
                onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            {/* Property Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Property Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'apartment' | 'house' | 'office' })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="office">Office</option>
              </select>
            </div>

            {/* Square Footage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Square Footage
              </label>
              <input
                type="number"
                value={formData.squareFootage}
                onChange={(e) => setFormData({ ...formData, squareFootage: e.target.value })}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Room Tasks Section */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Room Tasks</h2>

            {/* Add Room */}
            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={newRoomType}
                onChange={(e) => setNewRoomType(e.target.value)}
                placeholder="Enter room type (e.g., Bedroom, Bathroom)"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button
                type="button"
                onClick={addRoom}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Add Room
              </button>
            </div>

            {/* Room List */}
            <div className="space-y-6">
              {formData.roomTasks.map((room, roomIndex) => (
                <div key={roomIndex} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">{room.roomType}</h3>
                    <button
                      type="button"
                      onClick={() => removeRoom(roomIndex)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Remove Room
                    </button>
                  </div>

                  {/* Tasks */}
                  <div className="mb-4">
                    <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Tasks</h4>
                    <div className="space-y-2 mb-4">
                      {room.tasks.map((task, taskIndex) => (
                        <div key={taskIndex} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded">
                          <p className="text-gray-900 dark:text-white">{task.description}</p>
                          <button
                            type="button"
                            onClick={() => removeTask(roomIndex, taskIndex)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add Task */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newTask.description}
                        onChange={(e) => setNewTask({ description: e.target.value })}
                        placeholder="Task description"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => addTask(roomIndex)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                      >
                        Add Task
                      </button>
                    </div>

                    {/* Estimated Time */}
                    <div className="mt-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Estimated Time (minutes)
                      </label>
                      <input
                        type="text"
                        value={room.estimatedTime}
                        onChange={(e) => updateRoomTime(roomIndex, e.target.value)}
                        placeholder="e.g. 15 minutes"
                        className="w-48 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Special Instructions */}
                  <div className="mb-4">
                    <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Special Instructions</h4>
                    <ul className="list-disc list-inside mb-2 space-y-1">
                      {room.specialInstructions.map((instruction, idx) => (
                        <li key={idx} className="flex justify-between items-center">
                          <span className="text-gray-700 dark:text-gray-300">{instruction}</span>
                          <button
                            type="button"
                            onClick={() => removeSpecialInstruction(roomIndex, idx)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 ml-2"
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSpecialInstruction}
                        onChange={(e) => setNewSpecialInstruction(e.target.value)}
                        placeholder="Add special instruction"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => addSpecialInstruction(roomIndex)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Link
              href="/properties"
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
            >
              Update Property
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
