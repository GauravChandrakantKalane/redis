import express from "express";
import mongoose from "mongoose";
import Redis from "ioredis";
import { BANNER_KEY } from "./util/keys.js";
import { generateOtpKey } from "./util/generateOptKey.js";



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

// Banner API's

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


// OTP API's

app.post("/otp", async (req, res) => {
    const {phone} = req.body
    await redis.del(generateOtpKey(Number(phone)))
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    await redis.set(generateOtpKey(Number(phone)), otp, "EX", 30)
    res.json({ success: true, otp })
})

app.post("/otp/verify", async (req, res) => {
    const { phone, otp } = req.body
    const exists = await redis.exists(generateOtpKey(Number(phone)))
    if (!exists) {
        res.status(400).json({ message: "Key doesn't exists" })
        return
    }
    const otpValue = await redis.get(generateOtpKey(Number(phone)))

    if (otpValue != otp) {
        res.status(400).json({ message: "OTP is incorrect" })
        return
    }

    await redis.del(generateOtpKey(Number(phone)))
    res.json({message:"OTP verified successfully!"})
})

app.get("/otp/:phone/ttl", async (req, res) => {
    const result = await redis.ttl(generateOtpKey(Number(req.params.phone)))
    res.json({
        ttl: result
    })
})

app.listen(3000, () => {
    console.log("Server is running on port 3000")
})