
const User = require('../../Models/User/model');




const getUsers = (req, res, next) => {
    User.find() // ✅ Use the model to call find()
        .then(response => {
            res.json({ response });
        })
        .catch(error => {
            res.json({ error });
        });
};


const addUser = (req, res, next) => {
    const user = new User({
        id: req.body.id,
        name: req.body.name,
    });
    user.save()
        .then(response => {
            res.json({ response })
        })
        .catch(error => {
            res.json({ error })
        });

}



const updateUser = (req, res, next) => {
    const { id, name } = req.body; //  use req.body, not res.body

    User.updateOne({ id: id }, { $set: { name: name } }) //  Add `User.` here
        .then(response => {
            res.json({ response });
        })
        .catch(error => {
            res.json({ error });
        });
};



const deleteUser = (req, res, next) => {
    const id = req.body.id;

    User.deleteOne({ id: id }) // ✅ Prefix with User.
        .then(response => {
            res.json({ response });
        })
        .catch(error => {
            res.json({ error });
        });
};





exports.getUsers = getUsers;
exports.addUser = addUser;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
