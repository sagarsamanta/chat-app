const socket = io()


//elements
const $messageForm=document.querySelector('form')
const $messageFormInput=document.querySelector('input')
const $messageFormButton=document.querySelector('button')
const $locationShareButton=document.querySelector('#send-location')
const $messages=document.querySelector('#messages')


//templates
const $messageTemplate=document.querySelector('#message-template')
const $locationTemplate=document.querySelector('#location-message-template')
const $sidebarTemplate=document.querySelector('#sidebar-template')

//options
 const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true})

const autoscroll=()=>{
    const newMessage=$messages.lastElementChild
    newMessageStyle=getComputedStyle(newMessage)
    newMessageMargin=parseInt(newMessageStyle.marginBottom)
    const newMessageHeight=newMessage.offsetHeight + newMessageMargin

    const visibleHeight=$messages.offsetHeight

    const containerHeight=$messages.scrollHeight

    const scrollOffset=$messages.scrollTop +visibleHeight

    if(containerHeight - newMessageHeight <=scrollOffset){
        $messages.scrollTop=$messages.scrollHeight
    }
}

socket.on('message', (message) => {
    const html=Mustache.render($messageTemplate.innerHTML,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationMessage',(message)=>{
    const html=Mustache.render($locationTemplate.innerHTML,{
        username:message.username,
        url:message.location,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData',({room,users})=>{

    // console.log(users)
    // console.log(room)
    const html=Mustache.render($sidebarTemplate.innerHTML,{
        room:room,
        users:users
    })
    document.querySelector('#sidebar').innerHTML=html
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    $messageFormButton.setAttribute('disabled','disabled') // we disable submit button after one click

    const message=e.target.elements.message.value // it just the way to select input box
    socket.emit('sendMessage',message,(error)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value=''
        $messageFormInput.focus()
       if(error){
           alert('Profanity not allowed !')
           location.href='/'
       }
    //    console.log('Message delevered!')
    })
})

$locationShareButton.addEventListener('click',()=>{
    $locationShareButton.setAttribute('disabled','disabled')
    if(!navigator.geolocation){
        return alert('Your browser not supported geo location')
    }
    navigator.geolocation.getCurrentPosition((position)=>{
            socket.emit('sendLocation',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        },()=>{
            $locationShareButton.removeAttribute('disabled')
            console.log("Location shared")
        })
    })
})
socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})




