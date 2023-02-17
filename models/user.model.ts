import { Document, model, Schema } from "mongoose";
import { iCartItems, IUser } from "../interfaces/User";
import isEmail from "validator/lib/isEmail";
import { authRole } from "../constants/user.constant";

interface UserSchema extends Document, IUser {
  clearCart(): Promise<void>;
  removeFromCart(productId: string): Promise<void>;
  addToCart(prodID: string, doDecrease: boolean): Promise<boolean>;
}

const userSchema: Schema<UserSchema> = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide your name"],
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: [isEmail, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Please provide your password"],
      minlength: 6,
    },
    confirmPassword: {
      type: String,
      required: [true, "Please provide your confirm password"],
      minlength: 6,
    },
    role: {
      type: String,

      enum: [authRole.admin, authRole.manager, authRole.user],
      message: `Please identify your role as provided: 
      ${authRole.user}, 
      ${authRole.admin}, 
      ${authRole.manager}`,
      default: authRole.user,
      required: true,
    },
    cart: {
      items: [
        {
          productId: {
            type: Schema.Types.ObjectId,
            ref: "Products",
            required: [true, "Please select a product"],
          },
          quantity: {
            type: Number,
            required: [true, "Please select a quantity"],
          },
        },
      ],
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

userSchema.methods.addToCart = function (prodID: string, doDecrease: boolean) {
  let cartItemIndex = -1;
  let updateCartItems: iCartItems[] = [];
  if (this.cart.items) {
    cartItemIndex = this.cart.items.findIndex(
      (cp: { productId: { toString: () => string } }) => {
        return cp.productId.toString() === prodID.toString();
      }
    );
    updateCartItems = [...this.cart.items];
  }
  let newQuantity = 1;
  if (cartItemIndex >= 0) {
    if (doDecrease) {
      newQuantity = this.cart.items[cartItemIndex].quantity - 1;
      if (newQuantity <= 0) {
        return this.removeFromCart(prodID);
      } else {
        newQuantity = this.cart.items[cartItemIndex].quantity + 1;
      }
      updateCartItems[cartItemIndex].quantity = newQuantity;
    }
  } else {
    updateCartItems.push({
      productId: prodID,
      quantity: newQuantity,
    });
  }
  const updatedCart = {
    items: updateCartItems,
  };
  this.cart.items = updatedCart;
  return this.save({ validateBeforeSave: false });
};

userSchema.methods.removeFromCart = function (productId: string) {
  const updateCart = this.cart.items.filter(
    (items: { productId: { toString: () => string } }) => {
      return items.productId.toString() !== productId.toString();
    }
  );
  this.cart.items = updateCart;
  return this.save({ validateBeforeSave: false });
};

userSchema.methods.clearCart = function () {
  this.cart = { items: [] };
  return this.save();
};

const UserModel = model<UserSchema>("User", userSchema);
export default UserModel;
