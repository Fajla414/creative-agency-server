const express = require('express');
const PORT = 5000;
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
console.log(process.env.DB_USER)

const app = express();
app.use(cors());
app.use(bodyParser.json());


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://<db_username>:<db_password>@cluster0.uzsam.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const run = async() =>{
    try{




        app.listen(PORT, console.log('Server is running'));
    }catch(err){
        console.log(err);
    }
}


run();