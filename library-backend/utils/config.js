require("dotenv").config();
const MONGODB_URI = `mongodb+srv://power-admin:${process.env.PASSWORD}@cluster0.tfdc3.mongodb.net/bookdb?retryWrites=true&w=majority`;
const JWT_SECRET = process.env.SECRET;
module.exports = { MONGODB_URI, JWT_SECRET };
