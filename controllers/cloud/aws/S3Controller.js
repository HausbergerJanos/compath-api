const {
  S3Client,
  CreateBucketCommand,
  PutPublicAccessBlockCommand,
  PutBucketPolicyCommand,
  PutBucketWebsiteCommand,
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
  DeleteBucketCommand,
} = require('@aws-sdk/client-s3');
const fs = require('fs-extra');
const path = require('path');
const mime = require('mime-types');

const s3Client = new S3Client({
  region: process.env.DEFAULT_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET,
  },
});

async function updateBucketRestrictions(bucketName) {
  const publicAccessBlockParams = {
    Bucket: bucketName,
    PublicAccessBlockConfiguration: {
      BlockPublicAcls: true,
      IgnorePublicAcls: true,
      BlockPublicPolicy: false,
      RestrictPublicBuckets: false,
    },
  };
  const data = await s3Client.send(
    new PutPublicAccessBlockCommand(publicAccessBlockParams),
  );
  console.log(data);
}

async function updateBucketPolicy(bucketName) {
  const bucketPolicy = {
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Principal: '*',
        Action: 's3:GetObject',
        Resource: `arn:aws:s3:::${bucketName}/*`,
      },
    ],
  };

  await s3Client.send(
    new PutBucketPolicyCommand({
      Bucket: bucketName,
      Policy: JSON.stringify(bucketPolicy),
    }),
  );
}

async function updateBucketWebsiteHosting(bucketName) {
  const websiteConfig = {
    Bucket: bucketName,
    WebsiteConfiguration: {
      IndexDocument: {
        Suffix: 'index.html',
      },
    },
  };
  await s3Client.send(new PutBucketWebsiteCommand(websiteConfig));
}

async function uploadFile(bucketName, filePath, fileName) {
  const fileContent = await fs.readFile(filePath, 'utf8');
  const originalFileName = path.basename(filePath);
  const contentType = mime.lookup(filePath) || 'application/octet-stream';

  const uploadParams = {
    Bucket: bucketName,
    Key: fileName || originalFileName,
    Body: fileContent,
    ContentType: contentType,
  };

  await s3Client.send(new PutObjectCommand(uploadParams));
}

async function clearBucket(bucketName) {
  const listParams = { Bucket: bucketName };

  const listedObjects = await s3Client.send(
    new ListObjectsV2Command(listParams),
  );

  if (!listedObjects.Contents || listedObjects.Contents.length === 0) return;

  await Promise.all(
    listedObjects.Contents.map(
      async (object) =>
        await s3Client.send(
          new DeleteObjectCommand({ Bucket: bucketName, Key: object.Key }),
        ),
    ),
  );

  if (listedObjects.IsTruncated) await clearBucket(bucketName);
}

exports.createBucket = async (slug) => {
  const bucketName = `compath-redirect-client-${slug}`;

  const createBucketParams = {
    Bucket: bucketName,
    CreateBucketConfiguration: {
      LocationConstraint: process.env.DEFAULT_REGION,
    },
  };
  await s3Client.send(new CreateBucketCommand(createBucketParams));

  return bucketName;
};

exports.makeBucketPublic = async (bucketName) => {
  await updateBucketRestrictions(bucketName);
  await updateBucketPolicy(bucketName);
  await updateBucketWebsiteHosting(bucketName);
};

exports.uploadDirectory = async function (bucketName, dirPath, prefix = '') {
  const files = await fs.readdir(dirPath, { withFileTypes: true });
  const uploadPromises = [];

  for (const file of files) {
    const filePath = path.join(dirPath, file.name);

    if (file.isDirectory()) {
      uploadPromises.push(
        exports.uploadDirectory(
          bucketName,
          filePath,
          path.join(prefix, file.name),
        ),
      );
    } else {
      const fileName = path.join(prefix, file.name).replace(/\\/g, '/');
      uploadPromises.push(
        uploadFile(bucketName, filePath, fileName).catch((error) => {
          console.error(`Error during upload: ${filePath}`, error);
        }),
      );
    }
  }
};

exports.deleteBucket = async (bucketName) => {
  await clearBucket(bucketName);
  await s3Client.send(new DeleteBucketCommand({ Bucket: bucketName }));
};
