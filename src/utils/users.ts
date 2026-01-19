interface IUser {
    id: string;
    username: string;
    room: string;
}

const users: IUser[] = [];

export const addUser = ({id, username, room}: IUser) => {
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    if (!room || !username) return {error: "Username and room are required"}

    const existingUser = users.find((user) => user.username === username && user.room === room);
    if (existingUser) {return {error: "Username is already in use"}}

    const user = { id, username, room };
    users.push(user);
    return { user };
}

export const removeUser = (id: string) => {
    const index = users.findIndex((user) => user.id === id);
    if (index > -1) {return users.splice(index, 1)[0];}
}

export const getUser = (id: string) => {
    return users.find((user) => user.id === id)
}

export const getUsersInRoom = (room: string) => {
    room = room.trim().toLowerCase();
    return users.filter((user) => user.room === room)
}

export const getRooms = () => {
    const activeRooms = users.map((user) => user.room);
    const uniqueRooms = [...new Set(activeRooms.reverse())]
    return uniqueRooms.slice(0, 5);
}