import UserModel from "../models/Usermodel.js";
import bcypt from 'bcrypt';
import jwt from "jsonwebtoken";
import otpGenerate from 'otp-generator';
import dotenv from 'dotenv';
dotenv.config()

//--verify user--
export async function verifyUser(req,res,next){
    try {
        const {email} =  req.method == "GET" ? req.query : req.body;
        
        //check the user
        let exist = await UserModel.findOne({email});
        
        if(!exist) return res.status(404).send({error:"Can't Find the User...!"});
        next();

    } catch (error) {
        return res.status(404).send({error:"Authentication Error"})        
    }
}

// ************** POST **************
//register the user
export async function register(req, res){
   // console.log(req.body)
    try {
        const {firstName, lastName, telegram, metaTrade, email, password } = req.body;
        const profile = ''

        //check the Telegram
        const ExitTelegram = new Promise((resolve, reject) => {
            UserModel.findOne({ telegram }, function(err, telegram){
                if(err) reject(new Error(err))
                if(telegram) reject({ error : 'Please Enter the Unique Telegram No'})

                resolve()
            })
        });

        //check the Email
        const ExistEmail = new Promise((resolve, reject) =>{
            UserModel.findOne({email}, function(err, email){
                if(err) reject(new Error(err))
                if(email) reject({ error : 'Please Enter the Unique email'})

                resolve()
            })
        })
       
        Promise.all([ExitTelegram, ExistEmail])
        .then(()=>{
            if(password){
                bcypt.hash(password, 10)
                .then(hashedPassword => {
                    const user = new UserModel({
                        firstName, 
                        lastName, 
                        telegram, 
                        metaTrade,
                        email,
                        password: hashedPassword,
                        profile: profile || ''
                    });
                    
                    // save
                    user.save()
                    .then(result => res.status(201).send({msg:'User Register Successfully...!'}))
                    .catch(error => res.status(500).send({error : 'Register Error'})) 
                })
                .catch(error => {
                    return res.status(500).send({
                        error:'Enable to hashed Password'
                    })
                })
            }
        })
        .catch(error => {
            return res.status(500).send({error})            
        })

    } catch (error) {
        return res.status(500).send(error)
    }
}

// loging
export async function login(req, res){
    const{email, password} = req.body;

    try {
        UserModel.findOne({email})
        .then(user => {
            bcypt.compare(password, user.password)
            .then(passwordchk =>{
                if(!passwordchk) return res.status(400).send({error: 'Dont have a Password'});

                //jwt token
                const token = jwt.sign({
                                userId: user._id,
                                username: user.email
                            }, process.env.JWT_TOKEN, {expiresIn:"12h"});
                
                return res.status(200).send({
                    msg:'Login Successfully...!',
                    email: user.email,
                    token
                })
            })
            .catch(error =>{
                return res.status(400).send({msg:'Password does not matched...'})
            })
        })
        .catch(error =>{
            return res.status(404).send({error:'User name not Founded...'})
        })
        
    } catch (error) {
        return res.status(500).send({error})
    }
}

//********* GET methord **************
// get user
export async function getUser(req, res){

    const {email} = req.params;

    try {
        if(!email) return res.status(501).send({error: "Invalied email"});
       
        UserModel.findOne({ email }, function(err, user){

            if(err) return res.status(500).send({err});
            
            if(!user) return res.status(501).send({ err:"Couldn't find the user" });

            return res.status(201).send(user);
        })

    } catch (error) {
        return res.status(404).send({error:"The user can't find"})
    }
}

// generate OTP
export async function generateOTP(req, res){
    req.app.locals.OTP = otpGenerate.generate(6, {lowerCaseAlphabets:false, upperCaseAlphabets:false, specialChars:false})
    res.status(201).send({code: req.app.locals.OTP})
    console.log('code')
}

// verify OTP
export async function verifyOTP(req, res){
    
    const {code} = req.query;
    
    if(parseInt(req.app.locals.OTP) === parseInt(code)){
        req.app.locals.OTP = null; //reset the OTP values
        req.app.locals.resetSession = true; // start session for reset password
        return res.status(201).send({msg: "Verify Successfully"})
    }
    return res.status(400).send({msg: "Invalied OTP"})
}

// create-reset session
export async function createResetSession(req, res){
    if(req.app.locals.resetSession){
        req.app.locals.resetSession = false;
        return res.status(201).send({msg: "Access Granted..!"})
    }
    return res.status(404).send({err:"Session Expired..!"});
}

//************** Put methord **************
// user Update
export async function updateUser(req, res){
    
    try {
        //const id = req.query.id;
        const { userId } = req.user;

        if(userId){
            const body = req.body;
    
            UserModel.updateOne({ _id : userId }, body, function(err, data){
                if(err) throw err;

                return res.status(201).send({msg: "User Update Successfully..."})
            })
            
        }else{
            return res.status(401).send({err:"User not found..!"})
        }

    } catch (error) {
        return res.status(401).send(error)
    }
}

// reset password
export async function resetpassword(req, res){
    try {

       // if(req.app.locals.resetSession) return res.status(404).send({err:"Session Expired..!"});
      
        const {username, password} = req.body;

        try {
            UserModel.findOne({username})
            .then(user => {
                bcypt.hash(password,10)
                .then(hashedPass => {
                    UserModel.updateOne({username : user.username},
                        {password : hashedPass}, function(err, data){
                            if(err) throw err;
                            return res.status(201).send({msg: "Record Update Success..!"})
                        })
                })
                .catch(e =>{
                    return res.status({error: "Enable to Hashed Password"})
                })

            })
            .catch(err =>{
                return res.status(404).send({err:"Username Not Founded..!"})
            })
        } catch (error) {
            return res.status(500).send({error})
        }

    } catch (error) {
        return res.status(404).send({error});
    }
}