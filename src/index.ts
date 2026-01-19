import express from 'express';
import {Server, Socket} from 'socket.io';
import http from 'http';
import { fileURLToPath } from "url";
import path from "node:path";
import { Filter } from "bad-words"
import {generateLocation, generateMessage} from "./utils/messages.js";
import {addUser, getUser, getUsersInRoom, removeUser} from "./utils/users.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = process.env.PORT || 3030;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

const message = "Welcome to ChatApp!";

io.on('connection', (socket: Socket) => {
    console.log("New WebSocket Connection");

    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options });

        if (error) return callback(error)

        socket.join(user!.room);

        socket.emit('message', generateMessage("Admin", message));
        socket.broadcast.to(user!.room).emit('message', generateMessage("Admin", `${user!.username} has joined!`));
        io.to(user!.room).emit('roomData', {
            room: user!.room,
            users: getUsersInRoom(user!.room),
        })

        callback();
    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);

        const filter = new Filter();

        if (filter.isProfane(message)){
            return callback('Profanity is not allowed!')
        }

        io.to(user!.room).emit('message', generateMessage(user!.username, message));
        callback();
    })

    socket.on('sendLocation', (location, callback) => {
        const user = getUser(socket.id);

        io.to(user!.room).emit('locationMessage', generateLocation(user!.username, `https://google.com/maps?q=${location.latitude},${location.longitude}`));
        callback();
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('message', generateMessage("Admin", `${user.username} left the chat`));
            io.to(user!.room).emit('roomData', {
                room: user.username,
                users: getUsersInRoom(user!.room),
            })
        }
    })
})

server.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});
