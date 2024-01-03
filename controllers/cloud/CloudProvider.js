class CloudProvider {
  async createAndDeployRedirectClient() {
    throw new Error('deployRedirectClient method should be implemented');
  }

  async deleteRedirectClient() {
    throw new Error('deployRedirectClient method should be implemented');
  }
}

module.exports = CloudProvider;
