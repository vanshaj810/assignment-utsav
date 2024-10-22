import React, { useState } from 'react';
import {
    Button,
    Card,
    CardContent,
    CardMedia,
    Typography,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Box,
    AppBar,
    Toolbar
} from '@mui/material';
import axios from 'axios';

// Upload Dialog Component
function UploadDialog({ open, handleClose, addPoster }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState('');

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('image', file);

            const response = await axios.post('http://localhost:8000/posters', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            addPoster(response.data);
            handleClose();
            setTitle('');
            setDescription('');
            setFile(null);
            setPreview('');
        } catch (error) {
            console.error('Error uploading poster:', error);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Upload New Poster</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                    <TextField
                        label="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        multiline
                        rows={3}
                        fullWidth
                    />
                    <input
                        accept="image/*"
                        type="file"
                        onChange={handleFileChange}
                    />
                    {preview && (
                        <img
                            src={preview}
                            alt="Preview"
                            style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                        />
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={!title || !file}
                >
                    Upload
                </Button>
            </DialogActions>
        </Dialog>
    );
}

// Main Posts Component
export default function Posts() {
    const [posters, setPosters] = useState([]);
    const [isUploadOpen, setIsUploadOpen] = useState(false);

    // Fetch posters on component mount
    React.useEffect(() => {
        const fetchPosters = async () => {
            try {
                const response = await axios.get('http://localhost:8000/posters');
                setPosters(response.data);
            } catch (error) {
                console.error('Error fetching posters:', error);
            }
        };
        fetchPosters();
    }, []);

    const addPoster = (poster) => {
        setPosters([...posters, poster]);
    };

    return (
        <div>
            {/* Header */}
            <AppBar position="static" sx={{ marginBottom: 4 }}>
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Content Management Panel
                    </Typography>
                    <Button
                        color="inherit"
                        onClick={() => setIsUploadOpen(true)}
                    >
                        Upload Poster
                    </Button>
                </Toolbar>
            </AppBar>

            {/* Gallery Grid */}
            <Grid container spacing={3} sx={{ padding: 3 }}>
                {posters.map((poster, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card>
                            <CardMedia
                                component="img"
                                height="300"
                                image={poster.imageUrl || poster.image}
                                alt={poster.title}
                            />
                            <CardContent>
                                <Typography gutterBottom variant="h6" component="div">
                                    {poster.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {poster.description}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Upload Dialog */}
            <UploadDialog
                open={isUploadOpen}
                handleClose={() => setIsUploadOpen(false)}
                addPoster={addPoster}
            />
        </div>
    );
}