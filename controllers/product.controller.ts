import { Request, Response, NextFunction } from "express";
import ProductModel from "../models/products.model";
import { AddProducttoCart, IProducts } from "../interfaces/Products";
import { AppError, HttpCode } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthenticatedBody } from "../interfaces/Custom.interface";
import { IUser } from "../interfaces/User";
import UserModel from "../models/user.model";

export const createProduct = asyncHandler(
  async (
    req: Request<{}, {}, IProducts>,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const { name, productImage, price, category } = req.body;

    const product = await ProductModel.create({
      name,
      productImage,
      price,
      category,
    });
    if (!product)
      next(
        new AppError({
          httpCode: HttpCode.INTERNAL_SERVER_ERROR,
          message: "Product not created",
        })
      );
    return res.status(201).json({
      data: { product },
    });
  }
);

export const getAllProduct = asyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const product = await ProductModel.find();
    if (!product)
      next(
        new AppError({
          message: "Product not found",
          httpCode: HttpCode.NOT_FOUND,
        })
      );

    return res.status(HttpCode.OK).json({
      data: { product },
    });
  }
);

export const addtoCart = asyncHandler(
  async (
    req: AuthenticatedBody<AddProducttoCart>,
    res: Response,
    next: NextFunction
  ) => {
    // const product = await ProductModel.findById(req!.body!._id)
    const user = await UserModel.findOne({ email: req!.user!.email });
    if (!user)
      next(
        new AppError({
          message: "user not found",
          httpCode: HttpCode.NOT_FOUND,
        })
      );
    const doDecrease = req.query.decrease === "true";
    const updatedUser = await user!.addToCart(req.body.productId, doDecrease);
    const finalUpdate = {
      user: updatedUser,
    };
    return res.status(200).json({
      finalUpdate,
    });
  }
);
