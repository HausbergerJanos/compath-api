const CloudProvider = require('../CloudProvider');
const {
  createBucket,
  setBucketPublic,
  deleteBucket,
} = require('./s3Controller');
const {
  createRedirectClientFiles,
  uploadRedirectClientFiles,
  deleteTemporaryLocaleRedirectClientFiles,
} = require('./awsResourceManager');
const { createARecord, deleteARecord } = require('./route53Controller');

class AWSCloudProvider extends CloudProvider {
  async #copyRedirectClientFilesIntoBucket(project) {
    await createRedirectClientFiles(project);
    await uploadRedirectClientFiles(project);
    await deleteTemporaryLocaleRedirectClientFiles(project);
  }

  async #initializeBucket(project) {
    const bucketName = await createBucket(project.slug);
    await setBucketPublic(bucketName);
    project.redirection.bucketName = bucketName;
    //project.redirectClientMeta.domain = `${project.slug}.compath.link`;
    await project.save();
  }

  async createAndDeployRedirectClient(project) {
    await this.#initializeBucket(project);
    await this.#copyRedirectClientFilesIntoBucket(project);
    await createARecord(project);
  }

  async deleteRedirectClient(project) {
    await deleteBucket(project.redirection.bucketName);
    await deleteARecord(project);
  }
}

module.exports = AWSCloudProvider;
