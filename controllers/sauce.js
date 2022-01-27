const express = require('express');
const mongoose = require('mongoose');

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
        .then(() => res.status(200).json({message: 'Sauce bien ajouté'}))
        .catch(error => res.status(401).json({error}));
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
        .then(
            sauce => {
                if (!sauce) {
                    return res.status(401).json({message: `La sauce n'existe pas`});
                }
                const token = req.headers.authorization.split(' ')[1];
                const decodedToken = jwt.verify(token, 'MONMOTCLE');
                const userId = decodedToken.userId;
                if (req.params.userId != userId ) {
                    console.log(req.body.userId);
                    console.log(userId);
                    return res.status(401).json({message: 'Non autorisé'});
                }
                Sauce.deleteOne({_id: req.params.id})
                    .then(() => res.status(201).json({message: 'Sauce effacé'}))
                    .catch(error => res.status(500).json({error}));
            }
        )
        .catch(error => res.status(401).json(error));
};