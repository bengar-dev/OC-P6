const express = require('express');
const mongoose = require('mongoose');

const fs = require('fs');
const jwt = require('jsonwebtoken');
const Sauce = require('../models/Sauce');

exports.getAll = (req, res, next) => {
    Sauce.find()
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(500).json({error}));
};

exports.getSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(401).json({error}));
};

exports.addSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    sauce.save()
        .then(() => res.status(200).json({message: 'Sauce ajoutée'}))
        .catch(error => res.status(401).json({error}));
};

exports.editSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
        .then(
            sauce => {
                if(!sauce) {
                    return res.status(401).json({message: 'Cette sauce n\'existe pas'});
                }
                //verification si la sauce appartient à l'utilisateur
                let token = req.headers.authorization.split(' ')[1];
                let decodedToken = jwt.verify(token, 'MONMOTCLE');
                let userId = decodedToken.userId;
                if (sauce.userId != userId) {
                    return res.status(401).json({message: 'Non authorisé'});
                }
                const sauceObject = req.file ?
                { 
                    ...JSON.parse(req.body.sauce),
                    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
                 } : { ...req.body };
                 const filename = sauce.imageUrl.split('/images/')[1];
                 fs.unlink(`images/${filename}`, () => {
                    Sauce.updateOne({_id: req.params.id}, {...sauceObject, _id:req.params.id})
                    .then(() => res.status(201).json({message: 'Sauce modifiée'}))
                    .catch(error => res.status(500).json({error}));
                 });
            }
        )
        .catch(error => res.status(500).json({error}));
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
        .then(
            sauce => {
                if (!sauce) {
                    return res.status(402).json({message: 'Cette sauce n\'existe pas'});
                }
                //verification si la sauce appartient à l'utilisateur
                let token = req.headers.authorization.split(' ')[1];
                let decodedToken = jwt.verify(token, 'MONMOTCLE');
                let userId = decodedToken.userId;
                if (sauce.userId != userId) {
                    return res.status(401).json({message: 'Non authorisé'});
                }
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({_id: req.params.id})
                    .then(() => res.status(201).json({message: 'Sauce effacée'}))
                    .catch(error => res.status(500).json({error}));
                })
            }
        )
        .catch(error => res.status(405).json(error));
};