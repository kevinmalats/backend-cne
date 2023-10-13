import express from "express";
import {registerRecord, updateRecord, getRecords, countAllCountryRecords} from "../controllers/record.controller";

export default (router: express.Router) => {
    router.get('/records', getRecords);
    router.get('/records/count/:id', countAllCountryRecords);
    router.get('/records/count', countAllCountryRecords);
    router.post('/records/create', registerRecord);
    router.post('/records/update', updateRecord);
};