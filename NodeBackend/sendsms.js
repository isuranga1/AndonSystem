require("dotenv").config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

const sendSMS = async(body) =>{

    let msgOptions ={
        from:process.env.TWILIO_FROM_NUMBER,
        to:process.env.TO_NUMBER,
        body,

    };
try{
    const message=await client.messages.create(msgOptions);
    console.log(message);

} catch(err){
    console.log(err);
}

};
sendSMS("this is a test");