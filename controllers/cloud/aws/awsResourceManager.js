const fs = require('fs-extra');
const path = require('path');
const { uploadDirectory } = require('./s3Controller');

function replaceValue(config, oldValue, newValue) {
  Object.keys(config).forEach((key) => {
    if (typeof config[key] === 'string') {
      config[key] = config[key].replace(oldValue, newValue);
    } else if (typeof config[key] === 'object' && config[key] !== null) {
      replaceValue(config[key], oldValue, newValue);
    }
  });
}

exports.createAssetLinksFile = async (
  project,
  packageID,
  sha256Certificate,
) => {
  const templateSourceDir = path.join(
    'resources',
    'aws',
    's3',
    'redirect_client',
    'templates',
  );

  const temporaryStorageDir = path.join(
    'resources',
    'aws',
    's3',
    'redirect_client',
    'temporary',
    project.redirectConfig.bucketName,
  );

  await fs.ensureDir(temporaryStorageDir);
  await fs.copy(templateSourceDir, temporaryStorageDir);

  const assetLinksFilePath = path.join(temporaryStorageDir, 'assetlinks.json');
  const assetLinks = await fs.readJson(assetLinksFilePath);

  replaceValue(
    assetLinks,
    '{{package_id}}',
    packageID || project.redirectConfig.androidClient.packageID,
  );

  replaceValue(
    assetLinks,
    '{{sha_256}}',
    sha256Certificate || project.redirectConfig.androidClient.sha256Certificate,
  );

  await fs.writeJson(assetLinksFilePath, assetLinks, { spaces: 2 });
};

exports.uploadRedirectClientFiles = async (project) => {
  const { bucketName } = project.redirectConfig;
  const temporaryStorageDir = path.join(
    'resources',
    'aws',
    's3',
    'redirect_client',
    'temporary',
    bucketName,
  );

  await uploadDirectory(bucketName, temporaryStorageDir);
};

exports.deleteTemporaryLocaleRedirectClientFiles = async (project) => {
  const temporaryStorageDir = path.join(
    'resources',
    'aws',
    's3',
    'redirect_client',
    'temporary',
    project.redirectConfig.bucketName,
  );

  await fs.remove(temporaryStorageDir);
};

exports.createRoute53RecordSettings = async (action, project) => {
  const recordSettingsPath = path.join(
    'resources',
    'aws',
    'route53',
    'route53RecordSettings.json',
  );
  const recordSettings = await fs.readJson(recordSettingsPath);

  replaceValue(recordSettings, '{{action}}', action);

  replaceValue(recordSettings, '{{recordName}}', project.domain);

  replaceValue(recordSettings, '{{dnsName}}', process.env.API_DOMAIN);

  replaceValue(
    recordSettings,
    '{{hostedZoneIdRecord}}',
    process.env.HOSTED_ZONE_ID,
  );

  return recordSettings;
};
