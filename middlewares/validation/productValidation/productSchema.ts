import joi from "joi";

export const productSchemaValidator = {
  postProduct: joi.object({
    name: joi.string().required(),
    price: joi.number().required(),
    category: joi.string().required(),
    productImage: joi.string().required(),
  }),
};
