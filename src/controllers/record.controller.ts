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

export const registerRecord = async (req: express.Request, res: express.Response) => {
   const obj: RecordMongo = req.body;
   console.log(obj.idDesk);

    try{
        const desk = await getDeskById(obj.idDesk)
        if(isNil(desk)){
            return res.status(400).json({ message: ERRORS.E03 });
        }
        console.log(desk.idZone);
        const zone = await getZoneById(desk.idZone);
        if(isNil(zone)){
            return res.status(400).json({ message: ERRORS.E04 });
        }
        console.log(zone.idCanton);
        const province:any[] = await getProvinceByIDCanton(zone.idCanton);
       // console.log(province);
        if(isEmpty(province)){
            return res.status(400).json({ message: ERRORS.E05 });
        }
        console.log(province[0]._id.toString());
        obj.idProvince = province[0]._id.toString();
        obj.idZone = desk.idZone;
        obj.idCanton = zone.idCanton;
        obj.status = statesRecordEnum.PENDING;
        obj.code = "123456789";
        obj.isCountFast = isNil(obj.isCountFast) ? false : obj.isCountFast;
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

export const getRecords = async (req: express.Request, res: express.Response) => {
    try{
        const records = await getRecordById(req.body.id);
        return res.status(200).json(records).end();
    }catch(error){
        return res.status(400).json({ message: error.message });
    }
}

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
    console.log("update");
    console.log(record.id);
    if(!validateSumVotes(record))
        throw new Error(ERRORS.E08);
    try{
        const recordMongo = await getRecordById(id);
        console.log(recordMongo);
        recordMongo.status = record.status;
        recordMongo.totalAbsenteeism = record.totalAbsenteeism;
        recordMongo.totalVotesBlanks = record.totalVotesBlanks;
        recordMongo.totalVotesNull = record.totalVotesNull;
        recordMongo.totalVoters = record.totalVoters;
        recordMongo.candidates = record.candidates;
        recordMongo.observations = record.observations;
        recordMongo.recordImage = record.recordImage;
        recordMongo.isCountFast = record.isCountFast;
        recordMongo.candidates = record.candidates;
        recordMongo.save();
        return true;
    }catch(error){
        console.log(error);
        throw new Error(ERRORS.E07+ error.message);
    }
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

const validateSumVotes = (record: RecordMongo):boolean => {
    const totalVotesCandidates = record.candidates.reduce((acc, candidate) => {
        return acc + candidate.votes;
    }, 0);
    const totalVotes = record.totalAbsenteeism + record.totalVotesBlanks + record.totalVotesNull + totalVotesCandidates;
    if(totalVotes !== record.totalVoters)
        return false;
    return true;
}

export const countAllCountryRecords = async (req: express.Request, res: express.Response) => {
    console.log("req"+req.params.id);
    const initialValues = {totalVotes: 0, totalAbsenteeism: 0, totalVotesBlanks: 0, totalVotesNull: 0,
        firstCandidate: {name:"",totalVotes:0},secondCandidate: {name:"",totalVotes:0}};
    try{
        let records : RecordMongo[]
        if(isNil(req.params.id))
            records = await getAllRecords();
        else{
            if(req.params.id === generalEnum.ALL)
                records = await getAllRecords();
            else
                records = await getRecordByProperties(req.params.id);

        }

        console.log(records.map(record => record.idProvince));
        const totalVotes = records.reduce((acc, record) => {
          return {
            totalVotes: acc.totalVotes + record.totalVoters,
            totalAbsenteeism: acc.totalAbsenteeism + record.totalAbsenteeism,
            totalVotesBlanks: acc.totalVotesBlanks + record.totalVotesBlanks,
            totalVotesNull: acc.totalVotesNull + record.totalVotesNull,
            firstCandidate: {name:record.candidates[0].name + " " + record.candidates[0].lastName ,totalVotes: acc.firstCandidate.totalVotes + record.candidates[0].votes},
            secondCandidate: {name:record.candidates[1].name + " " +  record.candidates[1].lastName,totalVotes: acc.secondCandidate.totalVotes+ record.candidates[1].votes},
          }
        }, initialValues);
        console.log(totalVotes);
        return res.status(200).json(totalVotes).end();

    }catch(error){
        return res.status(400).json({ message: error.message });
    }
}
