const express = require('express');
const cors = require('cors');
require('colors');
const app = express();
const port = process.env.PORT || 4000;

// middle wares 
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('My Panorama App is running!');
})

app.listen(port, () => {
    console.log(`My Panorama Running on port ${port}`.cyan.bold);
})
