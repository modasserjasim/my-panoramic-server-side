const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
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


//verify user with token
function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    // console.log(authHeader);
    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorized Access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (error, decoded) {
        if (error) {
            res.status(403).send({ message: 'Forbidden Access' });
        }
        req.decoded = decoded;
        next();
    })

}

//JWT implementation
app.post('/jwt', async (req, res) => {
    const user = req.body;
    console.log(user);
    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
    res.send({ token });
})

//before JWT
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
        const cursorLimit = serviceCollection.find({}).sort({ _id: -1 });
        const services = await cursor.toArray();
        const homeServices = await cursorLimit.limit(3).toArray();
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
        // console.log(service);
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

// get reviews data from client and save to db using Post method
app.post('/review', async (req, res) => {
    try {
        const result = await reviewsCollection.insertOne(req.body);
        // console.log('review added', result);
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

//get the reviews for particular service from the database (PUBLIC)
app.get('/reviews', async (req, res) => {
    try {
        let query = {};
        if (req.query.serviceId) {
            query = {
                serviceId: req.query.serviceId
            }
        }
        const cursor = reviewsCollection.find(query).sort({ _id: -1 });
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

//get the reviews for particular user from the database (PRIVATE)
app.get('/user-reviews', verifyJWT, async (req, res) => {

    try {
        const decoded = req.decoded;
        if (decoded.email !== req.query.email) {
            res.status(401).send({ message: 'Unauthorized access' });
        }
        let query = {};
        if (req.query.email) {
            query = {
                email: req.query.email
            }
        }
        const cursor = reviewsCollection.find(query);
        const reviews = await cursor.toArray();
        // console.log(reviews);
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

//delete review
app.delete('/review/:id', verifyJWT, async (req, res) => {
    const id = req.params.id;
    try {
        const result = await reviewsCollection.deleteOne({ _id: ObjectId(id) });

        if (result.deletedCount) {
            res.send({
                status: true,
                message: `Successfully deleted the review!`
            })
        }

    } catch (error) {
        console.log(error.name.bgRed, error.message.bold);
        res.send({
            status: false,
            error: error.message
        })
    }
})

// update the review

// step1: we have to get the data using id to load it on routes 
app.get('/review/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const review = await reviewsCollection.findOne({ _id: ObjectId(id) });
        res.send({
            status: true,
            review: review
        })

    } catch (error) {
        console.log(error.name.bgRed, error, message.bold);
        res.send({
            status: false,
            error: error.message
        })
    }
})

// step2: create the API with patch
app.patch('/review/:id', verifyJWT, async (req, res) => {
    const id = req.params.id;
    try {
        const result = await reviewsCollection.updateOne({ _id: ObjectId(id) }, { $set: req.body });
        // console.log(result);
        if (result.matchedCount) {
            res.send({
                status: true,
                message: `Successfully updated your review for ${req.body.serviceName}`
            })
        } else {
            res.send({
                status: false,
                error: "Couldn't update the product"
            })
        }
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
