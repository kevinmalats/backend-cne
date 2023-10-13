import express from 'express'


import { getAllProvinces, registerProvince, updateProvince } from '../controllers/province.controller';

export default (router: express.Router) => {
    router.get('/provinces', getAllProvinces);
    router.post('/provinces/create', registerProvince);
    router.get('/provinces/update', updateProvince);
}