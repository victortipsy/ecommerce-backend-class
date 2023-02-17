import { Request } from "express";
import { IUser } from "./User";

export interface AuthenticatedBody<T> extends Request {
  body: T;
  user?: IUser;
}
