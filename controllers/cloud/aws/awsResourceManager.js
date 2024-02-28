const fs = require('fs-extra');
const path = require('path');

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

  replaceValue(
    recordSettings,
    '{{recordName}}',
    project.redirectClientMeta.domain,
  );

  replaceValue(recordSettings, '{{dnsName}}', process.env.API_DOMAIN);

  replaceValue(
    recordSettings,
    '{{hostedZoneIdRecord}}',
    process.env.HOSTED_ZONE_ID,
  );

  return recordSettings;
};
