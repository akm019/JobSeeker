import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../../AuthContext';
import { Trash2 } from 'lucide-react';
import ChatRoom from './ChatRoom';
import io from 'socket.io-client';
import PersonalChat from './PersonalChat';

// Initialize the socket connection
const socket = io('http://localhost:5000'); // Replace with your server's socket endpoint

function ChatRoomLayout() {
  const { roomId } = useParams();
  const { user } = useContext(AuthContext);
  const [participants, setParticipants] = useState([]);
  const [roomDetails, setRoomDetails] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [activePersonalChats, setActivePersonalChats] = useState([]);

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
        className="p-3 rounded-lg bg-gray-50 flex items-center justify-between hover:bg-gray-100"
      >
        <div 
          className="flex items-center cursor-pointer flex-1"
          onClick={() => startPersonalChat(participant)}
        >
          <div className={`w-2.5 h-2.5 rounded-full mr-2 ${
            onlineUsers.has(participant._id) ? 'bg-green-500' : 'bg-gray-300'
          }`} />
          <div>
            <p className="font-medium">{participant.name}</p>
            <p className="text-xs text-gray-500">{participant.role}</p>
          </div>
        </div>
        
        {isCurrentUserProfessional  && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(`Remove ${participant.name} from the chat room?`)) {
                removeParticipant(participant._id);
              }
            }}
            className="ml-2 p-1.5 text-red-500 hover:bg-red-50 rounded-full transition-colors"
            title="Remove participant"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  };

  if (!roomDetails) return <div>Loading...</div>;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Participants Sidebar */}
      <div className="w-72 bg-white border-r overflow-y-auto">
        <div className="p-4">
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">{roomDetails.name}</h2>
            <p className="text-sm text-gray-600">{roomDetails.description}</p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Professional</h3>
            {roomDetails.professional && (
              <div 
                className="p-3 rounded-lg bg-blue-50 flex items-center cursor-pointer hover:bg-blue-100"
                onClick={() => startPersonalChat(roomDetails.professional)}
              >
                <div className={`w-2.5 h-2.5 rounded-full mr-2 ${
                  onlineUsers.has(roomDetails.professional._id) ? 'bg-green-500' : 'bg-gray-300'
                }`} />
                <div>
                  <p className="font-medium">{roomDetails.professional.name}</p>
                  <p className="text-xs text-gray-500">Professional</p>
                </div>
              </div>
            )}
          </div>

          {!isEnrolled && user?.role === 'jobseeker' && (
            <button
              onClick={handleEnroll}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg mb-6 hover:bg-blue-600 transition-colors"
            >
              Enroll in Room
            </button>
          )}

          <div>
            <h3 className="text-lg font-semibold mb-3">Participants</h3>
            <div className="space-y-2">
              {participants.map(renderParticipant)}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1">
        {(isEnrolled || user?.role === 'professional') ? (
          <ChatRoom roomId={roomId} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Please enroll in this room to participate in the chat.
              </p>
              <button
                onClick={handleEnroll}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                Enroll Now
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Personal Chat Windows */}
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
  );
}

export default ChatRoomLayout;