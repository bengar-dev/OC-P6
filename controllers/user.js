const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

exports.login = (req, res, next) => {
    User.findOne({email: req.body.email})
        .then((user) => {
            if(!user) {
                return res.status(401).json({message: 'Utilisateur introuvable'})
            }
            bcrypt.compare(req.body.password, user.password)
                .then((valid) => {
                    if(!valid) {
                        return res.status(401).json({message: 'Mot de passe incorrect'})
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            {userId: user._id},
                            'MONMOTCLE',
                            {expiresIn: '24h'}
                        )
                    });
                })
                .catch(error => res.status(500).json({error}));
        })
        .catch(error => res.status(500).json({error}));
};


exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
        .then(
           hash => {
               const user = new User({
                email: req.body.email,
                password: hash
               });
               user.save()
                .then(() => res.status(200).json({message: 'Utilisateur créé'}))
                .catch(error => res.status(400).json({error}));
           } 
        )
        .catch(error => res.status(500).json({error}));
};