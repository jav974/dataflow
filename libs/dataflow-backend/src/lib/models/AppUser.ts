import { getModelForClass, modelOptions, prop, Severity } from "@typegoose/typegoose";
import mongoose from "mongoose";

@modelOptions({
    schemaOptions: { collection: 'appusers', timestamps: true },
    options: { allowMixed: Severity.ALLOW }
})
class AppUserClass {
    @prop({ required: true })
    public id!: string;

    @prop({ required: true })
    public provider!: string;

    @prop({ required: true })
    public providerId!: string;
}

export const AppUserModel =
  mongoose.models.AppUserClass ||
  getModelForClass(AppUserClass);
