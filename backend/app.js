const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 8000;
const cors = require('cors');
const path = require('path');

mongoose.connect("mongodb://localhost:27017/assignment", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(require("./routes"));

app.listen(port, () => {
    console.log(`Listening on port: ${port}`);
});

process.on('SIGINT', async function () {
    await mongoose.disconnect();
    process.exit(0);
});