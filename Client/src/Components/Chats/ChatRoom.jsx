import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Paperclip, Send, Trash2, X } from 'lucide-react';
import io from 'socket.io-client';
import { AuthContext } from '../../AuthContext';
import MessageAttachment from './MessageAttachment';

const socket = io("https://jobseeker1-6lnb.onrender.com", {
  transports: ['websocket', 'polling'],
  forceNew: true,
  reconnectionAttempts: 5,
  timeout: 10000,
});

function ChatRoom({ roomId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

 
  useEffect(() => {
    if (!user) {
      navigate('/Signup');
      return;
    }

    // Connect to socket and fetch initial messages
    socket.connect();
    socket.emit('join_room', roomId);
    fetchMessages();

    // Socket event listeners
    const handleReceiveMessage = (message) => {
      setMessages(prev => {
        // Check if message already exists to prevent duplicates
        const messageExists = prev.some(msg => msg._id === message._id);
        if (messageExists) return prev;
        return [...prev, message];
      });
      scrollToBottom();
    };

    const handleDeleteMessage = (messageId) => {
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('message_deleted', handleDeleteMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('message_deleted', handleDeleteMessage);
      socket.emit('leave_room', roomId);
      socket.disconnect();
    };
  }, [roomId, user, navigate]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/messages/${roomId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!res.ok) throw new Error('Failed to fetch messages');
      
      const data = await res.json();
      setMessages(data.reverse());
      scrollToBottom();
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
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
      return {
        url: data.url,
        originalName: data.originalName,
        filename: data.filename
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!res.ok) throw new Error('Failed to delete message');

      // First update local state
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
      // Then emit the socket event
      socket.emit('delete_message', { roomId, messageId });
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
        room: roomId,
        text: newMessage.trim(),
        attachment: fileUrl
      };
      
      const res = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(messageData)
      });

      if (!res.ok) throw new Error('Failed to send message');

      const savedMessage = await res.json();
      
      // First update local state
      setMessages(prev => {
        // Check if message already exists
        const messageExists = prev.some(msg => msg._id === savedMessage._id);
        if (messageExists) return prev;
        return [...prev, savedMessage];
      });
      
      // Then emit the socket event
      socket.emit('send_message', { roomId, message: savedMessage });
      
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

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col h-[600px] bg-gray-50 rounded-lg shadow-lg">
      <div className="bg-white px-4 py-3 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Chat Room</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => {
          const isOwnMessage = message.sender._id === user._id;
          
          return (
            <div 
              key={message._id || index} 
              className={`flex w-full ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`group relative flex flex-col max-w-[70%] ${
                isOwnMessage ? 'items-end' : 'items-start'
              }`}>
                <span className="text-xs text-gray-600 mb-1 px-1">
                  {message.sender.name} • {formatTime(message.timestamp)}
                </span>
                <div className={`relative rounded-lg px-4 py-2 break-words ${
                  isOwnMessage
                    ? 'bg-blue-500 text-white rounded-tr-none'
                    : 'bg-white border border-gray-200 rounded-tl-none'
                }`}>
                  {isOwnMessage && (
                    <button
                      onClick={() => deleteMessage(message._id)}
                      className="absolute -left-8 top-1/2 -translate-y-1/2 p-1 rounded-full bg-red-100 hover:bg-red-200 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  )}
                  <p className="text-sm">{message.text}</p>
                  {message.attachment && (
    <MessageAttachment 
      attachment={message.attachment} 
      isOwnMessage={isOwnMessage} 
    />
  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="p-4 bg-white border-t border-gray-200">
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
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Type your message..."
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
            className="p-3 text-gray-500 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Paperclip className="w-6 h-6" />
          </button>
          <button 
            type="submit" 
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            disabled={(!newMessage.trim() && !selectedFile) || isUploading}
          >
            <Send className="w-5 h-5" />
            {isUploading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ChatRoom;