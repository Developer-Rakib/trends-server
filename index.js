const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ObjectId } = require('mongodb');

require('dotenv').config();

// middleware 
app.use(express.json())
app.use(cors())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nbflg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const run = async () => {
    try {
        await client.connect();
        const clothsCollection = client.db("trends").collection("cloths");

        // get all cloths 
        app.get("/cloths", async (req, res) => {
            const query = {}
            const cursor = clothsCollection.find(query)
            const result = await cursor.toArray();
            res.send(result)
        })

        // get single cloths 

        app.get("/cloth/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await clothsCollection.findOne(query);
            res.send(result)
        })


    }
    finally {
        // client.close();
    }
}
run().catch(console.dir)





app.get("/", (req, res) => res.send("Welcome to TRIENDS server"))
app.listen(port, () => console.log("Port is", port))