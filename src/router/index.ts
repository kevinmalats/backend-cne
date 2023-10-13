import express from 'express'

import aunthenticationRoutes from './aunthentication.routes';
import usersRoutes from './users.routes';
import provinceRoutes from './province.routes';
import recordsRoutes from './record.routes';
const router = express.Router();

export default (): express.Router => {
   // aunthenticationRoutes(router);
    usersRoutes(router);
    provinceRoutes(router);
    recordsRoutes(router);
    return router;
};