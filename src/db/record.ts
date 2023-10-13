import mongoose, {Schema} from 'mongoose';
import {RecordMongo} from "../models/recordMongo";
import {Candidate} from "../models/recordMongo";
import {ProvinceModel} from "./province";

const CandidateSchema = new Schema<Candidate>({
    code: { type: String, required: true },
    name: { type: String, required: true },
    age: { type: Number, required: true },
    lastName: { type: String, required: true },
    party: { type: String, required: true },
    votes: { type: Number, required: true },
    percentage: { type: Number, required: true }
})

const RecordSchema = new mongoose.Schema<RecordMongo>({
    name: { type: String, requiered: true },
    code: { type: String, required: true },
    totalVoters: { type: Number, required: true },
    totalAbsenteeism: { type: Number, required: true },
    candidates:[CandidateSchema],
    totalVotesBlanks: { type: Number, required: true },
    totalVotesNull: { type: Number, required: true },
    recordImage: { type: String, required: true },
    observations: { type: String, required: true },
    status:{ type: String, required: true },
    isCountFast: { type: Boolean, required: true },
    idProvince: { type: String, required: true },
    idZone: { type: String, required: true },
    idCanton: { type: String, required: true },
    idDesk: { type: String, required: true }
})

export const RecordModel = mongoose.model('records', RecordSchema);

    export const createRecord = (values: Record<string,any>) =>
        new RecordModel(values).save().then((record) => record.toObject());
    export const updateRecordById = (id: string, values: Record<string, any>) => RecordModel.findByIdAndUpdate(id, values);
    export const getRecordByProperty = (idDesk: string) => RecordModel.findOne({ idDesk });
    export const getRecordById = (id: string) => RecordModel.findById(id);
    export const getAllRecords = () => RecordModel.find();
    export const getRecordByProperties = (paramsId:string) => RecordModel.aggregate([
        { $match: { $or: [{ idProvince: paramsId }, { idZone: paramsId }, { idCanton: paramsId }, { idDesk: paramsId }] } },
        ]);
