import express from "express";

import {createRecord, getRecordById, getRecordByProperty, getAllRecords, getRecordByProperties} from "../db/record";
import {RecordMongo} from "../models/recordMongo"
import {ERRORS} from "../repository/errorEnum";
import {statesRecordEnum} from "../repository/statesRecordEnum";
import {isEmpty, isNil} from "lodash";
import { getDeskById} from "../db/desk";
import { getZoneById} from "../db/zone";
import {getProvinceByIDCanton} from "../db/province";
import {generalEnum} from "../repository/generalEnum";
import {TotalCount} from "../types/general";

const initialValues: TotalCount = {totalVotes: 0, totalAbsenteeism: 0, totalVotesBlanks: 0, totalVotesNull: 0,
    firstCandidate: {name:"",totalVotes:0},secondCandidate: {name:"",totalVotes:0}};

//*** Save Functions ***//

export const registerRecord = async (req: express.Request, res: express.Response) => {
   const obj: RecordMongo = req.body;
   console.log(obj.idDesk);

    try{
       await logicSaveRecord(obj);
       //console.log(obj);
       const recordExist = await _validationRecord(obj);
       if(!isNil(recordExist)) {
           obj.isCountFast = false;
           if(await update(obj, recordExist._id.toString()))
           return res.status(200).json({message:"Success"}).end();
       }else
        await createRecord(obj);
        return res.status(200).json({message:"Success"}).end();


    }catch(error){
        return res.status(400).json({ message: error.message });
    }
}

const logicSaveRecord = async (obj: RecordMongo) => {
    const desk = await getDeskById(obj.idDesk)
    if(isNil(desk)){
        throw new Error(ERRORS.E03);
    }
    console.log(desk.idZone);
    const zone = await getZoneById(desk.idZone);
    if(isNil(zone)){
        throw new Error(ERRORS.E04);
    }
    const province:any[] = await getProvinceByIDCanton(zone.idCanton);
    if(isEmpty(province)){
        throw new Error(ERRORS.E05);
    }
    obj.idProvince = province[0]._id.toString();
    obj.idZone = desk.idZone;
    obj.idCanton = zone.idCanton;
    obj.status = statesRecordEnum.PENDING;
    obj.code = "123456789";
    obj.isCountFast = isNil(obj.isCountFast) ? false : obj.isCountFast;
}

//*** Get Functions ***//

export const countAllCountryRecords = async (req: express.Request, res: express.Response) => {
    console.log("req"+req.params.id);

    try{
        let records : RecordMongo[]
        records = await validateParamCount(req.params.id);

        console.log(records.map(record => record.idProvince));
        const totalVotes = records.reduce((acc, record) => {
            return {
                ...buildCountTotal(acc, record)
            }
        }, initialValues);
        console.log(totalVotes);
        return res.status(200).json(totalVotes).end();

    }catch(error){
        return res.status(400).json({ message: error.message });
    }
}


export const getRecords = async (req: express.Request, res: express.Response) => {
    try{
        const records = await getRecordById(req.body.id);
        return res.status(200).json(records).end();
    }catch(error){
        return res.status(400).json({ message: error.message });
    }
}

//*** Update Functions ***//

export const updateRecord = async (req: express.Request, res: express.Response) => {
    const obj: RecordMongo = req.body;
    try{
        const recordMongo = await getRecordById(obj.id);
        console.log("Before");
        console.log(recordMongo.status);
        if(recordMongo.status === statesRecordEnum.PENDING){
            recordMongo.status = statesRecordEnum.APPROVED;
        }else{
            recordMongo.status = statesRecordEnum.PENDING;
        }
        console.log(recordMongo.status);
        recordMongo.save();
        return res.status(200).json({message:"Success"}).end();
    }catch(error){
        return res.status(400).json({ message: error.message });
    }
}

const update = async (record: RecordMongo, id:string):Promise<boolean>  => {
    if(!validateSumVotes(record))
        throw new Error(ERRORS.E08);
    try{
        const recordMongo = await getRecordById(id);
        console.log(recordMongo);
        buildUpdate(recordMongo, record);
        recordMongo.save();
        return true;
    }catch(error){
        console.log(error);
        throw new Error(ERRORS.E07+ error.message);
    }
}


//*** Validate Functions ***//
const validateParamCount = async (id: string):Promise<RecordMongo[]> => {
    if(isNil(id))
       return  await getAllRecords();
    if(id !== generalEnum.ALL)
        return await getRecordByProperties(id);

    return  await getAllRecords();
}

const validateSumVotes = (record: RecordMongo):boolean => {
    const totalVotesCandidates = record.candidates.reduce((acc, candidate) => {
        return acc + candidate.votes;
    }, 0);
    const totalVotes = record.totalAbsenteeism + record.totalVotesBlanks + record.totalVotesNull + totalVotesCandidates;
    if(totalVotes !== record.totalVoters)
        return false;
    return true;
}

const _validationRecord = async (obj: RecordMongo) => {
    const existRecord = await getRecordByProperty(obj.idDesk);
    //console.log(existRecord);
    if(existRecord){
        if(!existRecord.isCountFast)
            throw new Error(ERRORS.E01);
        return existRecord;
    }
    if(!obj.name){
        throw new Error(ERRORS.E02+" name");
    }

    if(!validateSumVotes(obj))
        throw new Error(ERRORS.E08);

}


//*** Build Functions ***//
const buildUpdate = (originRecord: RecordMongo,record: RecordMongo): RecordMongo => {
    return {
        ...originRecord,
        status : record.status,
        totalAbsenteeism : record.totalAbsenteeism,
        totalVotesBlanks : record.totalVotesBlanks,
        totalVotesNull : record.totalVotesNull,
        totalVoters : record.totalVoters,
        candidates : record.candidates,
        observations : record.observations,
        recordImage : record.recordImage,
        isCountFast : record.isCountFast,
    }
}
const buildCountTotal = (acc: TotalCount,record: RecordMongo): TotalCount => {
    return {
        totalVotes: acc.totalVotes + record.totalVoters,
        totalAbsenteeism: acc.totalAbsenteeism + record.totalAbsenteeism,
        totalVotesBlanks: acc.totalVotesBlanks + record.totalVotesBlanks,
        totalVotesNull: acc.totalVotesNull + record.totalVotesNull,
        firstCandidate: {name:record.candidates[0].name + " " + record.candidates[0].lastName ,totalVotes: acc.firstCandidate.totalVotes + record.candidates[0].votes},
        secondCandidate: {name:record.candidates[1].name + " " +  record.candidates[1].lastName,totalVotes: acc.secondCandidate.totalVotes+ record.candidates[1].votes},

    }
}