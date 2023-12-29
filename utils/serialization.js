exports.mapToObject = (map) => {
  const obj = {};
  if (map) {
    map.forEach((value, key) => {
      obj[key] = value;
    });
  }
  return obj;
};
