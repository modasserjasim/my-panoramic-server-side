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

// get data from client and save to db
app.post('/service', async (req, res) => {
    try {
        const result = await serviceCollection.insertOne(req.body);
        console.log('Service added', result);
        if (result.insertedId) {
            res.send({
                status: true,
                message: `Your service ${req.body.title} has been Successfully added`,
            });
        } else {
            res.send({
                status: false,
                error: "Error Occurred! Couldn't create the service."
            })
        }
    } catch (error) {
        console.log(error.name.bgRed, error.message.bold);
        res.send({
            success: false,
            error: error.message

        })
    }
})

//get the services from the database
app.get('/services', async (req, res) => {
    try {
        const cursor = serviceCollection.find({});
        const services = await cursor.toArray();
        res.send({
            status: true,
            services: services
        })

    } catch (error) {
        console.log(error.name.bgRed, error.message.bold);
        res.send({
            status: false,
            error: error.message
        })
    }
})

app.get('/', (req, res) => {
    res.send('My Panorama App is running!');
})

app.listen(port, () => {
    console.log(`My Panorama Running on port ${port}`.cyan.bold);
})
