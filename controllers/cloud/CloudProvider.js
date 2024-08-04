class CloudProvider {
  async createAndDeployRedirectClient() {
    throw new Error(
      'createAndDeployRedirectClient method should be implemented',
    );
  }

  async createOrUpdateAssetLinks() {
    throw new Error('createOrUpdateAssetLinks method should be implemented');
  }

  async deleteRedirectClient() {
    throw new Error('deleteRedirectClient method should be implemented');
  }
}

module.exports = CloudProvider;
