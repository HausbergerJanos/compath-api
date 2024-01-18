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
    project.redirectClientMeta.bucketName,
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
  const { bucketName } = project.redirectClientMeta;
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
    project.redirectClientMeta.bucketName,
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

exports.createCloudfrontConfig = async (project) => {
  const bucketOriginDomain = `${project.redirectClientMeta.bucketName}.s3.${process.env.DEFAULT_REGION}.amazonaws.com`;

  const configPath = path.join(
    'resources',
    'aws',
    'cloudfront',
    'cloudFrontConfig.json',
  );
  const distributionConfig = await fs.readJson(configPath);
  distributionConfig.CallerReference = new Date().getTime().toString();

  // Set origin domain - S3
  replaceValue(
    distributionConfig,
    '{bucket_alias_domain}',
    project.redirectClientMeta.domain,
  );

  // Set alias domain
  replaceValue(
    distributionConfig,
    '{bucket_origin_domain}',
    bucketOriginDomain,
  );

  replaceValue(distributionConfig, '{project_name}', project.name);

  return distributionConfig;
};
