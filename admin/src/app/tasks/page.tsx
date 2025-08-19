"use client";

import { useState, useEffect, forwardRef } from 'react';
import { useRouter } from 'next/navigation';
import { taskAPI, type Task, type CreateTaskRequest as BaseCreateTaskRequest, type UpdateTaskRequest, userAPI, propertyAPI, type Property } from '@/services/api';

// Extend the CreateTaskRequest type to include propertyInfo
type CreateTaskRequest = BaseCreateTaskRequest & {
  propertyInfo?: {
    _id: string;
    propertyId: string;
    name: string;
  };
};
import { format } from 'date-fns';
import { Plus, Search, Calendar, User, Trash2, Edit, Building } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { toast } from 'sonner';

// Use the imported toast from sonner
const useToast = () => {
  return { toast };
};

// Simple button component
const Button = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'outline' | 'destructive', size?: 'default' | 'sm' | 'lg' }>(
  ({ className, variant = 'default', size = 'default', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
    const variants = {
      default: 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800',
      outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700',
      destructive: 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800',
    };
    const sizes = {
      default: 'h-10 py-2 px-4',
      sm: 'h-9 px-3 rounded-md text-sm',
      lg: 'h-11 px-8 rounded-md',
    };
    
    return (
      <button
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className || ''} focus-visible:ring-blue-500 dark:focus-visible:ring-blue-600`}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

// Simple input component
const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = 'text', ...props }, ref) => {
    return (
      <input
        type={type}
        className={`flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm ring-offset-white dark:ring-offset-gray-900 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-gray-900 dark:text-gray-100 ${className || ''}`}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

// Simple textarea component
const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={`flex min-h-[80px] w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm ring-offset-white dark:ring-offset-gray-900 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-gray-900 dark:text-gray-100 ${className || ''}`}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

// Simple select component
const Select = ({
  value,
  onValueChange,
  children,
  className,
  placeholder,
  required = false,
}: {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
  placeholder?: string;
  required?: boolean;
}) => {
  return (
    <div className={`relative ${className || ''}`}>
      <select
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className={`block w-full rounded-md border border-gray-200 dark:border-gray-600 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${!value ? 'text-gray-400 dark:text-gray-500' : ''}`}
        required={required}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {children}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-50">
          <path d="M4.18179 6.18181C4.35753 6.00608 4.64245 6.00608 4.81819 6.18181L7.49999 8.86362L10.1818 6.18181C10.3575 6.00608 10.6424 6.00607 10.8182 6.18181C10.9939 6.35755 10.9939 6.64247 10.8182 6.81821L7.81819 9.81821C7.73379 9.9026 7.61934 9.95001 7.49999 9.95001C7.38064 9.95001 7.26618 9.9026 7.18179 9.81821L4.18179 6.81821C4.00605 6.64247 4.00605 6.35755 4.18179 6.18181Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
        </svg>
      </div>
    </div>
  );
};

// Alias for compatibility with existing code
const SelectTrigger = Select;

// Simple select item component
const SelectItem = ({ value, children, ...props }: { value: string; children: React.ReactNode } & React.OptionHTMLAttributes<HTMLOptionElement>) => (
  <option value={value} {...props}>
    {children}
  </option>
);

// Simple card components
const Card = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm ${className || ''}`} {...props} />
);

const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className || ''}`} {...props} />
);

const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={`text-xl font-semibold leading-none tracking-tight text-gray-900 dark:text-white ${className || ''}`} {...props} />
);

const CardDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={`text-sm text-gray-500 dark:text-gray-400 ${className || ''}`} {...props} />
);

const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`p-6 pt-0 ${className || ''}`} {...props} />
);

const CardFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`flex items-center p-6 pt-0 ${className || ''}`} {...props} />
);

// Simple label component
const Label = ({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={`text-sm font-medium leading-none text-gray-700 dark:text-gray-300 peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className || ''}`} {...props} />
);

// Simple select placeholder component
const SelectPlaceholder = ({ children, ...props }: { children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) => (
  <div className="text-gray-400 dark:text-gray-500" {...props}>
    {children}
  </div>
);

export default function TasksPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    isActive: 'true',
  });
  
  const [cleaners, setCleaners] = useState<Array<{_id: string, name: string, role: string}>>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [customers, setCustomers] = useState<Record<string, {name: string, email: string}>>({});
  const [newTask, setNewTask] = useState<CreateTaskRequest>({
    propertyId: '',
    requirements: [],
    specialRequirement: '',
    scheduledTime: new Date(),
    assignedTo: '',
    isActive: true,
    propertyInfo: undefined
  });

  // Handle property selection
  const handlePropertySelect = (propertyId: string) => {
    const selectedProperty = properties.find(p => p.propertyId === propertyId);
    if (selectedProperty) {
      setNewTask(prev => ({
        ...prev,
        propertyId: selectedProperty._id, // Use the _id instead of propertyId
        propertyInfo: {
          _id: selectedProperty._id,
          propertyId: selectedProperty.propertyId,
          name: selectedProperty.name
        },
        requirements: (selectedProperty.roomTasks || []).map((room: { roomType: string; tasks: Array<{ description: string }> }) => ({
          roomType: room.roomType,
          isCompleted: false,
          tasks: room.tasks.map((task: { description: string }) => ({
            description: task.description,
            isCompleted: false
          }))
        }))
      }));
    }
  };



  // Fetch data (cleaners, properties, tasks, and user names)
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const [cleanersData, propertiesData, tasksData, usersData] = await Promise.all([
          userAPI.getAll(),
          propertyAPI.getAll(),
          taskAPI.getAll(),
          userAPI.getAll() // Fetch all users to get names
        ]);
        
        // Filter cleaners from all users
        const filteredCleaners = usersData.filter((user: any) => user.role === 'cleaner');

        if (isMounted) {
          setCleaners(filteredCleaners);
          setProperties(propertiesData);
          setTasks(tasksData);
          
          // Create a map of user IDs to names
          const namesMap: Record<string, string> = {};
          const customersMap: Record<string, {name: string, email: string}> = {};
          
          usersData.forEach((user: any) => {
            namesMap[user._id] = user.name;
            if (user.role === 'customer') {
              customersMap[user._id] = { name: user.name, email: user.email };
            }
          });
          setUserNames(namesMap);
          setCustomers(customersMap);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch tasks
  useEffect(() => {
    let isMounted = true;
    
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        const data = await taskAPI.getAll({
          isActive: filters.isActive === 'true' ? true : filters.isActive === 'false' ? false : undefined,
        });
        if (isMounted) {
          setTasks(data);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
        toast({
          title: 'Error',
          description: 'Failed to load tasks. Please try again.',
          variant: 'destructive',
        });
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Add a small debounce to prevent too many requests
    const timeoutId = setTimeout(fetchTasks, 300);
    
    // Cleanup function
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [filters.isActive]); // Only include filters.isActive as a dependency

  // Handle create task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Create task data with proper typing for both create and update
      const taskData = {
        ...newTask,
        requirements: newTask.requirements.map(req => ({
          roomType: req.roomType,
          isCompleted: false,
          tasks: req.tasks.map(t => ({
            description: t.description,
            isCompleted: false
          }))
        }))
      } as const;

      if (isEditing && currentTaskId) {
        await taskAPI.update(currentTaskId, {
          requirements: taskData.requirements,
          specialRequirement: taskData.specialRequirement,
          scheduledTime: taskData.scheduledTime,
          assignedTo: taskData.assignedTo,
          isActive: taskData.isActive
        });
        toast({
          title: 'Success',
          description: 'Task updated successfully',
        });
      } else {
        await taskAPI.create(taskData);
        toast({
          title: 'Success',
          description: 'Task created successfully',
        });
      }
      
      setIsTaskDialogOpen(false);
      // Refresh tasks
      const data = await taskAPI.getAll();
      setTasks(data);
      resetForm();
    } catch (error) {
      console.error('Error saving task:', error);
      toast({
        title: 'Error',
        description: `Failed to ${isEditing ? 'update' : 'create'} task. Please try again.`,
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setNewTask({
      propertyId: '',
      propertyInfo: undefined,
      requirements: [],
      specialRequirement: '',
      scheduledTime: new Date(),
      assignedTo: '',
      isActive: true
    });
    setIsEditing(false);
    setCurrentTaskId(null);
  };

  const handleEditTask = (task: Task) => {
    const property = properties.find(p => p._id === task.propertyId || p.propertyId === task.propertyId);
    setNewTask({
      propertyId: task.propertyId,
      propertyInfo: property ? {
        _id: property._id,
        propertyId: property.propertyId,
        name: property.name
      } : undefined,
      requirements: task.requirements || [],
      specialRequirement: task.specialRequirement || '',
      scheduledTime: task.scheduledTime ? new Date(task.scheduledTime) : new Date(),
      assignedTo: typeof task.assignedTo === 'string' ? task.assignedTo : task.assignedTo?._id || '',
      isActive: task.isActive,
    });
    setCurrentTaskId(task._id);
    setIsEditing(true);
    setIsTaskDialogOpen(true);
  };

  const handleCreateClick = () => {
    resetForm();
    setIsTaskDialogOpen(true);
  };

  // Calculate task status based on requirements completion
  const getTaskStatus = (task: Task) => {
    const totalRequirements = task.requirements?.length || 0;
    if (totalRequirements === 0) return 'pending';
    
    const completedRequirements = task.requirements.filter(req => 
      req.isCompleted || (req.tasks && req.tasks.every(t => t.isCompleted))
    ).length;
    
    if (completedRequirements === 0) return 'pending';
    if (completedRequirements < totalRequirements) return 'inprogress';
    return 'completed';
  };

  // Get status badge styles
  const getStatusBadgeStyles = (status: string) => {
    const baseStyles = 'px-2 py-1 rounded-md text-xs font-medium';
    switch (status) {
      case 'completed':
        return `${baseStyles} bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200`;
      case 'inprogress':
        return `${baseStyles} bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200`;
      case 'pending':
      default:
        return `${baseStyles} bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200`;
    }
  };

  // Toggle task status
  const toggleTaskStatus = async (taskId: string, isActive: boolean) => {
    try {
      await taskAPI.update(taskId, { isActive: !isActive });
      toast({
        title: 'Success',
        description: `Task ${isActive ? 'deactivated' : 'activated'} successfully`,
      });
      // Refresh tasks
      const data = await taskAPI.getAll();
      setTasks(data);
    } catch (error) {
      console.error('Error updating task status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Delete task
  const deleteTask = async (taskId: string) => {
    const confirmed = await new Promise<boolean>((resolve) => {
      // Create a custom confirmation dialog
      const dialog = document.createElement('div');
      dialog.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
      dialog.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
          <div class="flex items-center space-x-3 mb-4">
            <div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Delete Task</h3>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-300 mb-6">Are you sure you want to delete this task? This action cannot be undone.</p>
          <div class="flex space-x-3">
            <button id="cancel-btn" class="flex-1 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">
              Cancel
            </button>
            <button id="delete-btn" class="flex-1 px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors">
              Delete
            </button>
          </div>
        </div>
      `;
      
      document.body.appendChild(dialog);
      
      const cancelBtn = dialog.querySelector('#cancel-btn');
      const deleteBtn = dialog.querySelector('#delete-btn');
      
      const cleanup = () => {
        document.body.removeChild(dialog);
      };
      
      cancelBtn?.addEventListener('click', () => {
        cleanup();
        resolve(false);
      });
      
      deleteBtn?.addEventListener('click', () => {
        cleanup();
        resolve(true);
      });
    });

    if (!confirmed) return;
    
    try {
      await taskAPI.delete(taskId);
      toast({
        title: 'Success',
        description: 'Task deleted successfully',
      });
      // Refresh tasks
      const data = await taskAPI.getAll();
      setTasks(data);
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete task. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Filter tasks based on search
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.propertyId.toLowerCase().includes(filters.search.toLowerCase()) ||
      task.specialRequirement?.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <ProtectedRoute>
      <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage and schedule tasks</p>
          </div>
        <Button onClick={handleCreateClick}>
        <Plus className="mr-2 h-4 w-4" /> Schedule New Task
      </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        <Select 
          value={filters.isActive} 
          onValueChange={(value) => setFilters({ ...filters, isActive: value })}
          className="w-[180px]"
          placeholder="Status"
        >
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="true">Active</SelectItem>
          <SelectItem value="false">Inactive</SelectItem>
        </Select>
      </div>

      {/* Tasks Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary dark:border-primary/50"></div>
        </div>
      ) : filteredTasks.length === 0 ? (
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground dark:text-gray-400">No tasks found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTasks.map((task) => (
            <Card key={task._id} className="overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardHeader className="pb-3 pt-10 relative">
                <div className={getStatusBadgeStyles(getTaskStatus(task))} style={{
                  position: 'absolute',
                  top: '0.75rem',
                  left: '1rem',
                  zIndex: 10
                }}>
                  {getTaskStatus(task).charAt(0).toUpperCase() + getTaskStatus(task).slice(1)}
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-medium text-gray-900 dark:text-white">
                      Task #{task._id.slice(-6).toUpperCase()}
                    </CardTitle>
                    {/* <CardDescription className="mt-1">
                      Property: {task.propertyId}
                    </CardDescription> */}
                  </div>
                  <div className="flex items-center">
                    <div className={`h-3 w-3 rounded-full mr-2 ${task.isActive ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                    <span className="text-sm text-muted-foreground dark:text-gray-400">
                      {task.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {task.specialRequirement && (
                  <p className="text-sm text-muted-foreground dark:text-gray-400 mb-3">
                    {task.specialRequirement}
                  </p>
                )}
                <div className="flex items-center text-sm text-muted-foreground dark:text-gray-400 mb-2">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground dark:text-white" />
                  {task.scheduledTime ? (
                    <span>{format(new Date(task.scheduledTime), 'MMM d, yyyy h:mm a')}</span>
                  ) : (
                    <span>No schedule</span>
                  )}
                </div>
                {task.assignedTo && (
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4 flex-shrink-0 text-muted-foreground dark:text-gray-400" />
                      <span className="text-sm text-muted-foreground dark:text-gray-400">
                        {properties.find(p => p._id === task.propertyId || p.propertyId === task.propertyId)?.name || 'Unknown Property'} 
                        ({properties.find(p => p._id === task.propertyId || p.propertyId === task.propertyId)?.propertyId || 'N/A'})
                      </span>
                    </div>
                    {properties.find(p => p._id === task.propertyId || p.propertyId === task.propertyId)?.customer && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <User className="h-4 w-4 mr-2 flex-shrink-0 text-gray-600 dark:text-gray-400" />
                        <span className="truncate">
                          Customer:{" "}
                          {customers[properties.find(p => p._id === task.propertyId || p.propertyId === task.propertyId)?.customer || '']?.name || 
                            'Unknown Customer'}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center text-sm text-muted-foreground dark:text-gray-400">
                      <User className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">
                        {task.assignedTo ? 
                          `Assigned to: ${typeof task.assignedTo === 'string' ? 
                            (userNames[task.assignedTo] || task.assignedTo) : 
                            task.assignedTo.name}` 
                          : 'Unassigned'}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-muted/50 dark:bg-gray-700/50 p-4 border-t border-gray-200 dark:border-gray-700 pt-5">
                <div className="flex justify-end w-full items-center">
                  <div className="flex space-x-2">
                    <Button
                      variant={task.isActive ? 'outline' : 'default'}
                      size="sm"
                      onClick={() => toggleTaskStatus(task._id, task.isActive)}
                      className="dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
                    >
                      {task.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    <button
                      type="button"
                      className="p-2 rounded-full text-blue-500 hover:bg-blue-50 hover:text-blue-600 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-300 transition-colors"
                      onClick={() => handleEditTask(task as Task)}
                      title="Edit task"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    className="p-2 rounded-full text-red-500 hover:bg-red-50 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-300 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTask(task._id);
                    }}
                    title="Delete task"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Task Dialog */}
      {isTaskDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">
                {isEditing ? 'Edit Task' : 'Schedule New Task'}
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                {isEditing ? 'Update the task details' : 'Add a new cleaning task to the system'}
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleCreateTask}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="propertyId" className="text-gray-700 dark:text-gray-300">Property</Label>
                  <Select
                    value={newTask.propertyInfo?.propertyId || ''}
                    onValueChange={handlePropertySelect}
                    required
                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  >
                    <SelectItem value="" className="text-gray-900 dark:text-white">Select a property</SelectItem>
                    {properties.map(property => (
                      <SelectItem key={property._id} value={property.propertyId}>
                        {property.name} ({property.propertyId})
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                {/* Display selected property's requirements */}
                {newTask.requirements.length > 0 && (
                  <div className="space-y-4 mt-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Room Requirements</h4>
                    <div className="space-y-3">
                      {newTask.requirements.map((req, reqIndex) => (
                        <div key={reqIndex} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-700/50">
                          <h5 className="font-medium mb-2 text-gray-900 dark:text-white">{req.roomType}</h5>
                          <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
                            {req.tasks.map((task, taskIndex) => (
                              <li key={taskIndex} className="text-sm text-gray-600 dark:text-gray-300">
                                {task.description}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="scheduledTime" className="text-gray-700 dark:text-gray-300">Scheduled Time</Label>
                  <Input
                    id="scheduledTime"
                    type="datetime-local"
                    value={newTask.scheduledTime ? format(new Date(newTask.scheduledTime), "yyyy-MM-dd'T'HH:mm") : ''}
                    onChange={(e) => setNewTask({ ...newTask, scheduledTime: new Date(e.target.value) })}
                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assignedTo" className="text-gray-700 dark:text-gray-300">Assign To</Label>
                  <Select
                    value={newTask.assignedTo || ''}
                    onValueChange={(value) => setNewTask({ ...newTask, assignedTo: value })}
                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  >
                    <SelectItem value="">Select a cleaner</SelectItem>
                    {cleaners
                      .filter(cleaner => cleaner.role === 'cleaner')
                      .map(cleaner => (
                        <SelectItem key={cleaner._id} value={cleaner._id}>
                          {cleaner.name}
                        </SelectItem>
                      ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialRequirement" className="text-gray-700 dark:text-gray-300">Special Requirements</Label>
                  <Textarea
                    id="specialRequirement"
                    placeholder="Any special requirements or notes..."
                    value={newTask.specialRequirement || ''}
                    onChange={(e) => setNewTask({ ...newTask, specialRequirement: e.target.value })}
                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    rows={3}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 border-t border-gray-200 dark:border-gray-700 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsTaskDialogOpen(false)}
                  className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white"
                >
                  {isEditing ? 'Update Task' : 'Create Task'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}
      </div>
    </DashboardLayout>
  </ProtectedRoute>
  );
}