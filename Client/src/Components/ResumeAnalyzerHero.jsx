import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, ArrowRight } from 'lucide-react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext.jsx';
import toast from 'react-hot-toast';
const ResumeAnalyzerHero = () => {


  const navigate = useNavigate();
const {user} = useContext(AuthContext)
const handleClick=()=>{
  if(!user){
    toast.error('Please signup/login to access this feature', {
      duration: 3000,
      position: 'top-center',
    });
  } else{ navigate('/ResumeAnalyzer')}
     
  }



  return (
    <div className="relative overflow-hidden py-20 px-4 md:px-8 bg-gradient-to-br from-[#020B2D] to-[#051140]">
      {/* Background Gradient Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/30 rounded-full filter blur-3xl translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/30 rounded-full filter blur-3xl -translate-x-1/2 translate-y-1/2" />

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Content Section */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex-1 text-white"
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6"
            >
              <FileText className="w-4 h-4 text-[#4361EE]" />
              <span className="text-sm">AI-Powered Resume Analysis</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold mb-6"
            >
              Optimize Your Resume with
              <span className="block text-[#4361EE] mt-2">AI Intelligence</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-lg text-gray-300 mb-8 max-w-2xl"
            >
              Get instant feedback on your resume from our advanced AI system. Improve your chances of landing your dream job with personalized suggestions and industry-specific recommendations.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
            >
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-[#4361EE] mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">ATS Compatibility</h3>
                  <p className="text-gray-400">Ensure your resume passes ATS systems</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-[#4361EE] mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Keyword Analysis</h3>
                  <p className="text-gray-400">Match your skills with job requirements</p>
                </div>
              </div>
            </motion.div>

           
              <motion.button  onClick={handleClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative inline-flex items-center justify-center px-8 py-3 text-lg font-semibold text-white bg-[#4361EE] rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-[#4361EE]/50"
              >
                <span  className="relative z-10 flex items-center gap-2">
                  Get Started
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div
                  className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </motion.button>
           
          </motion.div>

          {/* Image/Visual Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex-1"
          >
            <div className="relative bg-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-8">
              <div className="grid gap-4">
                {[1, 2, 3].map((item) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: item * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-4 bg-white/5 p-4 rounded-xl"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#4361EE]/20 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-[#4361EE]" />
                    </div>
                    <div className="flex-1">
                      <div className="h-2 bg-white/20 rounded-full w-3/4 mb-2" />
                      <div className="h-2 bg-white/10 rounded-full w-1/2" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalyzerHero;