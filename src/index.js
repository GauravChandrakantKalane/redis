import express from "express";
import mongoose from "mongoose";
import Redis from "ioredis";
import { BANNER_KEY } from "./util/keys.js";



const app = express();
app.use(express.json());

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

app.post("/banner", async (req, res) => {
    await redis.set(BANNER_KEY, req.body.message || "Welcome")
    res.json({
        success:true
    })
})


app.get("/banner", async (req, res) => {
    const data = await redis.get(BANNER_KEY)
    res.json({
        success:true,
        data
    })
})

app.delete("/banner", async (req, res) => {
    await redis.del(BANNER_KEY)
    res.json({
        success:true
    })
})

app.get("/banner/exists", async (req, res) => {
    const result = await redis.exists(BANNER_KEY)
    res.json({ 
        data:result
    })
})


app.listen(3000, () => {
    console.log("Server is running on port 3000")
})