"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { Schema } = mongoose;
mongoose.connect('mongodb+srv://lancelee92:29EWJkVvv6LsUa9t@cluster0.kzzhc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority');
app.use(cors());
app.options('*', cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const userSchema = new Schema({
    username: { type: String, required: true, index: { unique: true } },
    password: { type: String, required: true },
    salt: String
});
const todoSchema = new Schema({
    title: String,
    description: String
});
const User = mongoose.model('user', userSchema);
const Todo = mongoose.model('todo', todoSchema);
const port = 3000;
const accessTokenSecret = 'youraccesstokensecret';
app.get('/', (req, res) => {
    res.send('<h2>Express is runnings!</h2>');
});
app.all('/Api/*', (req, res, next) => {
    //console.log('authentication code here!');
    //next();
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, accessTokenSecret, (err, user) => {
            if (err) {
                return res.send({ Status: '100', Data: 'Invalid Token!' });
            }
            next();
        });
    }
    else {
        return res.send({ Status: '100', Data: 'Token Missing!' });
    }
});
app.post('/Login', (req, res) => {
    try {
        if (req.body) {
            const iUsername = req.body['username'];
            const iPwd = Buffer.from(req.body['pwd'], 'base64');
            User.findOne({ username: iUsername, password: iPwd }, (err, doc) => {
                if (err)
                    return res.json({ Status: '500', Data: err });
                console.log(doc);
                console.log(doc.length);
                if (doc != null) {
                    const accessToken = jwt.sign({ username: iUsername, issueTime: new Date() }, accessTokenSecret);
                    return res.send({ Status: '200', Data: 'Success!', Token: accessToken });
                }
                else {
                    return res.send({ Status: '200', Data: 'Invalid Login!' });
                }
            });
        }
        else {
            res.send({ Status: '500', Data: "Missing data in body" });
        }
    }
    catch (error) {
        res.send({ Status: '500', Data: error });
    }
});
app.get('/Api/GetUsers', (req, res) => {
    try {
        User.find().exec((err, doc) => {
            if (err)
                return res.send({ Status: '500', Data: err });
            else
                return res.send({ Status: '200', Data: doc });
        });
    }
    catch (error) {
        res.send({ Status: '500', Data: error });
    }
});
app.post('/Register', (req, res) => {
    try {
        const iUsername = req.body['username'];
        const iPwd = req.body['pwd'];
        User.findOne({ username: iUsername, password: iPwd }, (err, doc) => {
            if (err) {
                return res.json({ Status: '500', Data: err });
            }
            if (doc == null || doc.length == 0) {
                const newUser = new User();
                newUser.username = iUsername;
                newUser.password = Buffer.from(iPwd, 'base64');
                newUser.save((err, doc) => {
                    if (err) {
                        return res.send({ Status: '500', Data: err });
                    }
                    else {
                        return res.send({ Status: '200', Data: 'Success!' });
                    }
                });
            }
            else {
                return res.send({ Status: '200', Data: 'User Existed!' });
            }
        });
    }
    catch (error) {
        res.send({ Status: '500', Data: error });
    }
});
app.post('/Api/todo', (req, res) => {
    try {
        const id = req.body['id'];
        const todo = new Todo();
        todo.title = req.body['title'];
        todo.description = req.body['description'];
        if (id) {
            Todo.findByIdAndUpdate({ _id: id }, { title: todo.title, description: todo.description }, { upsert: false }, (err, doc) => {
                if (err) {
                    console.log(err);
                    return res.send({ Status: '500', Data: err });
                }
                else {
                    return res.send({ Status: '200', Data: 'Success!' });
                }
            });
        }
        else {
            todo.save((err, doc) => {
                if (err) {
                    console.log(err);
                    return res.send({ Status: '500', Data: err });
                }
                else {
                    return res.send({ Status: '200', Data: 'Success!' });
                }
            });
        }
    }
    catch (error) {
        res.send({ Status: '500', Data: error });
    }
});
app.get('/Api/todo', (req, res) => {
    try {
        Todo.find().exec((err, doc) => {
            if (err)
                return res.send({ Status: '500', Data: err });
            else
                return res.send({ Status: '200', Data: doc });
        });
    }
    catch (error) {
        res.send({ Status: '500', Data: error });
    }
});
app.get('/Api/todo/:id', (req, res) => {
    try {
        console.log(req.params, 'get');
        Todo.findOne({ _id: req.params.id }).exec((err, doc) => {
            if (err)
                return res.send({ Status: '500', Data: err });
            else
                return res.send({ Status: '200', Data: doc });
        });
    }
    catch (error) {
        res.send({ Status: '500', Data: error });
    }
});
app.delete('/Api/todo/:id', (req, res) => {
    try {
        console.log(req.params);
        Todo.deleteOne({ _id: req.params.id }).exec((err, doc) => {
            if (err)
                return res.send({ Status: '500', Data: err });
            else
                return res.send({ Status: '200', Data: doc });
        });
    }
    catch (error) {
        res.send({ Status: '500', Data: error });
    }
});
app.listen(port, () => {
    return console.log(`Express is listening at http://localhost:${port}`);
});
//# sourceMappingURL=app.js.map