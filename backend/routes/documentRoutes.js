import { Router } from 'express';
const router  = Router();
import { createDocument, getDocument, getVersions } from '../controllers/documentController.js';

router.post('/',              createDocument);
router.get('/:id',            getDocument);
router.get('/:id/versions',   getVersions);

export default router;
