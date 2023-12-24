const mongoose = require('mongoose');
//const Project = require('./projectModel');

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
    linkParams: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      validate: {
        validator: function (value) {
          // Ensure there are no more than 20 key-value pairs
          if (value.size > 20) {
            return false;
          }

          return true;
        },
        message: 'Link parameters must have at most 20 key-value pairs.',
      },
    },
    defaultRedirectURL: String,
    desktopRedirectURL: String,
    iosRedurectURL: String,
    androidRedirectSettings: {
      redirectToPlayStore: {
        type: Boolean,
        default: false,
      },
      packageId: String,
      customURL: String,
    },
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

// DOCUMENT MIDDLEWARE
// Runs before .create() and .save()
// TODO - Enable later if it is needed
// deeplinkSchema.pre('save', async function (next) {
//   // This refers to current document
//   const project = await Project.findById(this.project);
//   this.androidRedirectSettings.packageId = project.androidClient.packageId;
//   next();
// });

const Deeplink = mongoose.model('Deeplink', deeplinkSchema);

module.exports = Deeplink;
