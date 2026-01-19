interface Message {
    username: string;
    text: string
    createdAt: number
}

interface LocationMessage {
    username: string
    url: string
    createdAt: number
}


export const generateMessage = (username:string, text: string): Message => {
    return {
        username,
        text,
        createdAt: new Date().getTime()
    }
}

export const generateLocation = (username:string, url: string): LocationMessage => {
    return {
        username,
        url,
        createdAt: new Date().getTime()
    }
}