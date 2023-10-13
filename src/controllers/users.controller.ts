import express from 'express';

import { deleteUserById, getUserById, getUsers } from '../db/users';

export const getAllUsers = async (req: express.Request, res: express.Response) => {
    try {
        const users = await getUsers();

        console.log('Users was getted');


        return res.status(200).json(users);

    } catch (error) {
        console.log(error);

        return res.status(400).json({ message: 'Error with the api' });
    }
}


export const deleteUser = async (req: express.Request, res: express.Response) => {
    try {
        const { id } = req.params;
        
        const deletedUser = await deleteUserById(id)

        console.log('Users was deleted');


        return res.status(200).json(deletedUser);

    } catch (error) {
        console.log(error);

        return res.status(400).json({ message: 'Error with the api' });
    }
}

export const updateUser = async (req: express.Request, res: express.Response) => {
    try {
        const { id } = req.params;
        const { userName } = req.body;

        if(!userName){
            return res.status(400).json({ message: 'Invalid parameter' });
        }


        const user = await getUserById(id)
        user.userName = userName;
        await user.save();

        return res.status(200).json(user).end();

    } catch (error) {
        console.log(error);

        return res.status(400).json({ message: 'Error with the api' });
    }
}