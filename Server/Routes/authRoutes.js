import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../Models/User.js'
import GoogleUser from '../Models/Google-user.js';


const router = express.Router();

router.post('/signup',async(req,res) =>{
    try{
        const {name,email,password,role} = req.body;
        // console.log(req.body);

        if (!['jobPoster', 'jobSeeker','professional'].includes(role)) {
            // throw Error('Invalid role')
            return res.status(400).json({ message: 'Invalid role. Choose either "jobPoster" or "jobSeeker".' });
          }

        const existingUser = await User.findOne({email});



        if(existingUser){
          const message='user already exists'
        console.log(message);
            // throw Error('user already exists')

            return res.status(400).json({message:'user already exists'})
        } 

        const hashedPassword = await bcrypt.hash(password,12);
        console.log(hashedPassword)
        const newUser = new User({name,email,password:hashedPassword,role});
        await newUser.save();

        res.status(201).json({message:'user created successfully'});
    } catch (error){
        console.log(error);
        res.status(500).json({message:'something went wrong'})
    }
});


router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User Not found' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const { password: _, ...userWithoutPassword } = user.toObject(); // Exclude password from response
    res.status(200).json({ token, user: userWithoutPassword });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});


router.post("/google-auth", async (req, res) => {
  try {
    const { name, email, role } = req.body;
    console.log(req.body);

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      // If user exists, log them in
      console.log(user.name)
      return res.status(200).json({
        message: "User logged in successfully",
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
       
      });
      
    }

    // Validate role for new user
    if (!role) {
      return res.status(400).json({ error: "Role is required for new users" });
    }

    // If user does not exist, create a new user
    user = new GoogleUser({
      name,
      email,
      role,
    });

    await user.save();

    res.status(201).json({
      message: "User registered successfully",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Error during Google authentication:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


export default router;