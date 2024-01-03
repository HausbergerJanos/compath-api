const { createContainer, asClass } = require('awilix');
const AWSCloudProvider = require('../controllers/cloud/aws/AWSCloudProvider');

const container = createContainer();

container.register({
  cloudProvider: asClass(AWSCloudProvider).singleton(),
});

module.exports = container;
