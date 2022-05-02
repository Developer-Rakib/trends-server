const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ObjectId } = require('mongodb');

require('dotenv').config();

// middleware 
app.use(express.json())
app.use(cors())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nbflg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send("Unautorized Access")
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCES_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: "Forbidden Access" })
        }
        req.decoded = decoded;
        next();
    })
}

const run = async () => {
    try {
        await client.connect();
        const clothsCollection = client.db("trends").collection("cloths");

        // get JWT 
        app.post("/login", (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCES_TOKEN_SECRET, {
                expiresIn: '1d'
            })
            res.send({ accessToken })
        })

        // get all data 
        app.get("/cloths", async (req, res) => {
            const query = {}
            const cursor = clothsCollection.find(query)
            const result = await cursor.toArray();
            res.send(result)
        })

        // get data by email
        app.get("/cloth", verifyJWT, async (req, res) => {
            const decoddedEmail = req.decoded.email;
            const email = req.query.email;
            console.log(decoddedEmail, email);
            if (email === decoddedEmail) {
                const query = { email }
                const cursor = clothsCollection.find(query)
                const result = await cursor.toArray();
                console.log(result);
                res.send(result)
            } else {
                console.log("error");
                res.status(403).send({ message: "forbidden access" })
            }
        })

        // get single data
        app.get("/cloth/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await clothsCollection.findOne(query);
            res.send(result)
        })

        // Post data
        app.post("/cloths", async (req, res) => {
            const cloth = req.body;
            if (Object.keys(cloth).length < 0) {
                return res.send({ success: false, message: 'Data currectly not send' })
            }
            const result = await clothsCollection.insertOne(cloth);
            res.send({ success: true, message: `Succesfuly add ${cloth.name}` })
        })

        // update data 
        app.put("/cloth/:id", async (req, res) => {
            const id = req.params.id;
            const cloth = req.body;
            const filter = { _id: ObjectId(id) }
            const option = { upsert: true }
            const updateDoc = {
                $set: cloth
            }
            const result = await clothsCollection.updateOne(filter, updateDoc, option);
            res.send(result)

        })
        // delete data 
        app.delete("/cloth/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await clothsCollection.deleteOne(query);
            if (result.deletedCount < 1) {
                res.send({ success: false, message: "Somthing is Wrong" })
            } else {
                res.send({ success: true, message: "Deleted Successfull" })
            }
        })



    }
    finally {
        // client.close();
    }
}
run().catch(console.dir)





app.get("/", (req, res) => res.send("Welcome to TRIENDS server"))
app.listen(port, () => console.log("Port is", port))