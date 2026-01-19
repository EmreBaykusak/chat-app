import { io } from "/socket.io/socket.io.esm.min.js"
import Mustache from "https://cdnjs.cloudflare.com/ajax/libs/mustache.js/4.2.0/mustache.min.js"

const socket = io()

const chatForm = document.querySelector('#chat-form')
const chatFormInput = chatForm.querySelector('input')
const chatFormButton = chatForm.querySelector('button')
const sendLocationButton = document.querySelector('#send-location')
const messages = document.querySelector('#messages')

const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const { username, room} =  Object.fromEntries(new URLSearchParams(location.search))

const autoscroll = () => {
    const newMessage = messages.lastElementChild

    const newMessageStyles = getComputedStyle(newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin

    const visibleHeight = messages.offsetHeight

    const containerHeight = messages.scrollHeight

    const scrollOffset = messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) messages.scrollTop = messages.scrollHeight
}

socket.on('message', (msg) => {
    console.log(msg)
    const html = Mustache.render(messageTemplate, {
        username: msg.username,
        msg: msg.text,
        createdAt: moment(msg.createdAt).format("H:mm")
    })
    messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (location) => {
    console.log(location)
    const html = Mustache.render(locationTemplate, {
        username: location.username,
        url: location.url,
        createdAt: moment(location.createdAt).format("H:mm")
    })
    messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

document.querySelector('#chat-form').addEventListener('submit', (e) => {
    e.preventDefault()

    chatFormButton.setAttribute('disabled', 'disabled')

    const message = e.currentTarget.elements.message.value

    if (message) {
        socket.emit('sendMessage', message, (error) => {
            if (error) return console.log(error)
            console.log("Message Delivered")
        })
        e.currentTarget.reset()
        chatFormInput.focus()
    }

    chatFormButton.removeAttribute('disabled')
})

sendLocationButton.addEventListener('click', (e) => {
    sendLocationButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition(position => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            sendLocationButton.removeAttribute('disabled')
            console.log("Location shared!")
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})
