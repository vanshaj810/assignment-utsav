const Post = require("../../models/Post");
const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/';
        // Create uploads directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        // Accept images only
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

// Get all posts
router.get("/", async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        return res.json(posts);
    } catch (error) {
        return res.status(500).json({ error: "Error fetching posts" });
    }
});

// Create new post
router.post("/", upload.single('image'), async (req, res) => {
    try {
        const { title, description } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ error: "Image is required" });
        }

        const imageUrl = `http://localhost:8000/uploads/${req.file.filename}`;
        
        const post = new Post({
            title,
            description,
            imageUrl
        });

        await post.save();
        return res.status(201).json(post);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Error creating post" });
    }
});

// Delete post
router.delete("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        // Delete image file
        const imagePath = post.imageUrl.split('/uploads/')[1];
        if (imagePath) {
            const fullPath = path.join(__dirname, '../../uploads', imagePath);
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
            }
        }

        await Post.findByIdAndDelete(req.params.id);
        return res.json({ message: "Post deleted successfully" });
    } catch (error) {
        return res.status(500).json({ error: "Error deleting post" });
    }
});

module.exports = router;