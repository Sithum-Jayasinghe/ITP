const Register = require('../../Models/Register/model');

// Get all registers
const getRegisters = (req, res, next) => {
    Register.find()
        .then(response => {
            res.json({ response });
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};

// Add a new register
const addRegister = (req, res, next) => {
    const register = new Register({
        id: req.body.id,
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        phone: req.body.phone,
        profilePhoto: req.body.profilePhoto || null
    });

    register.save()
        .then(response => {
            res.json({ response });
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};

// Update a register
const updateRegister = (req, res, next) => {
    const { id, name, email, password, phone, profilePhoto } = req.body;

    Register.updateOne({ id: id }, {
        $set: {
            name,
            email,
            password,
            phone,
            profilePhoto
        }
    })
        .then(response => {
            res.json({ response });
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};

// Delete a register
const deleteRegister = (req, res, next) => {
    const id = req.body.id;

    Register.deleteOne({ id: id })
        .then(response => {
            res.json({ response });
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};

// Export all functions
module.exports = {
    getRegisters,
    addRegister,
    updateRegister,
    deleteRegister
};
