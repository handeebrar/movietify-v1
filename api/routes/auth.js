const express = require('express');
const router  = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

//Handle incoming POST requests to /auth
router.post('/signup', (req, res, next) => {
    User.find({email: req.body.email , username: req.body.username})
    .exec()
    .then(user => {
        if(user.length >= 1) {
            return res.status(409).json({
                message: 'Mail or username exist'
            });
        } else {
            bcrypt.hash(req.body.password,10,(err, hash) => {
                if(err) {
                    return res.status(500).json({
                        error: err
                    });
                } else {
                    const user = new User({
                        _id: new mongoose.Types.ObjectId(),
                        username: req.body.username,
                        email: req.body.email,
                        password: hash
                    });
                    user
                        .save()
                        .then(result => {
                            console.log(result);
                            res.status(201).json({
                                message: 'User created'
                            });
                        })
                        .catch(err => {
                            console.log(err);
                            res.status(500).json({
                                error: err
                            });
                        });
                    }   
                });
        }
    })
});

router.post("/signin", (req, res, next) => {
    User.find({ username: req.body.username })
      .exec()
      .then(user => {
        if (user.length < 1) {
          return res.status(401).json({
            message: "Auth failed"
          });
        }
        bcrypt.compare(req.body.password, user[0].password, (err, result) => {
          if (err) {
            return res.status(401).json({
              message: "Auth failed"
            });
          }
          if (result) {
            const token = jwt.sign(
              {
                email: user[0].email,
                userId: user[0]._id
              },
              process.env.JWT_KEY,
              {
                  expiresIn: "1h"
              }
            );
            return res.status(200).json({
              message: "Auth successful",
              userId: user[0]._id,
              token: token
            });
          }
          res.status(401).json({
            message: "Auth failed"
          });
        });
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({
          error: err
        });
      });
  });

module.exports = router;