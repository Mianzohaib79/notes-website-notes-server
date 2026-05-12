const mongoose = require("mongoose")

const { MONGO_USERNAME, MONGO_PASSWORD } = process.env


const connectDB = () => {
    mongoose.connect(`mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@cluster0.prhecp0.mongodb.net/?appName=Cluster0`)
        .then(() => {
            console.log('MongoDB connected  successfully.')

        })
        .catch(error => {
            console.log('MongoDB not connected.')
            console.error(error)
        })
}

module.exports = { connectDB }
