const Users = require("../models/UsersModel");

exports.webhook = async (req, res) => {
  const { id, customer } = req.body;

  const { email } = customer;
  console.log(id);

  try {
    const idExists = await Users.findOne({ user_id: id });
    if (idExists) {
      res.status(400).json({ msg: "Id has been used, purchase another card" });
    } else {
      const user = new Users({
        user_id: String(id),
        order_email: email,
        user_url: `https://askil.onrender.com/view_profile/${id}`,
      });
      user.save(user);
      res
        .status(200)
        .json({
          msg: "recieved webhook",
          url: `https://askil.onrender.com/view_profile/${id}`,
        });
    }
  } catch (error) {
    res.status(400).json({ msg: "rejected webhook" });
  }
};
