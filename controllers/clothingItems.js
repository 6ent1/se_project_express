const clothingItem = require("../models/clothingItem");
const { ERROR_CODES, ERROR_MESSAGES } = require("../utils/errors");
const NotFoundError = require("../utils/errors/NotFoundError");
const ForbiddenError = require("../utils/errors/ForbiddenError");
const BadRequestError = require("../utils/errors/BadRequestError");

const getItems = (req, res, next) => {
  clothingItem
    .find({})
    .then((items) => res.status(200).send(items))
    .catch(next);
};

const createItem = (req, res, next) => {
  const { name, weather, imageUrl } = req.body;
  const owner = req.user._id;

  clothingItem
    .create({ name, weather, imageUrl, owner })
    .then((item) => {
      res.status(200).send({ data: item });
    })
    .catch((err) => {
      // console.error(err.name);
      if (err.name === "ValidationError") {
        next(new BadRequestError("Invalid data provided for creating an item"));
      } else {
        next(err);
      }
    });
};

const deleteItem = (req, res, next) => {
  const { itemId } = req.params;
  const userId = req.user._id;

  clothingItem
    .findById(itemId)
    .orFail(() => {
      throw new NotFoundError("No item found with the specified ID");
    })
    .then((item) => {
      if (item.owner.toString() !== userId) {
        throw new ForbiddenError(
          "You do not have permission to delete this item"
        );
      }
      return clothingItem.findByIdAndDelete(itemId);
    })
    .then((deletedItem) => res.status(200).send({ item: deletedItem }))
    .catch((err) => {
      if (err.name === "CastError") {
        next(new BadRequestError("Invalid item ID format"));
      } else {
        next(err);
      }
    });
};

const likeItem = (req, res, next) => {
  clothingItem
    .findByIdAndUpdate(
      req.params.itemId,
      { $addToSet: { likes: req.user._id } }, // add _id to the array if it's not there yet
      { new: true }
    )
    .orFail()
    .then((item) => res.json(item))
    .catch((err) => {
      console.error(err);
      if (err.name === "DocumentNotFoundError")
        return res
          .status(ERROR_CODES.NOT_FOUND)
          .json({ message: ERROR_MESSAGES.NOT_FOUND });
      if (err.name === "CastError") {
        return res
          .status(ERROR_CODES.BAD_REQUEST)
          .send({ message: ERROR_MESSAGES.BAD_REQUEST });
      }
      return res
        .status(ERROR_CODES.SERVER_ERROR)
        .json({ message: ERROR_MESSAGES.SERVER_ERROR });
    });
};

const dislikeItem = (req, res, next) => {
  clothingItem
    .findByIdAndUpdate(
      req.params.itemId,
      { $pull: { likes: req.user._id } }, // remove _id from the array
      { new: true }
    )
    .orFail()
    .then((item) => res.send(item))
    .catch((err) => {
      console.error(err);
      if (err.name === "DocumentNotFoundError")
        return res
          .status(ERROR_CODES.NOT_FOUND)
          .json({ message: ERROR_MESSAGES.NOT_FOUND });
      if (err.name === "CastError") {
        return res
          .status(ERROR_CODES.BAD_REQUEST)
          .send({ message: ERROR_MESSAGES.BAD_REQUEST });
      }
      return res
        .status(ERROR_CODES.SERVER_ERROR)
        .send({ message: ERROR_MESSAGES.SERVER_ERROR });
    });
};

module.exports = {
  getItems,
  deleteItem,
  createItem,
  likeItem,
  dislikeItem,
};
