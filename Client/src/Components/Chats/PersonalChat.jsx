import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, X, Trash2 } from 'lucide-react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const PersonalChat = ({ participant, onClose, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (participant?._id) {
      fetchPersonalMessages();
    }
  }, [participant?._id]);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      socket.emit('join_personal_room', currentUser._id);
    });
  
    socket.on('receive_personal_message', (message) => {
      console.log('Received message:', message);
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    });

    socket.on('message_deleted', ({ messageId }) => {
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
    });

    return () => {
      socket.off('receive_personal_message');
      socket.off('message_deleted');
    };
  }, [currentUser._id]);

  const fetchPersonalMessages = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`http://localhost:5000/api/personal-messages/${participant._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch messages');
      const data = await res.json();
      // Log the fetched messages to inspect their structure
      console.log('Fetched messages:', data);
      console.log('Current user ID:', currentUser._id);
      setMessages(data);
      scrollToBottom();
    } catch (error) {
      console.error('Error fetching personal messages:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      return data.url;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/personal-messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!res.ok) throw new Error('Failed to delete message');

      socket.emit('delete_personal_message', { 
        messageId,
        to: participant._id 
      });
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || isUploading) return;
  
    setIsUploading(true);
    try {
      let fileUrl = null;
      if (selectedFile) {
        fileUrl = await uploadFile(selectedFile);
      }
  
      const messageData = {
        to: participant._id,
        text: newMessage.trim(),
        attachment: fileUrl
      };
  
      const res = await fetch('http://localhost:5000/api/personal-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(messageData)
      });
  
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to send message');
      }
  
      const savedMessage = await res.json();
      socket.emit('send_personal_message', savedMessage);
      setMessages(prev => [...prev, savedMessage]);
      setNewMessage('');
      setSelectedFile(null);
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed bottom-0 right-4 w-80 bg-white rounded-t-lg shadow-lg border border-gray-200 z-50">
    <div className="flex justify-between items-center p-3 border-b">
      <div>
        <h3 className="font-semibold">{participant.name}</h3>
        <span className="text-xs text-gray-500">{participant.role}</span>
      </div>
      <button 
        onClick={onClose}
        className="p-1 hover:bg-gray-100 rounded-full"
      >
        <X className="w-5 h-5" />
      </button>
    </div>

    <div className="h-96 overflow-y-auto p-3 space-y-4">
      {isLoading ? (
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      ) : (
        messages.map((message, index) => {
          // Updated check for own message, handling both possible message structures
          console.log(message.from)
          const isOwnMessage = 
            (message.from && message.from._id === currentUser._id) || 
            (message.sender && message.sender._id === currentUser._id);
          
          return (
            <div
              key={message._id || index}
              className={`flex w-full ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`group relative flex flex-col max-w-[70%] ${
                  isOwnMessage ? 'items-end' : 'items-start'
                }`}
              >
                <span className="text-xs text-gray-600 mb-1 px-1">
                  {formatTime(message.timestamp || message.createdAt)}
                </span>
                <div 
                  className={`relative rounded-lg px-4 py-2 break-words ${
                    isOwnMessage
                      ? 'bg-blue-500 text-white rounded-tr-none'
                      : 'bg-gray-100 text-gray-800 rounded-tl-none'
                  }`}
                >
                  {isOwnMessage && (
                    <button
                      onClick={() => deleteMessage(message._id)}
                      className="absolute -left-8 top-1/2 -translate-y-1/2 p-1 rounded-full bg-red-100 hover:bg-red-200 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  {message.attachment && (
                    <a 
                      href={message.attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`block mt-2 text-sm underline ${
                        isOwnMessage ? 'text-blue-100' : 'text-blue-500'
                      }`}
                    >
                      View Attachment
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>

      <form onSubmit={sendMessage} className="p-3 border-t">
        {selectedFile && (
          <div className="mb-2 px-3 py-2 bg-blue-50 rounded-lg flex items-center justify-between">
            <span className="text-sm text-blue-700 truncate">
              {selectedFile.name}
            </span>
            <button
              type="button"
              onClick={() => setSelectedFile(null)}
              className="p-1 hover:bg-blue-100 rounded-full"
            >
              <X className="w-4 h-4 text-blue-700" />
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 p-2 border rounded-lg"
            placeholder="Type a message..."
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <button
            type="submit"
            disabled={(!newMessage.trim() && !selectedFile) || isUploading}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
          >
            <Send className="w-5 h-5" />
            {isUploading && 'Sending...'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PersonalChat;