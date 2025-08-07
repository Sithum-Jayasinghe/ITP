const Staff = require('../../Models/Staff/model');

// Get all staff members
const getStaffs = (req, res, next) => {
  Staff.find()
    .then(response => {
      res.json({ response });
    })
    .catch(error => {
      res.json({ error });
    });
};

// Add a new staff member
const addStaff = (req, res, next) => {
  const staff = new Staff({
    id: req.body.id,
    name: req.body.name,
    role: req.body.role,
    num: req.body.num,
    email: req.body.email,
    certificate: req.body.certificate,
    schedule: req.body.schedule,
    status: req.body.status,
  });

  staff.save()
    .then(response => {
      res.json({ response });
    })
    .catch(error => {
      res.json({ error });
    });
};

// Update a staff member
const updateStaff = (req, res, next) => {
  const { id, name, role, num, email, certificate, schedule, status } = req.body;

  Staff.updateOne({ id: id }, {
    $set: {
      name,
      role,
      num,
      email,
      certificate,
      schedule,
      status
    }
  })
    .then(response => {
      res.json({ response });
    })
    .catch(error => {
      res.json({ error });
    });
};

// Delete a staff member
const deleteStaff = (req, res, next) => {
  const id = req.body.id;

  Staff.deleteOne({ id: id })
    .then(response => {
      res.json({ response });
    })
    .catch(error => {
      res.json({ error });
    });
};

// Export functions
exports.getStaffs = getStaffs;
exports.addStaff = addStaff;
exports.updateStaff = updateStaff;
exports.deleteStaff = deleteStaff;
