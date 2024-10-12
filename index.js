const express = require('express');
const PORT = 5000;
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const admin = require("firebase-admin");
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());



const serviceAccount = require('./config/creative-agency-11853-firebase-adminsdk-efdh2-55a8bd87ee.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.uzsam.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


const storage = multer.memoryStorage();
const upload = multer({ storage });

const run = async () => {
    try {
        await client.connect();
        const database = client.db(process.env.DB_NAME);
        const serviceCollection = database.collection('services');
        const clientOrderCollection = database.collection('clientOrder');
        const clientReviewCollection = database.collection('clientReview');
        const adminCollection = database.collection('admins');



        //GET
        app.get('/', (req, res) => {
            res.send('Hello World!')
        })



        app.get('/getService', (req, res) => {
            serviceCollection.find({}).toArray().then(result => {
                res.send(result);
            })
        })





        // get client review
        app.get('/getClientReview', (req, res) => {
            clientReviewCollection.find({}).toArray().then(result => {
                res.send(result);
            })
        })

        //get all client orders
        app.get('/getAllClientOrder', (req, res) => {
            clientOrderCollection.find({}).toArray().then(result => {
                res.send(result);
            })
        })



        //POST 
        app.post('/getClientServiceList', (req, res) => {
            const queryEmail = req.query.email;
            const bearer = req.headers.authorization;
            if (bearer && bearer.startsWith('Bearer ')) {
                const idToken = bearer.split(' ')[1];
                admin.auth()
                    .verifyIdToken(idToken)
                    .then((decodedToken) => {
                        const tokenEmail = decodedToken.email;
                        if (queryEmail == tokenEmail) {
                            clientOrderCollection.find({ email: queryEmail }).toArray().then(result => {
                                res.send(result);
                            })
                        }
                        else {
                            res.status(401).send('Unauthorised access!');
                        }
                    })
                    .catch((error) => {
                        res.status(401).send('Unauthorised access!');
                    });
            }
            else {
                res.status(401).send('Unauthorised access!');
            }
        })





        app.post('/addService', upload.single('file'), (req, res) => {
            const file = req.file;
            const title = req.body.title;
            const description = req.body.description;
            const newImg = file.buffer;

            const image = {
                contentType: file.mimetype,
                size: file.size,
                img: newImg
            }

            serviceCollection.insertOne({ title, description, image }).then(result => {
                res.send(result.acknowledged === true);
            })
        })


        app.post('/getOrderService', (req, res) => {
            const serviceId = req.body.serviceId;
            serviceCollection.find({ _id: new ObjectId(serviceId) }).toArray().then(result => {
                res.send(result);
            })
        })


        app.post('/addNewClientService', upload.single('file'), (req, res) => {
            const file = req.file;
            const name = req.body.name;
            const email = req.body.email;
            const serviceName = req.body.serviceName;
            const projectDetail = req.body.projectDetail;
            const price = req.body.price;
            const status = req.body.status;
            const newImg = file.buffer;

            const image = {
                contentType: file.mimetype,
                size: file.size,
                img: newImg
            }

            clientOrderCollection.insertOne({ name, email, serviceName, projectDetail, price, status, image }).then(result => {
                res.send(result.acknowledged === true);
            })
        })




        //Add Review post
        app.post('/addReview', upload.single('file'), (req, res) => {
            const reviewFile = req.file;
            const name = req.body.name;
            const title = req.body.title;
            const message = req.body.message;
            const reviewImg = reviewFile.buffer;

            const image = {
                contentType: reviewFile.mimetype,
                size: reviewFile.size,
                img: reviewImg
            }

            clientReviewCollection.insertOne({ name, title, message, image }).then(result => {
                res.send(result.acknowledged === true);
            })
        })


        app.post('/newAdmin', (req, res) => {
            const email = req.body.email;
            const password = req.body.password;
            adminCollection.insertOne({ email, password }).then(result => {
                res.send(result.acknowledged === true);
            })
        })



        //verify admin
        app.post('/verifyAdmin', (req, res) => {
            const email = req.body.email;
            const password = req.body.password;
            console.log(email, password)
            adminCollection.findOne({ email: email, password: password }).then(result => {
                if ([result].length) {
                    res.send(true)
                }
                else {
                    res.send(false)
                }
            })
        })



        // PATCH

        app.patch('/updateOrderStatus/:id', (req, res) => {
            const orderId = req.params.id;
            const updatedStatus = req.body.status;

            clientOrderCollection.updateOne({ _id: new ObjectId(orderId) }, { $set: { status: updatedStatus } }).then(result => {
                res.send(result.matchedCount > 0)
            })

        })
















        app.listen(PORT, console.log('Server is running'));
    } catch (err) {
        console.log(err);
    }
}


run();