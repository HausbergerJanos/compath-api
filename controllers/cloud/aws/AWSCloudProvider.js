const path = require('path');
const CloudProvider = require('../CloudProvider');
const fileUtils = require('../../../utils/fileUtils');
const {
  createBucket,
  makeBucketPublic,
  deleteBucket,
  uploadDirectory,
} = require('./S3Controller');

class AWSCloudProvider extends CloudProvider {
  async createAndDeployRedirectClient(project) {
    const bucketName = await createBucket(project.slug);
    project.redirectClientMeta.bucketName = bucketName;
    await project.save();
    await makeBucketPublic(bucketName);
    await fileUtils.createBucketSourceDirectory(project);
    // TODO - Refactor!
    await uploadDirectory(
      bucketName,
      path.join('dev-data', 'temporary', bucketName),
    );
    await fileUtils.deleteDirectory(
      path.join('dev-data', 'temporary', bucketName),
    );
  }

  async deleteRedirectClient(project) {
    await deleteBucket(project.redirectClientMeta.bucketName);
  }
}

module.exports = AWSCloudProvider;
