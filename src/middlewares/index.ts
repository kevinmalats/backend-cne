import express from 'express';

import {get, merge } from 'lodash';
import {getUserBysessionToken} from '../db/users'


export const isOwner = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const { id } = req.params;
        const currentUserId = get(req, 'identity._id', '') as string;

        console.log("HERe", currentUserId.toString(), id, currentUserId.toString() !== id);
        
        if(!currentUserId){
            return res.status(403).json({ message: 'User No autorized' });
        }

        if(currentUserId.toString() !== id){
            return res.status(403).json({ message: 'User Cannont be deleted' });
        }

        next();

    } catch (error) {
        console.log(error);

        return res.status(400).json({ message: 'Error with the api' });
    }
}

export const isAuthenticated = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const sessiontoken = req.cookies['CNE-AUTH'];
        if(!sessiontoken){
            return res.status(403).json({ message: 'Token expired' });
        }
        const existingUser = await getUserBysessionToken(sessiontoken);

        if(!existingUser){
            return res.status(403).json({ message: 'User not found' });
        }

    

        merge(req, { identity: existingUser});

        return next();

    } catch (error) {
        console.log(error);

        return res.status(400).json({ message: 'Error with the api' });
    }
}