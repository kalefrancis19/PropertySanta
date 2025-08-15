"use client";

import { useState, useEffect, forwardRef } from 'react';
import { useRouter } from 'next/navigation';
import { taskAPI, type Task, type CreateTaskRequest } from '@/services/api';
import { format } from 'date-fns';
import { Plus, Search, Calendar, User } from 'lucide-react';

// Simple toast notification hook
const useToast = () => {
  const showToast = (options: { title: string; description: string; variant?: 'default' | 'destructive' }) => {
    // This is a simple implementation - in a real app, you'd want to use a proper toast library
    console[options.variant === 'destructive' ? 'error' : 'log'](options.title, options.description);
    alert(`${options.title}: ${options.description}`);
  };
  return { toast: showToast };
};

// Simple button component
const Button = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'outline' | 'destructive', size?: 'default' | 'sm' | 'lg' }>(
  ({ className, variant = 'default', size = 'default', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
    const variants = {
      default: 'bg-blue-600 text-white hover:bg-blue-700',
      outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
      destructive: 'bg-red-600 text-white hover:bg-red-700',
    };
    const sizes = {
      default: 'h-10 py-2 px-4',
      sm: 'h-9 px-3 rounded-md text-sm',
      lg: 'h-11 px-8 rounded-md',
    };
    
    return (
      <button
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className || ''}`}
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
        className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className || ''}`}
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
        className={`flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className || ''}`}
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
}: {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
  placeholder?: string;
}) => {
  return (
    <div className={`relative ${className || ''}`}>
      <select
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none pr-8 ${!value ? 'text-gray-400' : ''}`}
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
  <div className={`rounded-lg border bg-white shadow-sm ${className || ''}`} {...props} />
);

const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className || ''}`} {...props} />
);

const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={`text-xl font-semibold leading-none tracking-tight ${className || ''}`} {...props} />
);

const CardDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={`text-sm text-gray-500 ${className || ''}`} {...props} />
);

const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`p-6 pt-0 ${className || ''}`} {...props} />
);

const CardFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`flex items-center p-6 pt-0 ${className || ''}`} {...props} />
);

// Simple label component
const Label = ({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className || ''}`} {...props} />
);

// Simple select placeholder component
const SelectPlaceholder = ({ children, ...props }: { children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) => (
  <div className="text-gray-400" {...props}>
    {children}
  </div>
);

export default function TasksPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    isActive: 'true',
  });
  
  const [newTask, setNewTask] = useState<CreateTaskRequest>({
    propertyId: '',
    requirements: [],
    specialRequirement: '',
    scheduledTime: new Date(),
    isActive: true,
  });

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
      await taskAPI.create(newTask);
      toast({
        title: 'Success',
        description: 'Task created successfully',
      });
      setIsCreateDialogOpen(false);
      // Refresh tasks
      const data = await taskAPI.getAll();
      setTasks(data);
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: 'Error',
        description: 'Failed to create task. Please try again.',
        variant: 'destructive',
      });
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

  // Filter tasks based on search
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.propertyId.toLowerCase().includes(filters.search.toLowerCase()) ||
      task.specialRequirement?.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">Manage and monitor cleaning tasks</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Task
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            className="pl-10"
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
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : filteredTasks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No tasks found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTasks.map((task) => (
            <Card key={task._id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-medium">
                      Task #{task._id.slice(-6).toUpperCase()}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Property: {task.propertyId}
                    </CardDescription>
                  </div>
                  <div className="flex items-center">
                    <div className={`h-3 w-3 rounded-full mr-2 ${task.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="text-sm text-muted-foreground">
                      {task.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {task.specialRequirement && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {task.specialRequirement}
                  </p>
                )}
                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <Calendar className="h-4 w-4 mr-2" />
                  {task.scheduledTime ? (
                    <span>{format(new Date(task.scheduledTime), 'MMM d, yyyy h:mm a')}</span>
                  ) : (
                    <span>No schedule</span>
                  )}
                </div>
                {task.assignedTo && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="h-4 w-4 mr-2" />
                    <span>Assigned to: {typeof task.assignedTo === 'string' ? task.assignedTo : task.assignedTo.name}</span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-muted/50 p-4 border-t">
                <div className="flex justify-between w-full">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/tasks/${task._id}`)}
                  >
                    View Details
                  </Button>
                  <Button
                    variant={task.isActive ? 'outline' : 'default'}
                    size="sm"
                    onClick={() => toggleTaskStatus(task._id, task.isActive)}
                  >
                    {task.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Create Task Dialog */}
      {isCreateDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create New Task</CardTitle>
              <CardDescription>Add a new cleaning task to the system</CardDescription>
            </CardHeader>
            <form onSubmit={handleCreateTask}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="propertyId">Property ID</Label>
                  <Input
                    id="propertyId"
                    placeholder="Enter property ID"
                    value={newTask.propertyId}
                    onChange={(e) => setNewTask({ ...newTask, propertyId: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scheduledTime">Scheduled Time</Label>
                  <Input
                    id="scheduledTime"
                    type="datetime-local"
                    value={newTask.scheduledTime ? format(new Date(newTask.scheduledTime), "yyyy-MM-dd'T'HH:mm") : ''}
                    onChange={(e) => setNewTask({ ...newTask, scheduledTime: new Date(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialRequirement">Special Requirements</Label>
                  <Textarea
                    id="specialRequirement"
                    placeholder="Any special requirements or notes..."
                    value={newTask.specialRequirement || ''}
                    onChange={(e) => setNewTask({ ...newTask, specialRequirement: e.target.value })}
                    rows={3}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Task</Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}