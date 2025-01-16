import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { Brain, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AIQuizHero = () => {


  const navigate = useNavigate();
  const {user} = useContext(AuthContext)
  const handleClick=()=>{
    if(!user){
      toast.error('Please signup/login to access this feature', {
        duration: 3000,
        position: 'top-center',
      });
    } else{ navigate('/AIQuiz')}
       
    }

  const skillCategories = [
    { title: "Technical Skills", icon: Brain },
    { title: "Problem Solving", icon: Sparkles },
    { title: "Industry Knowledge", icon: CheckCircle },
    { title: "Soft Skills", icon: Brain }
  ];

  return (
    <div className="relative overflow-hidden py-20 px-4 md:px-8 bg-gradient-to-br from-[#051140] to-[#020B2D]">
      {/* Background Gradient Orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/30 rounded-full filter blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/30 rounded-full filter blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-12">
          {/* Visual Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex-1"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {skillCategories.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-6"
                >
                  <div className="w-12 h-12 rounded-full bg-[#4361EE]/20 flex items-center justify-center mb-4">
                    {React.createElement(item.icon, { className: "w-6 h-6 text-[#4361EE]" })}
                  </div>
                  <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                  <div className="w-full bg-white/10 h-2 rounded-full">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${Math.random() * 60 + 40}%` }}
                      transition={{ duration: 1, delay: index * 0.2 }}
                      viewport={{ once: true }}
                      className="h-full bg-[#4361EE] rounded-full"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Content Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex-1 text-white"
          >
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6"
            >
              <Brain className="w-4 h-4 text-[#4361EE]" />
              <span className="text-sm">AI-Powered Assessment</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold mb-6"
            >
              Test Your Skills with
              <span className="block text-[#4361EE] mt-2">AI-Driven Quizzes</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-lg text-gray-300 mb-8 max-w-2xl"
            >
              Challenge yourself with our adaptive AI quizzes that assess your skills and knowledge. Get personalized feedback and recommendations to improve your expertise.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
              className="space-y-4 mb-8"
            >
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-[#4361EE]" />
                <span className="text-gray-300">Adaptive difficulty based on your performance</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-[#4361EE]" />
                <span className="text-gray-300">Real-time feedback and explanations</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-[#4361EE]" />
                <span className="text-gray-300">Industry-specific question banks</span>
              </div>
            </motion.div>

           
              <motion.button onClick={handleClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative inline-flex items-center justify-center px-8 py-3 text-lg font-semibold text-white bg-[#4361EE] rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-[#4361EE]/50"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Start Quiz
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div
                  className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </motion.button>
           
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AIQuizHero;