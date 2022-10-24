const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');

exports.getAll = (Model) =>
  catchAsync(async function (req, res, next) {
    // { The next two lines of code is an hack to favor the getAllReviews route when it's trying to get all reviews for a specific tour
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId }; // gets all reviews for a specific tour, if tourId is in the url }
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .project()
      .paginate();
    const docs = await features.queryObj;
    res.status(200).json({
      success: true,
      page: +req.query.page || 1,
      results: docs.length,
      data: {
        data: docs,
      },
    });
  });

exports.getOne = (Model, docType, populateOptions) =>
  catchAsync(async function (req, res, next) {
    let query = Model.findById(req.params.id); // Tour.findOne({_id: req.params.id});
    if (populateOptions) query.populate(populateOptions);
    const doc = await query;
    if (!doc) {
      return next(
        new AppError(
          `${docType} with id, ${req.params.id} does not exist!`,
          404
        )
      );
    }
    res.status(200).json({
      success: true,
      data: {
        data: doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async function (req, res, next) {
    // const toBeCreatedDoc = new Model(req.body);
    // const newDoc = await toBeCreatedDoc.save();

    const newDoc = await Model.create(req.body);
    res.status(201).json({
      success: true,
      data: {
        data: newDoc,
      },
    });
  });

exports.updateOne = (Model, docType) =>
  catchAsync(async function (req, res, next) {
    const updatedDoc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedDoc) {
      return next(
        new AppError(
          `${docType} with id, ${req.params.id} does not exist!`,
          404
        )
      );
    }
    res.status(200).json({
      success: true,
      data: {
        data: updatedDoc,
      },
    });
  });

exports.deleteOne = (Model, docType) =>
  catchAsync(async function (req, res, next) {
    const deletedTour = await Model.findByIdAndDelete(req.params.id, {
      strict: true,
    });
    if (!deletedTour) {
      return next(
        new AppError(
          `${docType} with id, ${req.params.id} does not exist!`,
          404
        )
      );
    }
    res.status(204).json({
      success: true,
      data: null,
    });
  });
