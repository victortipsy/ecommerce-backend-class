import { RequestHandler } from "express";
import { validator } from "./../validator";
import { productSchemaValidator } from "./productSchema";

export const productValidation: RequestHandler = (req, res, next) =>
  validator(productSchemaValidator.postProduct, req.body, next);
