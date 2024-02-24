exports.detectClientPlatform = (req) => {
  const userAgent = req.headers['user-agent'];

  if (/android/i.test(userAgent)) {
    return 'android';
  }

  if (/iPad|iPhone|iPod/.test(userAgent)) {
    return 'iOS';
  }

  return 'desktop';
};
