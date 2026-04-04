import { Router } from 'express';
const router  = Router();
import { summarizeDocument, improveText, fixGrammar } from '../controllers/aiController.js';

router.post('/summarize', summarizeDocument);
router.post('/improve',   improveText);
router.post('/grammar',   fixGrammar);

export default router;
