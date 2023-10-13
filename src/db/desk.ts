import mongoose, {Schema} from 'mongoose';
import {DeskMongo} from "../models/deskMongo";

const DeskSchema = new mongoose.Schema<DeskMongo>({
    name: { type: String, requiered: true },
    code: { type: String, required: true },
    idZone: { type: String, required: true }
})

export const DeskModel = mongoose.model('desks', DeskSchema);

    export const getDeskByProperty = (idDesk: string) => DeskModel.findOne({ idDesk });
    export const getDeskById = (id: string) => DeskModel.findById(id);
    export const getAllDesk = () => DeskModel.find();
