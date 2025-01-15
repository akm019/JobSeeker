import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../../AuthContext';
import { Trash2, Users, X, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import ChatRoom from './ChatRoom';
import io from 'socket.io-client';
import PersonalChat from './PersonalChat';

function ChatRoomLayout() {
  const { roomId } = useParams();
  const { user } = useContext(AuthContext);
  const [participants, setParticipants] = useState([]);
  const [roomDetails, setRoomDetails] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [activePersonalChats, setActivePersonalChats] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const startPersonalChat = (participant) => {
    console.log('Starting chat with participant:', participant); // Debug log
    
    // Don't allow chat with undefined participant
    if (!participant || !participant._id) {
      console.error('Invalid participant data:', participant);
      return;
    }
  
    // Check if a chat already exists with this participant
    const existingChat = activePersonalChats.find(chat => chat._id === participant._id);
    if (!existingChat) {
      // Add proper role and id handling
      setActivePersonalChats(prev => [...prev, {
        _id: participant._id,
        name: participant.name,
        role: participant.role || participant.user?.role // Handle both direct and populated data
      }]);
    }
  };


  const socket = io('http://localhost:5000');

  const closePersonalChat = (participantId) => {
    setActivePersonalChats(prev => prev.filter(chat => chat._id !== participantId));
  };

  useEffect(() => {
    const initializeRoom = async () => {
      await Promise.all([
        fetchRoomDetails(),
        fetchParticipants(),
        checkEnrollmentStatus()
      ]);
    };

    initializeRoom();

    // Listen for online status updates
    socket.on('user_connected', (userId) => {
      setOnlineUsers((prev) => new Set([...prev, userId]));
    });

    socket.on('user_disconnected', (userId) => {
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    });

    // Get initial online users
    socket.emit('get_online_users', roomId);
    socket.on('online_users_list', (users) => {
      setOnlineUsers(new Set(users));
    });

    return () => {
      socket.off('user_connected');
      socket.off('user_disconnected');
      socket.off('online_users_list');
    };
  }, [roomId]);

  const fetchRoomDetails = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/rooms/${roomId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      setRoomDetails(data);
    } catch (error) {
      console.error('Error fetching room details:', error);
    }
  };

  const removeParticipant = async (participantId) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/rooms/${roomId}/participants/${participantId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (res.ok) {
        // Update participants list locally
        setParticipants(prev => prev.filter(p => p._id !== participantId));
        // Close any active personal chat with this participant
        closePersonalChat(participantId);
      } else {
        const error = await res.json();
        alert(error.message || 'Failed to remove participant');
      }
    } catch (error) {
      console.error('Error removing participant:', error);
      alert('Failed to remove participant');
    }
  };

  useEffect(() => {
    socket.on('participant_removed', ({ roomId: removedFromRoom, userId }) => {
      if (roomId === removedFromRoom) {
        if (userId === user._id) {
          // Current user was removed
          setIsEnrolled(false);
          alert('You have been removed from this chat room');
        } else {
          // Another participant was removed
          setParticipants(prev => prev.filter(p => p._id !== userId));
        }
      }
    });

    return () => {
      socket.off('participant_removed');
    };
  }, [roomId, user._id]);

  const fetchParticipants = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/rooms/${roomId}/participants`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      console.log('Fetched participants:', data); // Debug log
      setParticipants(data.map(participant => ({
        _id: participant._id || participant.user._id,
        name: participant.name || participant.user.name,
        role: participant.role || participant.user.role,
      })));
    } catch (error) {
      console.error('Error fetching participants:', error);
    }
  };

  const checkEnrollmentStatus = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/rooms/${roomId}/enrollment-status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      setIsEnrolled(data.isEnrolled);
    } catch (error) {
      console.error('Error checking enrollment status:', error);
    }
  };

  const handleEnroll = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/rooms/${roomId}/enroll`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (res.ok) {
        setIsEnrolled(true);
        fetchParticipants();
      }
    } catch (error) {
      console.error('Error enrolling in room:', error);
    }
  };

  const renderParticipant = (participant) => {
    const isCurrentUserProfessional = user?._id === roomDetails?.professional?._id;
    return (
      <div
        key={participant._id}
        className="p-3 rounded-lg bg-white shadow-sm flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
      >
        <div 
          className="flex items-center cursor-pointer flex-1 gap-3"
          onClick={() => startPersonalChat(participant)}
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-medium">
                {participant.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
              onlineUsers.has(participant._id) ? 'bg-green-500' : 'bg-gray-300'
            }`} />
          </div>
          <div>
            <p className="font-medium text-gray-900">{participant.name}</p>
            <p className="text-xs text-gray-500 capitalize">{participant.role}</p>
          </div>
        </div>
        
        {isCurrentUserProfessional && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(`Remove ${participant.name} from the chat room?`)) {
                removeParticipant(participant._id);
              }
            }}
            className="ml-2 p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
            title="Remove participant"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  };

  if (!roomDetails) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-32 h-32 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
      >
        {isSidebarOpen ? <ChevronLeft className="w-6 h-6" /> : <Users className="w-6 h-6" />}
      </button>

      {/* Participants Sidebar */}
      <div className={`${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } fixed lg:static w-full lg:w-80 h-full bg-white border-r shadow-lg lg:shadow-none transition-transform duration-300 ease-in-out z-40`}>
        <div className="p-6 h-full overflow-y-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{roomDetails.name}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{roomDetails.description}</p>
          </div>

          {!isEnrolled && user?.role === 'jobseeker' && (
            <button
              onClick={handleEnroll}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg mb-8 hover:bg-blue-700 transition-colors font-medium shadow-sm"
            >
              Join Room
            </button>
          )}

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional</h3>
            {roomDetails.professional && (
              <div 
                className="p-4 rounded-lg bg-blue-50 flex items-center cursor-pointer hover:bg-blue-100 transition-colors duration-200"
                onClick={() => startPersonalChat(roomDetails.professional)}
              >
                <div className="relative mr-3">
                  <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center">
                    <span className="text-blue-700 font-medium text-lg">
                      {roomDetails.professional.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
                    onlineUsers.has(roomDetails.professional._id) ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{roomDetails.professional.name}</p>
                  <p className="text-sm text-gray-600">Professional</p>
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Participants</h3>
              <span className="text-sm text-gray-500">{participants.length} members</span>
            </div>
            <div className="space-y-3">
              {participants.map(renderParticipant)}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 relative">
        {(isEnrolled || user?.role === 'professional') ? (
          <ChatRoom roomId={roomId} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md mx-auto p-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Join the Conversation</h3>
              <p className="text-gray-600 mb-6">
                Enroll in this room to participate in discussions and connect with others.
              </p>
              <button
                onClick={handleEnroll}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
              >
                Enroll Now
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Personal Chat Windows */}
      <div className="fixed bottom-4 right-4 flex flex-col-reverse items-end space-y-reverse space-y-4 z-50">
        {activePersonalChats.map(participant => {
          if (!participant?._id) {
            console.error('Invalid participant in activePersonalChats:', participant);
            return null;
          }
          return (
            <PersonalChat
              key={participant._id}
              participant={participant}
              currentUser={user}
              onClose={() => closePersonalChat(participant._id)}
            />
          );
        })}
      </div>
    </div>
  );
}

export default ChatRoomLayout;