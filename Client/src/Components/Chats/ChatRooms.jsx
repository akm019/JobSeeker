import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../AuthContext';
import { Button, Drawer, Box, Typography, TextField, Stack, IconButton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Plus, X as CloseIcon, User, Briefcase } from 'lucide-react';

function ChatRooms() {
  const { user } = useContext(AuthContext);
  const [rooms, setRooms] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [enrollmentStatuses, setEnrollmentStatuses] = useState({});
  const navigate = useNavigate();
  
  const [newRoom, setNewRoom] = useState({
    name: '',
    domain: '',
    description: ''
  });
  const handleGetStarted = () => {
    if (!user) {
      alert("Kindly SignUp first");
      navigate('/')
    }  else {
      navigate('/Chatrooms');
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    if (rooms.length > 0 && user?.role === 'jobseeker') {
      checkAllEnrollments();
    }
  }, [rooms, user?.role]);

  const checkAllEnrollments = async () => {
    try {
      const token = localStorage.getItem('token');
      const statusPromises = rooms.map(room => 
        fetch(`https://jobseeker-1-mg4e.onrender.com/api/rooms/${room._id}/enrollment-status`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }).then(res => res.json())
      );

      const statuses = await Promise.all(statusPromises);
      const newEnrollmentStatuses = {};
      
      rooms.forEach((room, index) => {
        newEnrollmentStatuses[room._id] = statuses[index].isEnrolled;
      });

      setEnrollmentStatuses(newEnrollmentStatuses);
    } catch (error) {
      console.error('Error checking enrollment statuses:', error);
    }
  };

  const createRoom = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('https://jobseeker-1-mg4e.onrender.com/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newRoom)
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create room');
      }
  
      const data = await response.json();
      setRooms(prevRooms => [...prevRooms, data]);
      setNewRoom({
        name: '',
        domain: '',
        description: ''
      });
      
      setIsDrawerOpen(false);
      alert('Room created successfully!');
      
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Failed to create room: ' + error.message);
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await fetch('https://jobseeker-1-mg4e.onrender.com/api/rooms', {
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

    // Check if enrolled
    if (enrollmentStatuses[room._id]) {
      navigate(`/chat/${room._id}`);
    } else {
      setSelectedRoom(room);
      setShowEnrollModal(true);
    }
  };

  const handleEnroll = async () => {
    if (!selectedRoom) return;

    try {
      const res = await fetch(`https://jobseeker-1-mg4e.onrender.com/api/rooms/${selectedRoom._id}/enroll`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
  
      if (res.ok) {
        // Update local enrollment status
        setEnrollmentStatuses(prev => ({
          ...prev,
          [selectedRoom._id]: true
        }));
        setShowEnrollModal(false);
        navigate(`/chat/${selectedRoom._id}`);
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to enroll');
      }
    } catch (error) {
      console.error('Error enrolling in room:', error);
      alert('Failed to enroll: ' + error.message);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020B2D] to-[#051140] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-4">Chat Rooms</h1>
          <p className="text-blue-200">Connect with professionals and peers in your domain</p>
        </motion.div>

        {user?.role === 'professional' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <Button
              startIcon={<Plus className="w-5 h-5" />}
              variant="contained"
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20"
              onClick={() => setIsDrawerOpen(true)}
            >
              Create New Chat Room
            </Button>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {rooms.map((room, index) => (
            <motion.div
              key={room._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gradient-to-br from-[#1e293b] to-[#334155] rounded-xl shadow-xl hover:shadow-2xl transition-all duration-200 overflow-hidden border border-blue-900/30 backdrop-blur-sm hover:scale-[1.02]"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <MessageSquare className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">{room.name}</h3>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-blue-200">
                    <Briefcase className="w-4 h-4" />
                    <span>{room.domain}</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-200">
                    <User className="w-4 h-4" />
                    <span>{room.professional.name}</span>
                  </div>
                  <p className="text-blue-100/80 text-sm">{room.description}</p>
                </div>

                <Button
                  variant="contained"
                  onClick={() => handleRoomClick(room)}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20"
                >
                  {user?.role === 'professional' || enrollmentStatuses[room._id] ? 'Enter Room' : 'Enroll Now'}
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <Drawer
          anchor="right"
          open={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
        >
          <Box className="w-full max-w-md sm:w-[480px] p-6 bg-[#0f172a]">
            <div className="flex justify-between items-center mb-6">
              <Typography variant="h5" className="font-bold text-white">
                Create New Chat Room
              </Typography>
              <IconButton onClick={() => setIsDrawerOpen(false)} className="text-white">
                <CloseIcon className="w-5 h-5" />
              </IconButton>
            </div>

            <Stack spacing={4}>
              <TextField
                label="Room Name"
                variant="outlined"
                fullWidth
                value={newRoom.name}
                onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                className="rounded-lg bg-[#1e293b] text-white"
                InputProps={{
                  className: 'text-white border-blue-900/30'
                }}
                InputLabelProps={{
                  className: 'text-blue-200'
                }}
              />

              <TextField
                label="Domain"
                variant="outlined"
                fullWidth
                value={newRoom.domain}
                onChange={(e) => setNewRoom({ ...newRoom, domain: e.target.value })}
                className="rounded-lg bg-[#1e293b] text-white"
                InputProps={{
                  className: 'text-white border-blue-900/30'
                }}
                InputLabelProps={{
                  className: 'text-blue-200'
                }}
              />

              <TextField
                label="Description"
                variant="outlined"
                fullWidth
                multiline
                rows={4}
                value={newRoom.description}
                onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                className="rounded-lg bg-[#1e293b] text-white"
                InputProps={{
                  className: 'text-white border-blue-900/30'
                }}
                InputLabelProps={{
                  className: 'text-blue-200'
                }}
              />

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outlined"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex-1 py-2 text-blue-200 border-blue-900/30 hover:border-blue-500"
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={createRoom}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 py-2 shadow-lg shadow-blue-500/20"
                >
                  Create Room
                </Button>
              </div>
            </Stack>
          </Box>
        </Drawer>

        <AnimatePresence>
          {showEnrollModal && selectedRoom && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-gradient-to-br from-[#1e293b] to-[#334155] rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-blue-900/30"
              >
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-white mb-4">
                    Enroll in {selectedRoom.name}
                  </h2>
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-2 text-blue-200">
                      <Briefcase className="w-4 h-4" />
                      <span>{selectedRoom.domain}</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-200">
                      <User className="w-4 h-4" />
                      <span>{selectedRoom.professional.name}</span>
                    </div>
                    <p className="text-blue-100/80">{selectedRoom.description}</p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outlined"
                      onClick={() => setShowEnrollModal(false)}
                      className="flex-1 py-2 text-blue-200 border-blue-900/30 hover:border-blue-500"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleEnroll}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 py-2 shadow-lg shadow-blue-500/20"
                    >
                      Confirm Enrollment
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default ChatRooms;