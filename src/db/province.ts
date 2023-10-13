import mongoose, { Document, Model, Schema  } from "mongoose";
import { ProvinceMongo, Canton } from "../models/provinceMongo";

const CantonSchema = new Schema<Canton>({
    code: { type: String, required: true },
    name: { type: String, required: true },
});

const ProvinceSchema = new mongoose.Schema<ProvinceMongo>({
    name: { type: String, requiered: true },
    code: { type: String, required: true },
    cantons: [CantonSchema],
    capital: { type: String, required: true },
});

export const ProvinceModel = mongoose.model("provinces", ProvinceSchema);

export const createProvince = (values: Record<string, any>) =>
    new ProvinceModel(values).save().then((province) => province.toObject());
export const getProvinceById = (id: string) => ProvinceModel.findById(id);
export const getProvinceByName = (name: string) => ProvinceModel.findOne({ name });
export const getProvinces = () => ProvinceModel.find();
export const updateProvinceById = (id: string, values: Record<string, any>) => ProvinceModel.findByIdAndUpdate(id, values);
export const deleteProvinceById = (id: string) => ProvinceModel.findByIdAndDelete({ _id: id });
export const getProvinceByIDCanton = (idCanton: string) => ProvinceModel.aggregate([
    { $unwind: "$cantons" },
    { $match: { "cantons._id": new mongoose.Types.ObjectId(idCanton) } },
    { $group: { _id: "$_id", name: { $first: "$name" }, code: { $first: "$code" }, capital: { $first: "$capital" }, cantons: { $push: "$cantons" } } }
]);

