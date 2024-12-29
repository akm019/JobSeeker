import multer from 'multer';

const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'./uploads/resumes');
    },
    filenae:(req,file,cb)=>{
        cb(null,`${Date.now()}-${file.originalname}`)
    },
})

const filefilter = (req,file,cb)=>{
    if(file.mimetype === 'application/pdf'){
        cb(null,true);
    }else{
        cb(new Error('Only PDF files are allowed'),false)
    }
};

const resumeUpload = multer({
    storage,
    filefilter,
    limits:{fileSize:5*1024*1024}
})

export default resumeUpload;