import { Request, Response, NextFunction } from "express";
import UserModel from "./../models/user.model";
import { asyncHandler } from "../utils/asyncHandler";
import { IUser } from "../interfaces/User";
import bcrypt from "bcrypt";
import { AppError, HttpCode } from "../utils/AppError";
import { envVariables } from "../config/environmentVariables";
import { generateToken } from "../middlewares/authorization/user.auth";

export const register = asyncHandler(
  async (
    req: Request<{}, {}, IUser>,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const { name, email, password, confirmPassword, role } = req.body;

    const salt: string = await bcrypt.genSalt(12);
    const hashPassword: string = await bcrypt.hash(password, salt);

    const user = await UserModel.create({
      name,
      email,
      password: hashPassword,
      confirmPassword: hashPassword,
      role,
    });

    const Password = password.split("");
    const alphabets = envVariables.ALPHABETS.split("");
    const numerics = envVariables.NUMBERS.split("");
    const specials = envVariables.SPECIAL.split("");

    const compare = (word: string[], value: string[]): boolean => {
      let store = false;
      for (let i = 0; i < word.length; i++) {
        for (let j = 0; j < value.length; j++) {
          if (word.includes(value[j])) {
            store = true;
          }
        }
      }
      return store;
    };
    const checknumerics = compare(Password, numerics);
    const checkalphabets = compare(Password, alphabets);
    const checkspecials = compare(Password, specials);

    if (!checkalphabets)
      next(
        new AppError({
          httpCode: HttpCode.FORBIDDEN,
          message:
            "include alphabets in your password, password must be alphanumeric",
        })
      );

    if (!checknumerics)
      next(
        new AppError({
          httpCode: HttpCode.FORBIDDEN,
          message:
            "include numbers in your password, password must be alphanumeric",
        })
      );

    if (checkspecials)
      next(
        new AppError({
          httpCode: HttpCode.FORBIDDEN,
          message: "special characters not allowed in password",
        })
      );

    if (!user)
      next(
        new AppError({
          httpCode: HttpCode.BAD_REQUEST,
          message: "User not created",
        })
      );
    return res.status(HttpCode.CREATED).json({
      data: { user },
    });
  }
);

export const login = asyncHandler(
  async (
    req: Request<{}, {}, IUser>,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const { email, password } = req.body;

    if (!email || !password) {
      next(
        new AppError({
          message: "Please provide email and password",
          httpCode: HttpCode.BAD_REQUEST,
        })
      );
    }

    const user = await UserModel.findOne({ email });
    const checkPassword = await bcrypt.compare(password, user!.password);

    if (!checkPassword) {
      next(
        new AppError({
          message: "Invalid password or email",
          httpCode: HttpCode.UNAUTHORIZED,
        })
      );
    }

    const token = generateToken({ email: user!.email, _id: user!._id });
    return res.status(HttpCode.OK).json({
      message: `${user!.name}, you are welcome`,
      token,
    });
  }
);

export const getUser = asyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const user = await UserModel.find();
    return res.status(HttpCode.OK).json({
      data: user,
    });
  }
);
