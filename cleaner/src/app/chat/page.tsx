'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  Send, 
  Phone, 
  Smartphone, 
  Camera, 
  Mic, 
  Paperclip,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  Bot,
  Upload,
  X,
  ArrowLeft,
  Building,
  BookOpen,
  Target,
  Award,
  TrendingUp,
  AlertTriangle,
  CheckSquare,
  Square
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiService } from '../../services/apiService';
import { ProtectedRoute } from '../../components/ProtectedRoute';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'system';
  timestamp: Date;
  type: 'text' | 'photo' | 'command' | 'system' | 'scoring' | 'workflow' | 'manual';
  status?: 'sent' | 'delivered' | 'read';
  isCommand?: boolean;
  commandType?: 'start' | 'photo' | 'task' | 'complete' | 'note';
  data?: any; // For scoring, workflow, or manual data
  imageUrl?: string; // For photo messages
  imageType?: 'before' | 'after' | 'during'; // Type of photo
  roomType?: string; // Room the photo belongs to
}

interface ManualRequirements {
  roomType: string;
  tasks: Array<{
    description: string;
    estimatedTime: string;
    specialNotes?: string;
    isCompleted: boolean;
  }>;
  specialInstructions: string[];
  fragileItems: string[];
}

interface WorkflowGuidance {
  nextPriority: string;
  workflow: string[];
  manualTips: string[];
  qualityCheckpoints: string[];
  estimatedTime: string;
  safetyReminders: string[];
  toolsNeeded: string[];
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [isAnalyzingAfterImage, setIsAnalyzingAfterImage] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [testAnimation, setTestAnimation] = useState(false);
  const [currentProperty, setCurrentProperty] = useState<any>(null);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageName, setSelectedImageName] = useState<string>('');
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [manualTips, setManualTips] = useState<string[]>([]);
  const [beforePhotos, setBeforePhotos] = useState<Record<string, string>>({});
  const [afterPhotos, setAfterPhotos] = useState<Record<string, string>>({});
  const [currentWorkflow, setCurrentWorkflow] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const welcomeMessageLoadedRef = useRef(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const propertyId = searchParams.get('propertyId');
  const propertyName = searchParams.get('propertyName');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load property details when component mounts
  useEffect(() => {
    // Reset welcome message flag when propertyId changes
    welcomeMessageLoadedRef.current = false;
    let messageSet = false;
    let cancelled = false;

    const loadPropertyDetails = async () => {
      // Prevent duplicate welcome messages
      if (welcomeMessageLoadedRef.current) {
        return;
      }

      if (propertyId) {
        try {
          const response = await apiService.getPropertyDetails(propertyId);
          if (response.success && !cancelled) {
            setCurrentProperty(response.data);
            setIsTyping(true);
            // Get AI-generated welcome message from backend
            const aiResponse = await apiService.chatWithAI({
              message: "Generate a welcome message for this property",
              propertyId: response.data._id
            });
            if (aiResponse.success && !cancelled) {
              setMessages([{
                id: '1',
                text: aiResponse.data.message,
                sender: 'system',
                timestamp: new Date(),
                type: 'system'
              }]);
              messageSet = true;
            } else if (!cancelled) {
              // Fallback welcome message
              setMessages([{
                id: '1',
                text: `Welcome to ${response.data.name}! I'm your AI assistant. How can I help you with the cleaning tasks?`,
                sender: 'system',
                timestamp: new Date(),
                type: 'system'
              }]);
              messageSet = true;
            }
          }
        } catch (error) {
          console.error('Error loading property details:', error);
          if (!cancelled) {
            setMessages([{
              id: '1',
              text: 'Welcome to PropertySanta! I\'m your AI assistant. How can I help you today?',
              sender: 'system',
              timestamp: new Date(),
              type: 'system'
            }]);
            messageSet = true;
          }
        } finally {
          setIsTyping(false);
          setIsInitialLoading(false);
          welcomeMessageLoadedRef.current = true;
        }
      } else if (!cancelled) {
        setMessages([{
          id: '1',
          text: 'Welcome to PropertySanta! I\'m your AI assistant. How can I help you today?',
          sender: 'system',
          timestamp: new Date(),
          type: 'system'
        }]);
        setIsInitialLoading(false);
        welcomeMessageLoadedRef.current = true;
        messageSet = true;
      }
    };

    loadPropertyDetails();
    return () => { cancelled = true; };
  }, [propertyId]);

  const addMessage = (text: string, sender: 'user' | 'system', type: ChatMessage['type'] = 'text', isCommand = false, commandType?: ChatMessage['commandType'], data?: any, imageUrl?: string, imageType?: 'before' | 'after' | 'during', roomType?: string): string => {
    const messageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newMessage: ChatMessage = {
      id: messageId,
      text,
      sender,
      timestamp: new Date(),
      type,
      isCommand,
      commandType,
      data,
      imageUrl,
      imageType,
      roomType
    };
    setMessages(prev => [...prev, newMessage]);
    return messageId;
  };

  const generateAIResponse = async (userMessage: string) => {
    setIsTyping(true);
    
    // Add a small delay to make the typing animation more visible
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      // Call backend AI service
      const response = await apiService.chatWithAI({
        message: userMessage,
        propertyId: currentProperty?._id,
        roomType: currentRoom,
        completedTasks,
        manualTips
      });
      
      if (response.success) {
        addMessage(response.data.message, 'system', 'system');
        
        // Update local state with context information if available
        if (response.data.workflowState) {
          // You can store workflow state in local state if needed
          console.log('Workflow state updated:', response.data.workflowState);
        }
      } else {
        // Check if it's a network error or API error
        if (response.message?.includes('Network error') || response.message?.includes('Failed to fetch')) {
          addMessage('🌐 Network Error: Unable to connect to the server. Please check your internet connection and try again.', 'system', 'system');
        } else if (response.message?.includes('API error') || response.message?.includes('Gemini')) {
          addMessage('🤖 AI Service Error: The AI service is temporarily unavailable. Please try again in a few moments.', 'system', 'system');
        } else {
          addMessage('❌ Failed to process your request. Please try again.', 'system', 'system');
        }
      }
    } catch (error) {
      console.error('AI response error:', error);
      // Check if it's a network error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        addMessage('🌐 Network Error: Unable to connect to the server. Please check your internet connection and try again.', 'system', 'system');
      } else {
        addMessage('❌ Failed to process your request. Please try again.', 'system', 'system');
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleGetManualRequirements = async (roomType: string) => {
    if (!propertyId) {
      addMessage('❌ Property ID is required to get manual requirements.', 'system', 'system');
      return;
    }

    setIsTyping(true);
    
    // Add a small delay to make the typing animation more visible
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      const response = await apiService.getManualRequirements(propertyId, roomType);
      if (response.success) {
        const manualData = response.data as ManualRequirements;
        setCurrentRoom(roomType);
        
        let manualText = `📋 Manual Requirements for ${roomType.toUpperCase()}:\n\n`;
        
        manualData.tasks.forEach((task, index) => {
          const status = task.isCompleted ? '✅' : '⏳';
          manualText += `${status} ${task.description} (${task.estimatedTime})\n`;
          if (task.specialNotes) {
            manualText += `   📝 ${task.specialNotes}\n`;
          }
        });
        
        if (manualData.specialInstructions.length > 0) {
          manualText += `\n⚠️ Special Instructions:\n`;
          manualData.specialInstructions.forEach(instruction => {
            manualText += `• ${instruction}\n`;
          });
        }
        
        if (manualData.fragileItems.length > 0) {
          manualText += `\n🔍 Fragile Items:\n`;
          manualData.fragileItems.forEach(item => {
            manualText += `• ${item}\n`;
          });
        }
        
        addMessage(manualText, 'system', 'manual', false, undefined, manualData);
      } else {
        // Check if it's a network error or API error
        if (response.message?.includes('Network error') || response.message?.includes('Failed to fetch')) {
          addMessage('🌐 Network Error: Unable to connect to the server. Please check your internet connection and try again.', 'system', 'system');
        } else if (response.message?.includes('API error') || response.message?.includes('Gemini')) {
          addMessage('🤖 AI Service Error: The AI service is temporarily unavailable. Please try again in a few moments.', 'system', 'system');
        } else {
          addMessage('❌ Failed to get manual requirements. Please try again.', 'system', 'system');
        }
      }
    } catch (error) {
      console.error('Error getting manual requirements:', error);
      // Check if it's a network error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        addMessage('🌐 Network Error: Unable to connect to the server. Please check your internet connection and try again.', 'system', 'system');
      } else {
        addMessage('❌ Failed to get manual requirements. Please try again.', 'system', 'system');
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleGenerateWorkflow = async (roomType: string, progress: string = 'Starting') => {
    if (!propertyId) {
      addMessage('❌ Property ID is required to generate workflow.', 'system', 'system');
      return;
    }

    setIsTyping(true);
    
    // Add a small delay to make the typing animation more visible
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      const response = await apiService.generateWorkflowGuidance({
        roomType,
        propertyId,
        currentProgress: progress
      });
      
      if (response.success) {
        const workflowData = response.data as WorkflowGuidance;
        setCurrentRoom(roomType);
        setCurrentWorkflow(workflowData.workflow);
        
        let workflowText = `🎯 Workflow for ${roomType.toUpperCase()}:\n\n`;
        workflowText += `📌 Next Priority: ${workflowData.nextPriority}\n\n`;
        workflowText += `📋 Step-by-Step Workflow:\n`;
        workflowData.workflow.forEach((step, index) => {
          workflowText += `${index + 1}. ${step}\n`;
        });
        
        if (workflowData.manualTips.length > 0) {
          workflowText += `\n💡 Manual Tips:\n`;
          workflowData.manualTips.forEach(tip => {
            workflowText += `• ${tip}\n`;
          });
        }
        
        if (workflowData.qualityCheckpoints.length > 0) {
          workflowText += `\n📸 Quality Checkpoints:\n`;
          workflowData.qualityCheckpoints.forEach(checkpoint => {
            workflowText += `• ${checkpoint}\n`;
          });
        }
        
        workflowText += `\n⏱️ Estimated Time: ${workflowData.estimatedTime}`;
        
        if (workflowData.safetyReminders.length > 0) {
          workflowText += `\n\n⚠️ Safety Reminders:\n`;
          workflowData.safetyReminders.forEach(reminder => {
            workflowText += `• ${reminder}\n`;
          });
        }
        
        if (workflowData.toolsNeeded.length > 0) {
          workflowText += `\n🛠️ Tools Needed:\n`;
          workflowData.toolsNeeded.forEach(tool => {
            workflowText += `• ${tool}\n`;
          });
        }
        
        addMessage(workflowText, 'system', 'workflow', false, undefined, workflowData);
      } else {
        // Check if it's a network error or API error
        if (response.message?.includes('Network error') || response.message?.includes('Failed to fetch')) {
          addMessage('🌐 Network Error: Unable to connect to the server. Please check your internet connection and try again.', 'system', 'system');
        } else if (response.message?.includes('API error') || response.message?.includes('Gemini')) {
          addMessage('🤖 AI Service Error: The AI service is temporarily unavailable. Please try again in a few moments.', 'system', 'system');
        } else {
          addMessage('❌ Failed to generate workflow. Please try again.', 'system', 'system');
        }
      }
    } catch (error) {
      console.error('Error generating workflow:', error);
      // Check if it's a network error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        addMessage('🌐 Network Error: Unable to connect to the server. Please check your internet connection and try again.', 'system', 'system');
      } else {
        addMessage('❌ Failed to generate workflow. Please try again.', 'system', 'system');
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Photo upload triggered', event.target.files);
    const file = event.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }

    console.log('File selected:', file.name, file.size, file.type);

    try {
      // Convert file to base64
      const base64 = await fileToBase64(file);
      console.log('File converted to base64, length:', base64.length);
      
      // Set selected image for preview
      setSelectedImage(base64);
      setSelectedImageName(file.name);
      
      // Reset the file input to allow selecting the same file again
      if (event.target) {
        event.target.value = '';
      }
      
    } catch (error) {
      console.error('Photo upload error:', error);
      addMessage('❌ Failed to upload photo. Please try again.', 'system', 'system');
    }
  };

  const handleSendWithImage = async () => {
    if (!inputText.trim() && !selectedImage) return;

    const userMessage = inputText.trim();
    
    if (selectedImage) {
      // Add photo to uploaded list
      setUploadedPhotos(prev => [...prev, selectedImage]);
      
      // Enhanced text analysis for photo type and room detection
      let photoType: 'before' | 'after' | 'during' = 'during';
      let roomType = 'unknown'; // Start with unknown, don't default to currentRoom
      
      if (userMessage) {
        const lowerMessage = userMessage.toLowerCase();
        
        // Enhanced photo type detection
        if (lowerMessage.includes('before') || lowerMessage.includes('pre') || lowerMessage.includes('initial')) {
          photoType = 'before';
        } else if (lowerMessage.includes('after') || lowerMessage.includes('post') || lowerMessage.includes('final') || lowerMessage.includes('done') || lowerMessage.includes('complete')) {
          photoType = 'after';
        } else if (lowerMessage.includes('during') || lowerMessage.includes('progress') || lowerMessage.includes('working')) {
          photoType = 'during';
        }
        
        // Enhanced room type detection with more patterns
        const roomPatterns = [
          { type: 'bedroom', keywords: ['bedroom', 'bed room', 'master bedroom', 'guest bedroom', 'bed'] },
          { type: 'bathroom', keywords: ['bathroom', 'bath room', 'toilet', 'shower', 'bath', 'restroom', 'wc', 'lavatory', 'powder room'] },
          { type: 'kitchen', keywords: ['kitchen', 'cooking area', 'stove', 'sink', 'counter', 'oven', 'fridge', 'refrigerator'] },
          { type: 'living room', keywords: ['living room', 'livingroom', 'lounge', 'sitting room', 'tv room', 'family room'] },
          { type: 'dining room', keywords: ['dining room', 'diningroom', 'dining area', 'table', 'eatery'] },
          { type: 'office', keywords: ['office', 'study', 'work room', 'desk', 'workspace'] },
          { type: 'laundry room', keywords: ['laundry room', 'laundry', 'washer', 'dryer', 'utility room'] },
          { type: 'garage', keywords: ['garage', 'carport'] },
          { type: 'hallway', keywords: ['hallway', 'corridor', 'foyer', 'entryway'] },
          { type: 'balcony', keywords: ['balcony', 'terrace', 'veranda', 'patio'] },
          { type: 'closet', keywords: ['closet', 'wardrobe', 'cupboard'] },
          { type: 'garden', keywords: ['garden', 'yard', 'lawn', 'outdoor'] },
        ];
        
        let detectedRoomType = 'unknown';
        for (const pattern of roomPatterns) {
          for (const keyword of pattern.keywords) {
            if (lowerMessage.includes(keyword)) {
              detectedRoomType = pattern.type;
              break;
            }
          }
          if (detectedRoomType !== 'unknown') break;
        }
        
        // Set room type based on detection
        if (detectedRoomType && detectedRoomType !== 'unknown') {
          roomType = detectedRoomType;
          setCurrentRoom(roomType);
        } else {
          // If not detected from text, use currentRoom as fallback
          roomType = currentRoom?.toLowerCase() || 'unknown';
          if (roomType === 'unknown') {
            // Only prompt if we really don't know
            const userInput = window.prompt('Room type could not be detected from your message. Please enter the room type (e.g., bathroom, kitchen):', 'unknown') || 'unknown';
            if (userInput !== 'unknown') {
              roomType = userInput;
              setCurrentRoom(roomType);
            }
          }
        }
      } else {
        // No text message, use currentRoom as fallback
        roomType = currentRoom?.toLowerCase() || 'unknown';
      }
      
      // Add photo message to chat with proper type detection
      const displayText = userMessage || `${roomType.toUpperCase()} ${photoType.toUpperCase()}`;
      addMessage(displayText, 'user', 'photo', true, 'photo', undefined, selectedImage, photoType, roomType);
      
      // Clear input and selected image immediately when starting analysis
      setInputText('');
      setSelectedImage(null);
      setSelectedImageName('');
      
      // Show appropriate loading indicator based on photo type
      console.log('Photo type detected:', photoType);
      console.log('Room type detected:', roomType);
      console.log('User message:', userMessage);
      
      if (photoType === 'after') {
        console.log('Setting isAnalyzingAfterImage to true');
        setIsAnalyzingAfterImage(true);
      } else {
        console.log('Setting isAnalyzingImage to true for photo type:', photoType);
        setIsAnalyzingImage(true);
      }
      
      try {
        // Use new workflow photo upload endpoint with enhanced user message
        const response = await apiService.uploadPhotoWithWorkflow({
          photoBase64: selectedImage,
          photoType,
          roomType,
          propertyId: currentProperty?._id || '',
          userMessage: displayText // Pass the full user message for intelligent analysis
        });
        
        // Clear the analyzing indicators and show typing indicator for AI response
        if (photoType === 'after') {
          setIsAnalyzingAfterImage(false);
        } else {
          setIsAnalyzingImage(false);
        }
        
        // Show typing indicator while AI is processing the response
        setIsTyping(true);
        
        // Add a small delay to make the typing animation more visible
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (response.success) {
          const result = response.data;
          
          // Add AI response
          if (result.message) {
            addMessage(result.message, 'system', 'system');
          }
          
          // Check if there was an error in the analysis
          if (result.error) {
            // Don't show scoring results for errors, just the kind message
            console.log('Photo analysis completed with error');
          } else {
            // Handle successful analysis
            if (result.analysis) {
              console.log('Photo analysis completed successfully');
            }
            
            if (result.scoring) {
              console.log('Photo scoring completed successfully');
            }
          }
        } else {
          // Handle API error
          addMessage('❌ Failed to process photo. Please try again.', 'system', 'system');
        }
      } catch (error) {
        console.error('Photo upload error:', error);
        addMessage('❌ Error uploading photo. Please try again.', 'system', 'system');
      } finally {
        // Clear all loading indicators
        setIsAnalyzingImage(false);
        setIsAnalyzingAfterImage(false);
        setIsTyping(false);
      }
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    setSelectedImageName('');
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data:image/jpeg;base64, prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() && !selectedImage) return;

    if (selectedImage) {
      await handleSendWithImage();
    } else {
      const userMessage = inputText.trim();
      addMessage(userMessage, 'user', 'text', true);
      setInputText('');
      
      // Handle special commands
      if (userMessage.toLowerCase().includes('manual')) {
        const roomMatch = userMessage.match(/manual\s+(\w+)/i);
        const roomType = roomMatch ? roomMatch[1].toLowerCase() : currentRoom || 'bedroom';
        await handleGetManualRequirements(roomType);
      } else if (userMessage.toLowerCase().includes('workflow')) {
        const roomMatch = userMessage.match(/workflow\s+(\w+)/i);
        const roomType = roomMatch ? roomMatch[1].toLowerCase() : currentRoom || 'bedroom';
        await handleGenerateWorkflow(roomType);
      } else if (userMessage.toLowerCase().includes('reset ai') || userMessage.toLowerCase().includes('🔄 reset ai')) {
        await handleResetContext();
      } else if (userMessage.match(/\w+\s+(BEFORE|AFTER|DURING)/i)) {
        const roomMatch = userMessage.match(/(\w+)\s+(BEFORE|AFTER|DURING)/i);
        if (roomMatch) {
          const roomName = roomMatch[1];
          const photoType = roomMatch[2];
          addMessage(`Perfect! I'm ready for the ${roomName} ${photoType} photo. Please upload a photo now by clicking the camera or paperclip icon.`, 'system', 'system');
        }
      } else {
        await generateAIResponse(userMessage);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Debug function to reset AI context
  const handleResetContext = async () => {
    try {
      const response = await apiService.resetAIContext();
      if (response.success) {
        addMessage('🔄 AI context has been reset. Ready for a fresh start!', 'system', 'system');
      } else {
        addMessage('❌ Failed to reset AI context.', 'system', 'system');
      }
    } catch (error) {
      console.error('Reset context error:', error);
      addMessage('❌ Failed to reset AI context.', 'system', 'system');
    }
  };

  const quickCommands = currentProperty ? [
    { text: 'Show manual', command: 'manual' },
    { text: 'Generate workflow', command: 'workflow' },
    { text: 'BEDROOM BEFORE', command: 'photo' },
    { text: 'BATHROOM BEFORE', command: 'photo' },
    { text: 'KITCHEN BEFORE', command: 'photo' },
    { text: 'BEDROOM AFTER', command: 'photo' },
    { text: 'BATHROOM AFTER', command: 'photo' },
    { text: 'KITCHEN AFTER', command: 'photo' },
    { text: 'TEST ANIMATION', command: 'test' },
    { text: '🔄 Reset AI', command: 'reset' }
  ] : [
    { text: 'START 12345', command: 'start' },
    { text: 'KITCHEN BEFORE', command: 'photo' },
    { text: 'BATHROOM BEFORE', command: 'photo' },
    { text: 'LIVING ROOM BEFORE', command: 'photo' },
    { text: '1,2,3', command: 'task' },
    { text: 'NOTE: Leaky faucet', command: 'note' },
    { text: 'JOB COMPLETE 12345', command: 'complete' },
    { text: 'TEST ANIMATION', command: 'test' },
    { text: '🔄 Reset AI', command: 'reset' }
  ];

  const renderMessage = (message: ChatMessage) => {
    // Render photo message
    if (message.type === 'photo' && message.imageUrl) {
      return (
        <div
          className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg ${
            message.sender === 'user'
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
              : 'bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white'
          }`}
        >
          <div className="flex items-start space-x-2">
            {message.sender === 'system' && (
              <Bot className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
            )}
            <div className="flex-1">
              {/* Image */}
              <div className="mb-3">
                <img 
                  src={`data:image/jpeg;base64,${message.imageUrl}`} 
                  alt={`${message.roomType} ${message.imageType}`}
                  className="w-full h-48 object-cover rounded-xl shadow-md"
                />
                {message.imageType && message.roomType && (
                  <div className="mt-2 flex items-center space-x-2">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      message.imageType === 'before' 
                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200'
                        : message.imageType === 'after'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200'
                    }`}>
                      {message.imageType.toUpperCase()}
                    </div>
                    <div className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                      {message.roomType.toUpperCase()}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Text */}
              {message.text && (
                <p className="text-sm whitespace-pre-line mb-2">{message.text}</p>
              )}
              
              {/* Timestamp and status */}
              <div className="flex items-center justify-between">
                <span className="text-xs opacity-70">
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
                {message.sender === 'user' && (
                  <div className="flex items-center space-x-1">
                    {message.status === 'sent' && <CheckCircle className="w-3 h-3" />}
                    {message.status === 'delivered' && <CheckCircle className="w-3 h-3" />}
                    {message.status === 'read' && <CheckCircle className="w-3 h-3" />}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (message.type === 'scoring' && message.data) {
      return (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-4 rounded-2xl border border-green-200 dark:border-green-700">
          <div className="flex items-center space-x-2 mb-3">
            <Award className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-green-800 dark:text-green-200">Scoring Results</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Score:</span>
              <span className="text-lg font-bold text-green-600">{message.data.overallScore || 0}/100</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Grade:</span>
              <span className="text-lg font-bold text-blue-600">{message.data.detailedScoring?.grade || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Manual Compliance:</span>
              <span className="text-sm">{message.data.manualComplianceScore || 0}%</span>
            </div>
          </div>
        </div>
      );
    }

    if (message.type === 'workflow' && message.data) {
      return (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-2xl border border-blue-200 dark:border-blue-700">
          <div className="flex items-center space-x-2 mb-3">
            <Target className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-blue-800 dark:text-blue-200">Workflow Guidance</span>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Next Priority: {message.data.nextPriority || 'Not specified'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Estimated Time: {message.data.estimatedTime || 'Not specified'}
            </div>
          </div>
        </div>
      );
    }

    if (message.type === 'manual' && message.data) {
      return (
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 p-4 rounded-2xl border border-orange-200 dark:border-orange-700">
          <div className="flex items-center space-x-2 mb-3">
            <BookOpen className="w-5 h-5 text-orange-600" />
            <span className="font-semibold text-orange-800 dark:text-orange-200">Manual Requirements</span>
          </div>
          <div className="space-y-2">
            {message.data.tasks?.map((task, index) => (
              <div key={index} className="flex items-center space-x-2">
                {task.isCompleted ? <CheckSquare className="w-4 h-4 text-green-600" /> : <Square className="w-4 h-4 text-gray-400" />}
                <span className="text-sm">{task.description || 'Task description not available'}</span>
              </div>
            )) || <span className="text-sm text-gray-500">No tasks available</span>}
          </div>
        </div>
      );
    }

    return (
      <div
        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg ${
          message.sender === 'user'
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
            : 'bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white'
        }`}
      >
        <div className="flex items-start space-x-2">
          {message.sender === 'system' && (
            <Bot className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
          )}
          <div className="flex-1">
            <p className="text-sm whitespace-pre-line">{message.text}</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs opacity-70">
                {message.timestamp.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
              {message.sender === 'user' && (
                <div className="flex items-center space-x-1">
                  {message.status === 'sent' && <CheckCircle className="w-3 h-3" />}
                  {message.status === 'delivered' && <CheckCircle className="w-3 h-3" />}
                  {message.status === 'read' && <CheckCircle className="w-3 h-3" />}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
      <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 px-6 py-4 shadow-lg border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => router.push('/dashboard')}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-500 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {currentProperty ? currentProperty.name : 'PropertySanta AI'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {currentProperty ? 'Property Assistant' : 'SMS/WhatsApp Assistant'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">Online</span>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-4 scroll-smooth mt-20 mb-32">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {renderMessage(message)}
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white/80 dark:bg-gray-800/80 px-4 py-3 rounded-2xl shadow-lg">
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  AI is typing
                </span>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {isAnalyzingImage && (
          <div className="flex justify-start">
            <div className="bg-white/80 dark:bg-gray-800/80 px-4 py-3 rounded-2xl shadow-lg">
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  AI is analyzing this photo
                </span>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {isAnalyzingAfterImage && (
          <div className="flex justify-start">
            <div className="bg-white/80 dark:bg-gray-800/80 px-4 py-3 rounded-2xl shadow-lg">
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Please wait.. AI is analyzing this photo.
                </span>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {testAnimation && (
          <div className="flex justify-start">
            <div className="bg-white/80 dark:bg-gray-800/80 px-4 py-3 rounded-2xl shadow-lg">
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  🧪 Test Animation (3 seconds)
                </span>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {selectedImage && (
        <div className="fixed bottom-[152px] left-0 right-0 z-40 px-4 py-2 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 p-3 bg-white/80 dark:bg-gray-700/80 rounded-2xl">
            <img 
              src={`data:image/jpeg;base64,${selectedImage}`} 
              alt="Selected" 
              className="w-12 h-12 object-cover rounded-xl"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedImageName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Ready to send</p>
            </div>
            <button
              onClick={removeSelectedImage}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="fixed bottom-[88px] left-0 right-0 z-30 px-4 py-2 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {quickCommands.map((cmd, index) => (
            <button
              key={index}
              onClick={() => setInputText(cmd.text)}
              className="flex-shrink-0 px-3 py-2 bg-white/80 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300 text-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap"
            >
              {cmd.text}
            </button>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-4">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
            <Camera className="w-5 h-5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
            key="file-input"
          />
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="w-full px-4 py-3 bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-white rounded-2xl border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() && !selectedImage}
            className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
} 