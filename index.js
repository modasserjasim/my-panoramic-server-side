const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('colors');
require("dotenv").config();
const app = express();
const port = process.env.PORT || 4000;

// middle wares 
app.use(cors());
app.use(express.json());

//MangoDB Connection
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
const reviewsCollection = client.db('myPanoramic').collection('reviews');

// get service data from client and save to db
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
        const cursor2 = serviceCollection.find({}).sort({ _id: -1 });
        const services = await cursor.toArray();
        const homeServices = await cursor2.limit(3).toArray();
        res.send({
            status: true,
            services: services,
            homeServices: homeServices
        })

    } catch (error) {
        console.log(error.name.bgRed, error.message.bold);
        res.send({
            status: false,
            error: error.message
        })
    }
})

//get a single service from the DB
app.get('/service/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const service = await serviceCollection.findOne({ _id: ObjectId(id) })
        console.log(service);
        res.send({
            status: true,
            service: service,
        })
    } catch (error) {
        console.log(error.name.bgRed, error.message.bold);
        res.send({
            status: false,
            error: error.message
        })
    }
})

// get reviews data from client and save to db
app.post('/review', async (req, res) => {
    try {
        const result = await reviewsCollection.insertOne(req.body);
        console.log('review added', result);
        if (result.insertedId) {
            res.send({
                status: true,
                message: `Your have left a review to ${req.body.serviceName} service`,
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

//get the reviews for particular service from the database
app.get('/reviews', async (req, res) => {
    try {
        let query = {};
        if (req.query.serviceId) {
            query = {
                serviceId: req.query.serviceId
            }
        }
        const cursor = reviewsCollection.find(query);
        const reviews = await cursor.toArray();
        res.send({
            status: true,
            reviews: reviews,
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
