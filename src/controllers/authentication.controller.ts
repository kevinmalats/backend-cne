import express from 'express'

import { createUser, getUserByEmail } from '../db/users';
import { random, authentication } from '../helpers';


export const login = async (req: express.Request, res: express.Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {

            return res.status(400).json({ message: 'Some field is missing' });
        }

        const user = await getUserByEmail(email).select('+authentication.salt +authentication.password');
        console.log({ user });

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const expectedHash = authentication(user.authentication.salt, password);
        if (expectedHash !== user.authentication.password) {
            return res.status(403).json({ message: 'Wrong password or email' });
        }

        const salt = random();
        user.authentication.sessionToken  = authentication(salt, user._id.toString());

        await user.save();

        res.cookie('CNE-AUTH', user.authentication.sessionToken, {domain: 'localhost', path: '/'});

        return res.status(200).json(user).end();

    } catch (error) {
        console.log(error);

        return res.status(400).json({ message: 'Error with the api' });
    }
}



export const register = async (req: express.Request, res: express.Response) => {

    try {
        const { email, password, userName } = req.body;


        if (!email || !password || !userName) {
            return res.status(400).json({ message: 'Some field is missing' });
        }

        const existingUser = await getUserByEmail(email);

        if (existingUser) {
            return res.status(400).json({ message: `The user ${userName} already exist` });;
        }

        const salt = random();
        const user = await createUser({
            email,
            userName,
            authentication: {
                salt,
                password: authentication(salt, password)
            }
        });
        console.log('An User was created');

        return res.status(200).json(user).end();
    } catch (error) {
        console.log(error)
        return res.status(400).json({ message: 'Error with the api' });
    }
}