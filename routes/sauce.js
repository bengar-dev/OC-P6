const express = require('express');
const router = express.Router();

const sauceCtrl = require('../controllers/sauce');

const multer = require('../middleware/cfg-multer');
const auth = require('../middleware/auth');


router.post('/:id/like', auth, sauceCtrl.likeDislike);
router.get('/:id', auth, sauceCtrl.getSauce);
router.get('/', auth, sauceCtrl.getAll);
router.post('/', auth, multer, sauceCtrl.addSauce);
router.put('/:id', auth, multer, sauceCtrl.editSauce);
router.delete('/:id', auth, sauceCtrl.deleteSauce);

module.exports = router;