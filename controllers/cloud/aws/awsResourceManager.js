const fs = require('fs-extra');
const path = require('path');
const { uploadDirectory } = require('./s3Controller');

exports.createRedirectClientFiles = async (project) => {
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
    project.redirection.bucketName,
  );

  await fs.ensureDir(temporaryStorageDir);
  await fs.copy(templateSourceDir, temporaryStorageDir);

  const configFile = path.join(temporaryStorageDir, 'config.js');
  let configContent = await fs.readFile(configFile, 'utf8');

  configContent = configContent.replace(
    /const projectId = .+;/,
    `const projectId = "${project._id}";`,
  );
  configContent = configContent.replace(
    /const projectName = .+;/,
    `const projectName = "${project.name}";`,
  );

  await fs.writeFile(configFile, configContent);
};

exports.uploadRedirectClientFiles = async (project) => {
  const { bucketName } = project.redirection;
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
    project.redirection.bucketName,
  );

  await fs.remove(temporaryStorageDir);
};

function replaceValue(config, oldValue, newValue) {
  Object.keys(config).forEach((key) => {
    if (typeof config[key] === 'string') {
      config[key] = config[key].replace(oldValue, newValue);
    } else if (typeof config[key] === 'object' && config[key] !== null) {
      replaceValue(config[key], oldValue, newValue);
    }
  });
}

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
