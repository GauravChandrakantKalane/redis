import express from "express";
import mongoose from "mongoose";
import Redis from "ioredis";



const app = express();

const redis = new Redis({
    url:"redis://localhost:6379"
})

app.get("/redis", async (req, res) => {  
    const reply = await redis.ping()
    res.json({message:`Redis replied : ${reply}`})
})

app.get("/mongo", async (req, res) => {
    const url = "mongodb://localhost:27017/redisPractice"
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(url)
    }
    res.json({message:`MongoDB connected successfully`})
})

app.listen(3000, () => {
    console.log("Server is running on port 3000")
})