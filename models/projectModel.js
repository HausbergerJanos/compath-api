const mongoose = require('mongoose');
const slugify = require('slugify');

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A project must have a name!'],
      unique: true,
      trim: true,
      maxlength: [
        40,
        'A project name must have less or equal then 40 characters',
      ],
      minlength: [
        3,
        'A project name must have more or equal then 3 characters',
      ],
    },
    slug: String,
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    androidClient: {
      packageId: String,
    },
    defaultRedirectURL: {
      type: String,
      required: [true, 'A project must have a default redirect URL!'],
    },
    redirectClientMeta: {
      bucketName: String,
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

// DOCUMENT MIDDLEWARE
// Runs before .create() and .save()
projectSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
