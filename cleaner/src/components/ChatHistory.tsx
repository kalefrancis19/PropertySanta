'use client';

import React, { useState, useEffect } from 'react';
import { MessageCircle, User, Bot, Camera, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { apiService } from '../services/apiService';

interface ChatMessage {
  message: string;
  sender: 'user' | 'system';
  timestamp: Date;
  type: 'text' | 'photo' | 'command' | 'system' | 'scoring' | 'workflow' | 'manual';
  isCommand?: boolean;
  commandType?: 'start' | 'photo' | 'task' | 'complete' | 'note';
  data?: any;
  imageUrl?: string;
  imageType?: 'before' | 'after' | 'during';
  roomType?: string;
}

interface ChatHistoryProps {
  taskId: string;
  onClose?: () => void;
  isOpen?: boolean;
}

export default function ChatHistory({ taskId, onClose, isOpen = false }: ChatHistoryProps) {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && taskId) {
      loadChatHistory();
    }
  }, [isOpen, taskId]);

  const loadChatHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getChatHistory(taskId);
      if (response.success && response.data?.chatHistory) {
        setChatHistory(response.data.chatHistory);
      } else {
        setChatHistory([]);
      }
    } catch (err: any) {
      console.error('Error loading chat history:', err);
      setError('Failed to load chat history');
    } finally {
      setLoading(false);
    }
  };

  const getMessageIcon = (type: string, sender: string) => {
    if (type === 'photo') {
      return <Camera className="w-4 h-4" />;
    }
    if (type === 'workflow') {
      return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>;
    }
    if (type === 'manual') {
      return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>;
    }
    if (type === 'scoring') {
      return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>;
    }
    if (type === 'command') {
      return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>;
    }
    return sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />;
  };

  const getMessageStyle = (sender: string) => {
    return sender === 'user' 
      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white ml-auto' 
      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <MessageCircle className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Chat History
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                  onClick={loadChatHistory}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:shadow-lg transition-all duration-200"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : chatHistory.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 dark:text-gray-400">No chat history available</p>
              </div>
            </div>
          ) : (
            <div className="h-full overflow-y-auto p-6 space-y-4">
              {chatHistory.map((message, index) => (
                <div
                  key={index}
                  className={`flex items-start space-x-3 ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.sender === 'system' && (
                    <div className="flex-shrink-0">
                      {getMessageIcon(message.type, message.sender)}
                    </div>
                  )}
                  
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${getMessageStyle(
                      message.sender
                    )}`}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      {message.sender === 'user' && getMessageIcon(message.type, message.sender)}
                      <span className="text-xs opacity-75">
                        {format(new Date(message.timestamp), 'MMM dd, yyyy HH:mm')}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                  </div>

                  {message.sender === 'user' && (
                    <div className="flex-shrink-0">
                      {getMessageIcon(message.type, message.sender)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {chatHistory.length} message{chatHistory.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
