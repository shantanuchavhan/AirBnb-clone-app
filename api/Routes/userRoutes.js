const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors=require('cors')
const secretkey = "chggujyghg";

let CurrentUser=''

router.use(cors({credentials:true,origin:"http://localhost:3000"}));
router.use(cookieParser())

router.post('/register', async (req, res) => {
    console.log(req.body);
    const { username, password, email } = req.body;

    try {
        const newUser = await User.create({
            username: username,
            password: password,
            email: email
        });

        console.log('New user created:', newUser);
        res.send('User registered successfully');
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send('An error occurred during registration');
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email: email, password: password });

        if (user) {

            
            
            jwt.sign({email:email,id:user._id}, secretkey, {},(err,token)=>{
                console.log(token,"token is here")
                if (err) throw err;
                res.cookie('token', token, { httpOnly: true, sameSite: 'lax' }); 
            }
                )
        } else {
            console.log('User not found');
            res.status(404).send('User not found');
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('An error occurred during login');
    }
});

router.get('/profile',(req,res)=>{
    const {token}=req.cookies;
    console.log(token)
    jwt.verify(token,secretkey,{},(err,info)=>{
    if(err) throw err;
    res.json(info)
    
    })
    res.json(CurrentUser)
})

module.exports = router;
