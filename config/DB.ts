import mongoose from "mongoose";
import { envVariables } from "./environmentVariables";

const DB = envVariables.DB_STRING;
export async function dbConfig() {
  try {
    const conn = await mongoose.connect(DB);
    console.log(`Database is connected to ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
  }
}
