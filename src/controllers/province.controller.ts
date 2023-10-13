import express from 'express';

import {
    createProvince,
    getProvinces,
    getProvinceById,
    deleteProvinceById,
    getProvinceByName,
    ProvinceModel
} from '../db/province';



export const registerProvince = async (req: express.Request, res: express.Response) => {

    try {
        const { name } = req.body;


        if (!name) {
            return res.status(400).json({ message: 'Name field is missing' });
        }

        const existingProvince = await getProvinceByName(name);

        if (existingProvince) {
            return res.status(400).json({ message: `The user ${name} already exist` });;
        }

        const province = await createProvince({
            name
        });
        console.log('A province was created');

        return res.status(200).json(province).end();
    } catch (error) {
        console.log(error)
        return res.status(400).json({ message: 'Error with the api' });
    }
}




export const getAllProvinces = async (req: express.Request, res: express.Response) => {
    try {
        const provinces = await getProvinces();

        console.log('Provinces was retrived');


        return res.status(200).json(provinces);

    } catch (error) {
        console.log(error);

        return res.status(400).json({ message: 'Error with the api' });
    }
}


export const deleteProvince = async (req: express.Request, res: express.Response) => {
    try {
        const { id } = req.body;
        
        const deletedProvince = await deleteProvinceById(id)

        console.log('Province was deleted');


        return res.status(200).json(deletedProvince);

    } catch (error) {
        console.log(error);

        return res.status(400).json({ message: 'Error with the api' });
    }
}

export const updateProvince = async (req: express.Request, res: express.Response) => {

    try {
        //await ProvinceModel.updateMany( { $unset: { ["canton"]: 1 } });
        const new_provinces = await getProvinces();

        return res.status(200).json(new_provinces);

    } catch (error) {
        console.log(error);

        return res.status(400).json({ message: 'Error with the api' });
    }
}

const modify = async (req: express.Request, res: express.Response) => {
   /* const provinces = await getProvinces();
    for (let i = 0; i < provinces.length; i++) {
        const province = provinces[i];
        const cantons = [];

        for (let j = 0; j < province.canton.length; j++) {
            const name_canton = province.canton[j];
            const canton = {
                name: name_canton,
                code: province.code + "0Z" + i + "P" + j,
            };
            cantons.push(canton);
        }

        // Update the province document by specifying the _id
        await ProvinceModel.findByIdAndUpdate(province._id, {$set: {cantons}});
    }*/
}