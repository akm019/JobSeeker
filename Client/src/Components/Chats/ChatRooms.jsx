// ChatRooms.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../AuthContext';

function ChatRooms() {
  const { user } = useContext(AuthContext);
  const [rooms, setRooms] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [enrollmentStatuses, setEnrollmentStatuses] = useState({});
  const navigate = useNavigate();
  const [newRoom, setNewRoom] = useState({
    name: '',
    domain: '',
    description: ''
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    // Fetch enrollment status for all rooms when rooms are loaded
    if (rooms.length > 0 && user?.role === 'jobseeker') {
      rooms.forEach(room => {
        checkEnrollmentStatus(room._id);
      });
    }
  }, [rooms]);

  const fetchRooms = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/rooms', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      setRooms(data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const handleRoomClick = async (room) => {
    if (user.role === 'professional') {
      navigate(`/chat/${room._id}`);
      return;
    }

    // For jobseekers
    if (enrollmentStatuses[room._id]) {
      // If enrolled, navigate directly
      navigate(`/chat/${room._id}`);
    } else {
      // If not enrolled, show enrollment modal
      setSelectedRoom(room);
      setShowEnrollModal(true);
    }
  };

  const handleEnroll = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/rooms/${selectedRoom._id}/enroll`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
  
      if (res.ok) {
        // Update enrollment status locally
        setEnrollmentStatuses(prev => ({
          ...prev,
          [selectedRoom._id]: true
        }));
        setShowEnrollModal(false);
        navigate(`/chat/${selectedRoom._id}`);
      }
    } catch (error) {
      console.error('Error enrolling in room:', error);
    }
  };

  useEffect(() => {
    const checkAllEnrollments = async () => {
      if (user?.role === 'jobseeker' && rooms.length > 0) {
        try {
          const statuses = await Promise.all(
            rooms.map(async (room) => {
              const res = await fetch(
                `http://localhost:5000/api/rooms/${room._id}/enrollment-status`,
                {
                  headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                  }
                }
              );
              const data = await res.json();
              return { roomId: room._id, isEnrolled: data.isEnrolled };
            })
          );
  
          const statusObj = {};
          statuses.forEach(({ roomId, isEnrolled }) => {
            statusObj[roomId] = isEnrolled;
          });
          setEnrollmentStatuses(statusObj);
        } catch (error) {
          console.error('Error checking enrollment statuses:', error);
        }
      }
    };
  
    checkAllEnrollments();
  }, [rooms, user?.role]);
  

  return (
    <div className="p-4">
      {user?.role === 'professional' && (
        <div className="mb-4">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            {showCreateForm ? 'Cancel' : 'Create New Chat Room'}
          </button>

          {showCreateForm && (
            <form onSubmit={createRoom} className="mt-4 space-y-4">
              <input
                type="text"
                placeholder="Room Name"
                value={newRoom.name}
                onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="text"
                placeholder="Domain"
                value={newRoom.domain}
                onChange={(e) => setNewRoom({ ...newRoom, domain: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
              <textarea
                placeholder="Description"
                value={newRoom.description}
                onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
              <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
                Create Room
              </button>
            </form>
          )}
        </div>
      )}

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room) => (
          <div
            key={room._id}
            className="p-4 border rounded-lg hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-bold">{room.name}</h3>
            <p className="text-gray-600">{room.domain}</p>
            <p className="text-sm">{room.description}</p>
            <p className="text-sm mt-2">Professional: {room.professional.name}</p>

            <button
  onClick={() => handleRoomClick(room)}
  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
>
  {user?.role === 'professional' || enrollmentStatuses[room._id] === true ? 'Enter' : 'Enroll'}
</button>
          </div>
        ))}
      </div>

      {/* Enrollment Modal */}
      {showEnrollModal && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Enroll in {selectedRoom.name}</h2>
            <p className="mb-4">{selectedRoom.description}</p>
            <p className="mb-6">Professional: {selectedRoom.professional.name}</p>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowEnrollModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleEnroll}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Enroll
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatRooms;
