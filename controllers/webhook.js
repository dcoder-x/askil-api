const Users = require("../models/UsersModel");
const mongoose = require("mongoose");




exports.webhook = async (req,res)=>{
    const {id,customer} = req.body

    const {email}= customer
    console.log(id)

    try {
        const user = new Users({
           _id: mongoose.Types.ObjectId(id),
           order_email:email
          });
          user.save(user)
          res.status(200).json({msg:'recieved webhook',url:`https://askil.onrender.com/${id}`})
    } catch (error) {
        res.status(400).json({msg:'rejected webhook'})
    }
    
}