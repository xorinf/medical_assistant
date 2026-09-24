// SearchAPI.js
// -----------------------------------------------------------------------------
//   GET /api/search?q=<text>&type=<patients|appointments|all>
// -----------------------------------------------------------------------------

import { Router } from 'express';
import * as ctl from '../controllers/SearchController.js';
import { asyncHandler } from '../middleware/AsyncHandler.js';

const searchRouter = Router();
searchRouter.get('/', ctl.auth, ctl.staffOnly, asyncHandler(ctl.search));
export default searchRouter;
