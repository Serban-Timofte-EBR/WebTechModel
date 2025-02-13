import models from "../../models/index.mjs";
import { Op } from "sequelize";
import bcrypt from "bcrypt";

const getAllUsers = async (req, res, next) => {
  try {
    const exceptId = req.user.id;

    if (!exceptId) {
      exceptId = 0;
    }
    const users = await models.User.findAll({
      where: {
        id: {
          [Op.ne]: exceptId,
        },
      },
    });
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await models.User.findByPk(req.params.id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    user.type = req.body.type;
    await user.save();
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const user = await models.User.create({
      email: req.body.email,
      passwordHash: await bcrypt.hash(req.body.password, 10),
      type: req.body.type,
    });
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await models.User.findByPk(req.params.id);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    await models.Permission.destroy({
      where: { forUser: user.id },
    });

    await models.Task.destroy({
      where: { userId: user.id },
    });

    await models.Project.destroy({
      where: { userId: user.id },
    });

    await user.destroy();
    res.status(200).json({
      message: "User deleted successfully",
      userID: user.id,
    });
  } catch (err) {
    next(err);
  }
};

export default {
  getAllUsers,
  deleteUser,
  createUser,
  updateUser,
};
