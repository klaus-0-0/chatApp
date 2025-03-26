import { Prisma } from "@prisma/client";

const express = require('express')
const router = express.Router();

router.use(express.json());

router.post('/Login',async (req, res)=> {
    const { username } = req.body;
    res.send(`welcome ${username}`);
    if(username){
        const newUser = await Prisma.user.create({
            data:{
                username
            }
        })
    }
})