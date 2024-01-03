const fs = require('fs-extra');
const path = require('path');

exports.createBucketSourceDirectory = async (project) => {
  const sourceDir = path.join('dev-data', 'templates', 'redirect-client');

  const destDir = path.join(
    'dev-data',
    'temporary',
    project.redirectClientMeta.bucketName,
  );

  await fs.ensureDir(destDir);

  await fs.copy(sourceDir, destDir);

  const configFile = path.join(destDir, 'config.js');
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

exports.deleteDirectory = async (dirPath) => {
  await fs.remove(dirPath);
};
