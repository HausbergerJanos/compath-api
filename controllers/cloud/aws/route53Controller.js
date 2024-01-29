const {
  Route53Client,
  ChangeResourceRecordSetsCommand,
} = require('@aws-sdk/client-route-53');
const { createRoute53RecordSettings } = require('./awsResourceManager');

const route53Client = new Route53Client({
  region: process.env.DEFAULT_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET,
  },
});

async function modifyARecord(recordSettings) {
  const command = new ChangeResourceRecordSetsCommand(recordSettings);
  await route53Client.send(command);
}

exports.createARecord = async (project) => {
  const recordSettings = await createRoute53RecordSettings('UPSERT', project);
  await modifyARecord(recordSettings);
};

exports.deleteARecord = async (project) => {
  const recordSettings = await createRoute53RecordSettings('DELETE', project);
  await modifyARecord(recordSettings);
};
