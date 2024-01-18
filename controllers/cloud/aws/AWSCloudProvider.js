const CloudProvider = require('../CloudProvider');
const {
  createRedirectClientFiles,
  uploadRedirectClientFiles,
  deleteTemporaryLocaleRedirectClientFiles,
} = require('./awsResourceManager');
const {
  createBucket,
  setBucketPublic,
  deleteBucket,
} = require('./s3Controller');
const {
  setCloudFrontForRedirectClient,
  deleteRedirectClientCloudFront,
} = require('./cloudFrontController');

class AWSCloudProvider extends CloudProvider {
  async #copyRedirectClientFilesIntoBucket(project) {
    await createRedirectClientFiles(project);
    await uploadRedirectClientFiles(project);
    await deleteTemporaryLocaleRedirectClientFiles(project);
  }

  async #initializeBucket(project) {
    const bucketName = await createBucket(project.slug);
    await setBucketPublic(bucketName);
    project.redirectClientMeta.bucketName = bucketName;
    project.redirectClientMeta.domain = `${project.slug}.compath.link`;
    await project.save();
  }

  async createAndDeployRedirectClient(project) {
    await this.#initializeBucket(project);
    await this.#copyRedirectClientFilesIntoBucket(project);
    await setCloudFrontForRedirectClient(project);
  }

  async deleteRedirectClient(project) {
    await deleteBucket(project.redirectClientMeta.bucketName);
    await deleteRedirectClientCloudFront(
      project.redirectClientMeta.cloudFrontId,
    );
  }
}

module.exports = AWSCloudProvider;
