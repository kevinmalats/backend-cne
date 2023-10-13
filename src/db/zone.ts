import mongoose, {Schema} from 'mongoose';
import {ZoneMongo} from "../models/zoneMongo";

const ZoneSchema = new mongoose.Schema<ZoneMongo>({
    name: { type: String, requiered: true },
    idCanton: { type: String, required: true }
})

export const ZoneModel = mongoose.model('zones', ZoneSchema);

export const getZoneByProperty = (idDesk: string) => ZoneModel.findOne({ idDesk });
export const getZoneById = (id: string) => ZoneModel.findById(id);
export const getAllZone = () => ZoneModel.find();
