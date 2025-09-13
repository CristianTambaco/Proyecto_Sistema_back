// NoSQL === MongoDB
// Server ==== ODM  === Mongoose

import moongose from 'mongoose'



moongose.set('strictQuery', true)

console.log(process.env.MONGODB_URI_LOCAL)


const connection = async() => {
    try {
        await moongose.connect(process.env.MONGODB_URI_LOCAL)
        console.log("Database is connected")
    } catch (error) {
        console.log(error)
    }
}


export default connection


