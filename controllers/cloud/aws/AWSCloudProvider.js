const CloudProvider = require('../CloudProvider');
const {
  createBucket,
  setBucketPublic,
  deleteBucket,
} = require('./s3Controller');
const {
  createAssetLinksFile,
  uploadRedirectClientFiles,
  deleteTemporaryLocaleRedirectClientFiles,
} = require('./awsResourceManager');
const { createARecord, deleteARecord } = require('./route53Controller');

class AWSCloudProvider extends CloudProvider {
  async #copyAssetLinksIntoBucket(project, packageID, sha256Certificate) {
    await createAssetLinksFile(project, packageID, sha256Certificate);
    await uploadRedirectClientFiles(project);
    await deleteTemporaryLocaleRedirectClientFiles(project);
  }

  async #initializeBucket(project) {
    const bucketName = await createBucket(project.slug);
    await setBucketPublic(bucketName);
    project.redirectConfig.bucketName = bucketName;
    //project.redirectClientMeta.domain = `${project.slug}.compath.link`;
    await project.save();
  }

  async createAndDeployRedirectClient(project) {
    await this.#initializeBucket(project);
    await createARecord(project);
  }

  async createOrUpdateAssetLinks(project, packageID, sha256Certificate) {
    await this.#copyAssetLinksIntoBucket(project, packageID, sha256Certificate);
  }

  async deleteRedirectClient(project) {
    await deleteBucket(project.redirectConfig.bucketName);
    await deleteARecord(project);
  }
}

module.exports = AWSCloudProvider;
