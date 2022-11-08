const express = require('express');
const cors = require('cors');
require('colors');
require("dotenv").config();
const app = express();
const port = process.env.PORT || 4000;

// middle wares 
app.use(cors());
app.use(express.json());

//MangoDB Connection
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vqm0pbr.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        console.log('Database connected'.yellow);
    } catch (error) {
        console.log(error.name.bgRed, error.message.bold, error.stack);
    }
}
run();

const serviceCollection = client.db('myPanoramic').collection('services');


app.get('/', (req, res) => {
    res.send('My Panorama App is running!');
})

app.listen(port, () => {
    console.log(`My Panorama Running on port ${port}`.cyan.bold);
})
