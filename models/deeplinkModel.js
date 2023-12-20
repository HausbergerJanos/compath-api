const mongoose = require('mongoose');

const deeplinkSchema = new mongoose.Schema(
  {
    alias: {
      type: String,
      required: [true, 'A deeplink must have an alias!'],
      trim: true,
      maxlength: [
        40,
        'A deeplink alias must have less or equal then 40 characters',
      ],
      minlength: [
        3,
        'A deeplink alias must have more or equal then 3 characters',
      ],
    },
    title: {
      type: String,
      required: [true, 'A deeplink must have a title!'],
      maxlength: [
        40,
        'A deeplink title must have less or equal then 40 characters',
      ],
      minlength: [
        3,
        'A deeplink title must have more or equal then 3 characters',
      ],
    },
    description: {
      type: String,
      maxlength: [
        160,
        'A deeplink description must have less or equal then 160 characters',
      ],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    project: {
      type: mongoose.Schema.ObjectId,
      ref: 'Project',
      required: [true, 'A deeplink must belong to a project!'],
    },
    defaultRedirectURL: String,
    desktopRedirectURL: String,
    androidRedirectURL: String,
    iosRedurectURL: String,
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  },
);

deeplinkSchema.index({ project: 1 });
deeplinkSchema.index({ alias: 1, project: 1 }, { unique: true });

const Deeplink = mongoose.model('Deeplink', deeplinkSchema);

module.exports = Deeplink;
