const Users = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const secretkey = "sandeepsundarlenka";

exports.signup = async (req, res, next) => {
    try {
        const { name, email,phone, password } = req.body;

        const existingUser = await Users.findOne({ where: { email: email } });

        if (existingUser) {
            return res.status(400).json({ error: "Email already registered. Please login" });
        }

        const saltRounds = 10;
        const hash = await bcrypt.hash(password, saltRounds);

        const data = await Users.create({
            name: name,
            email: email,
            phone:phone,
            password: hash
        });

        res.json({ dataValues: data });
    } catch (err) {
        res.status(500).json({ error: "Failed to sign up" });
    }
};

function generateAccessToken(id, name) {
    return jwt.sign({ id: id, name: name }, secretkey);
}

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const existingUser = await Users.findOne({ where: { email: email } });

        if (!existingUser) {
            return res.status(404).json({ error: "Email not registered. Please sign up" });
        }

        const result = await bcrypt.compare(password, existingUser.password);

        if (result) {
            const token = generateAccessToken(existingUser.id, existingUser.name);
            return res.status(200).json({ message: "User login successful", token: token });
        } else {
            return res.status(400).json({ error: "Incorrect password" });
        }
    } catch (err) {
        res.status(500).json({ error: "Failed to login" });
    }
};


exports.getUsers = async (req, res, next) => {
    try {
      const users = await Users.findAll();
      res.status(200).json({ users });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  };
  