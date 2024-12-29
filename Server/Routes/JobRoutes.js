import express from 'express';
import jwt from 'jsonwebtoken';
import Job from '../Models/JobPost.js'// Adjust the path based on your project structure
// import authenticateToken from '../Middleware/authMiddleware.js'; // Middleware to authenticate users
import Application from '../Models/Applicant.js';
const router = express.Router();



const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
  
    if (!token) {
      return res.status(401).json({ message: 'Token not provided' });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // Add user data to request object
      next();
    } catch (error) {
      console.error(error);
      res.status(403).json({ message: 'Invalid or expired token' });
    }
  };
// POST route for creating a job posting
router.post('/JobPost', authenticateToken,async (req, res) => {
  try {
    const { positionTitle,industry, salary,location,description,companyName } = req.body;

    const userId = req.user.id;

    if (!positionTitle || !description || !location || !salary || !companyName) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const newJob = new Job({
        positionTitle,
        industry,
        salary,
        location,
        description,
        companyName,
      postedBy: userId, // Authenticated user ID from middleware
    });

    await newJob.save();

    res.status(201).json({ message: 'Job posted successfully!', job: newJob });
  } catch (error) {
    console.error('Error posting job:', error);
    res.status(500).json({ message: 'Failed to post job.' });
  }
});


router.get("/JobPost", async (req, res) => {
    try {
      const jobPosts = await Job.find();
      res.status(200).json(jobPosts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch job postings" });
    }
  });

  router.post('/apply/:jobId', authenticateToken, async (req, res) => {
    const { jobId } = req.params;
    const userId = req.user.id;
  
    try {
      // Check if job exists
      const job = await Job.findById(jobId);
      if (!job) {
        return res.status(404).json({ message: 'Job not found' });
      }
  
      // Check if user has already applied
      const existingApplication = await Application.findOne({
        userId: userId,
        jobId: jobId
      });
  
      if (existingApplication) {
        return res.status(400).json({ message: 'You have already applied for this job.' });
      }
  
      // Create new application
      const newApplication = new Application({
        userId: userId,
        jobId: jobId,
        coverLetter: req.body.coverLetter || '' // Optional cover letter
      });
  
      await newApplication.save();
  
      res.status(200).json({ 
        message: 'Application submitted successfully',
        application: newApplication
      });
  
    } catch (error) {
      console.error('Error applying to job:', error);
      res.status(500).json({ message: 'Failed to apply for job.', error: error.message });
    }
  });
  
  router.get('/my-applications', authenticateToken, async (req, res) => {
    try {
      const applications = await Application.find({ userId: req.user.id })
        .populate('jobId') // This will populate the job details
        .sort({ appliedAt: -1 }); // Sort by most recent first
  
      res.status(200).json(applications);
    } catch (error) {
      console.error('Error fetching applications:', error);
      res.status(500).json({ message: 'Failed to fetch applications.' });
    }
  });


  // router.get('/applications/:jobId', authenticateToken, async (req, res) => {
  //   try {
  //     const { jobId } = req.params;
      
  //     // Verify the job exists and belongs to the requesting user
  //     const job = await Job.findOne({ 
  //       _id: jobId,
  //       postedBy: req.user.id 
  //     });
      
  //     if (!job) {
  //       return res.status(404).json({ message: 'Job not found or unauthorized' });
  //     }
  
  //     // Find all applications for this job and populate user details
  //     const applications = await Application.find({ jobId })
  //       .populate('userId', 'name email skills') // Populate basic user info
  //       .sort({ appliedAt: -1 }); // Sort by most recent first
      
  //     res.status(200).json(applications);
  //   } catch (error) {
  //     console.error('Error fetching applications:', error);
  //     res.status(500).json({ message: 'Failed to fetch applications' });
  //   }
  // });
  router.get('/applications/:jobId', authenticateToken, async (req, res) => {
    try {
      const { jobId } = req.params;
      
      // Verify the job exists and belongs to the requesting user
      const job = await Job.findOne({ 
        _id: jobId,
        postedBy: req.user.id 
      });
      
      if (!job) {
        return res.status(404).json({ message: 'Job not found or unauthorized' });
      }
  
      // Find all applications for this job and populate user details
      const applications = await Application.find({ jobId })
        .populate({
          path: 'userId',
          select: 'name email skills',
          model: 'User'  // Make sure this matches your User model name
        })
        .sort({ appliedAt: -1 });
      
      // Transform the data to match frontend expectations
      const formattedApplications = applications.map(app => ({
        _id: app._id,
        user: {
          name: app.userId.name,
          email: app.userId.email,
          skills: app.userId.skills
        },
        coverLetter: app.coverLetter,
        appliedAt: app.appliedAt
      }));
      
      res.status(200).json(formattedApplications);
    } catch (error) {
      console.error('Error fetching applications:', error);
      res.status(500).json({ message: 'Failed to fetch applications' });
    }
  });

// DELETE route for deleting a job posting
router.delete('/JobPost/:jobId', authenticateToken, async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;  // Assuming req.user.id is set correctly by authenticateToken

    // Log to check the userId and jobId for debugging
    console.log(`Attempting to delete job with jobId: ${jobId} by userId: ${userId}`);

    // Find the job by ID
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    // Log job details to verify 'postedBy' field
    console.log(job);

    // Check if the logged-in user is the one who posted the job
    if (job.postedBy.toString() !== userId) {
      return res.status(403).json({ message: 'You are not authorized to delete this job.' });
    }

    // Proceed to delete the job
    await Job.deleteOne({ _id: jobId });
    res.status(200).json({ message: 'Job deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
});



  router.get('/MyJobs', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id; // Authenticated user's ID from token
      const jobs = await Job.find({ postedBy: userId }); // Find jobs by the user's ID
  
      if (!jobs.length) {
        return res.status(404).json({ message: 'No jobs found for this user.' });
      }
  
      res.status(200).json(jobs); // Send the jobs back to the client
    } catch (error) {
      console.error('Error fetching user jobs:', error);
      res.status(500).json({ message: 'Failed to fetch user jobs.' });
    }
  });
  
  
export default router;
