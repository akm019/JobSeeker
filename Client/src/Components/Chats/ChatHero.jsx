import React from 'react';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import Ani from '../../assets/Ani1.json';
import { MessageSquare, ArrowRight } from 'lucide-react';

const ChatHero = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6
      }
    }
  };

  return (
    <div className="relative overflow-hidden py-20 px-4 md:px-8 bg-gradient-to-br from-[#020B2D] to-[#051140]">
      {/* Background Gradient Orbs */}
      <div className=" " />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/30 rounded-full filter blur-3xl translate-x-1/2 translate-y-1/2" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto"
      >
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Content Section */}
          <motion.div 
            variants={itemVariants}
            className="flex-1 text-white"
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6"
            >
              <MessageSquare className="w-4 h-4 text-[#4361EE]" />
              <span className="text-sm">Connect with Professionals</span>
            </motion.div>

            <motion.h2
              variants={itemVariants}
              className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200"
            >
              Welcome to the
              <span className="block text-[#4361EE]">ChatRoom</span>
            </motion.h2>

            <motion.p
              variants={itemVariants}
              className="text-lg text-gray-300 mb-8 max-w-2xl"
            >
              Looking for career advice or industry insights? Our chat room lets you connect with experienced professionals directly. Join group discussions to learn from others or start a private chat for personalized guidance.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-wrap gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative inline-flex items-center justify-center px-8 py-3 text-lg font-semibold text-white bg-[#4361EE] rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-[#4361EE]/50"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Start Chatting
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div
                  className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 text-lg font-semibold text-white border-2 border-white/20 rounded-xl hover:bg-white/10 transition-colors"
              >
                Learn More
              </motion.button>
            </motion.div>

            {/* Stats Section */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 md:grid-cols-3 gap-8 mt-12"
            >
              {[
                { number: "500+", label: "Active Mentors" },
                { number: "10k+", label: "Career Discussions" },
                { number: "95%", label: "Success Rate" }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-[#4361EE]">{stat.number}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Animation Section */}
          <motion.div
            variants={itemVariants}
            className="flex-1 relative"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="relative z-10 w-full max-w-xl mx-auto"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl filter blur-xl" />
                <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl overflow-hidden">
                  <Lottie animationData={Ani} />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ChatHero;