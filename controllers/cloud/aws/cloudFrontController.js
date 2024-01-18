const {
  CloudFrontClient,
  CreateDistributionCommand,
  GetDistributionCommand,
  UpdateDistributionCommand,
  DeleteDistributionCommand,
} = require('@aws-sdk/client-cloudfront');
const { createCloudfrontConfig } = require('./awsResourceManager');
const cronManager = require('../../../cron/CronManager');

const cloudFrontClient = new CloudFrontClient({
  region: process.env.DEFAULT_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET,
  },
});

exports.createCloudFrontDistribution = async (project) => {
  const distributionConfig = await createCloudfrontConfig(project);
  const command = new CreateDistributionCommand({
    DistributionConfig: distributionConfig,
  });

  const data = await cloudFrontClient.send(command);
  project.redirectClientMeta.cloudFrontDomain = data.Distribution.DomainName;
  project.redirectClientMeta.cloudFrontId = data.Distribution.Id;
  await project.save();
};

async function deleteCloudFrontDistribution(distributionId) {
  const command = new GetDistributionCommand({ Id: distributionId });
  const response = await cloudFrontClient.send(command);

  if (
    !response.Distribution.DistributionConfig.Enabled &&
    response.Distribution.Status === 'Deployed'
  ) {
    const deleteCommand = new DeleteDistributionCommand({
      Id: distributionId,
      IfMatch: response.ETag,
    });

    await cloudFrontClient.send(deleteCommand);
    return true;
  }
  return false;
}

async function disableCloudFrontDistribution(distributionId) {
  const command = new GetDistributionCommand({
    Id: distributionId,
  });
  const response = await cloudFrontClient.send(command);
  const config = response.Distribution.DistributionConfig;
  const eTag = response.ETag;

  if (config.Enabled) {
    config.Enabled = false;
    const updateCommand = new UpdateDistributionCommand({
      Id: distributionId,
      IfMatch: eTag,
      DistributionConfig: config,
    });

    await cloudFrontClient.send(updateCommand);

    cronManager.createJob(
      `deleteDistribution-${distributionId}`,
      '*/30 * * * * *',
      async () => await deleteCloudFrontDistribution(distributionId),
    );
  }
}

exports.deleteRedirectClientCloudFront = async (distributionId) => {
  await disableCloudFrontDistribution(distributionId);
};
