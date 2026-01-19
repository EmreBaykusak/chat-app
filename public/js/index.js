import { io } from "/socket.io/socket.io.esm.min.js"

const socket = io()

const roomList = document.querySelector('#room-list')

socket.on('roomList', (rooms) => {
    const html = rooms.map((room) => `<option value="${room}">${room}</option>`).join('');
    roomList.innerHTML = html;
});