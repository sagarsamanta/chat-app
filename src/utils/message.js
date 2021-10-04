const generateMessage=(username,message)=>{
    return {
        username:username,
        text:message,
        createdAt: new Date().getTime()
    }
}

const generateLocationMessage=(username,location)=>{
    return {
        username:username,
        location:location,
        createdAt:new Date().getTime()
    }
}
module.exports={
    generateMessage,
    generateLocationMessage
}