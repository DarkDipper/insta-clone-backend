import dotenv from "dotenv"
dotenv.config();

const secretKey:number = process.env.PORT

console.log(typeof secretKey)
console.log(secretKey)