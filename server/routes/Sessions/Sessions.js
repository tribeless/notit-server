const {UserInputError } = require("apollo-server-express");
const {Users} = require('../../dataSources/models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

require('dotenv').config();
const configValues = process.env;

class SessionsApi {

    async signInUser(args,res){
        const {email,password} = args;
        const response =  await Users.findOne({email:email})

             if(!response){

                throw new UserInputError('No such email registered')
             
             }

             const match = await bcrypt.compare(password,response.password);

             if(!match){
                throw new UserInputError('Invalid credentials')
             }

             const token= jwt.sign({email:response.email,id:response._id},configValues.COOKIE_SECRET,{expiresIn: '1d'});

            res.cookie('jwt', token, {
                httpOnly: true,
                secure: configValues.NODE_ENV == "production", //on https
                maxAge:1000 * 60 * 60 * 24 * 1,
                sameSite:"none"
                //domain: 'example.com', //set your domain
            })
             return {
                 status:true,
                 id:response._id
                };

    }

    async logOut(res){
        try{
            res.clearCookie("jwt",{
                path:"/",
                sameSite:"none"
            })
            return {
                status:true,
                message:"successfully logged you out"
            }
        }catch(err){
            return {
                status: false,
                message: "failed to log you out"
            }
        }
    }
}

module.exports = SessionsApi;