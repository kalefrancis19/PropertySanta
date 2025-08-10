import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface CleaningReport {
  id: string;
  date: string;
  cleaner: string;
  property: string;
  duration: string;
  rating: number;
  photos: number;
  rooms: string[];
  issues: string[];
  notes: string;
  status: 'completed' | 'in-progress' | 'scheduled';
  completionPercentage: number;
  // Additional fields from the backend
  cleanerEmail?: string;
  address?: string;
  completedAt?: string;
  startedAt?: string;
  // Add any other fields that might be present in the response
  [key: string]: any; // Allow for additional properties
}

interface ApiResponse<T> {
  success: boolean;
  properties: T[];
  message?: string;
}

export const fetchCleaningReports = async (): Promise<CleaningReport[]> => {
  try {
    console.log(`Fetching reports from: ${API_URL}/reports`);
    const response = await axios.get<ApiResponse<CleaningReport>>(`${API_URL}/reports`, {
      headers: {
        'Content-Type': 'application/json',
      },
      validateStatus: (status) => status < 500, // Don't throw for 4xx errors
    });

    console.log('Response status:', response.status);
    console.log('Response data:', response.data);

    // Check if the response has the expected format
    if (!response.data || !response.data.success || !Array.isArray(response.data.properties)) {
      console.error('Invalid response format:', response.data);
      throw new Error(response.data?.message || 'Invalid response format from server');
    }

    console.log(`Received ${response.data.properties.length} reports`);
    return response.data.properties;
  } catch (error) {
    console.error('Error fetching cleaning reports:', error);
    
    // Provide more user-friendly error messages
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Server responded with a status code that falls out of the range of 2xx
        throw new Error(error.response.data.message || 'Failed to fetch reports');
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error('Unable to connect to the server. Please check your internet connection.');
      }
    }
    
    // For any other type of error, rethrow it
    throw error;
  }
};
