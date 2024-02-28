const CloudProvider = require('../CloudProvider');
const { createARecord, deleteARecord } = require('./route53Controller');

class AWSCloudProvider extends CloudProvider {
  async createAndDeployRedirectClient(project) {
    await createARecord(project);
  }

  async deleteRedirectClient(project) {
    await deleteARecord(project);
  }
}

module.exports = AWSCloudProvider;
