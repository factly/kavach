export const getIds = (objectsList = []) => {
  if (!objectsList) {
    objectsList = [];
  }

  return getValues(objectsList, 'id');
};

export const getValues = (objectsList = [], key = '') => {
  if (!objectsList) {
    objectsList = [];
  }
  if (!key) {
    key = '';
  }

  return objectsList
    .map((obj) => obj[key])
    .flat()
    .filter((item) => item);
};

export const deleteKeys = (objectsList = [], keys = []) => {
  if (!objectsList) {
    objectsList = [];
  }
  if (!keys) {
    keys = [];
  }

  return objectsList.map((obj) => {
    keys.forEach((key) => delete obj[key]);
    return obj;
  });
};

export const buildObjectOfItems = (objectsList = []) => {
  if (!objectsList) {
    objectsList = [];
  }

  const objectOfItems = {};

  for (let obj of objectsList) {
    objectOfItems[obj.id] = obj;
  }
  return objectOfItems;
};

export const unique = (listOfItems) => {
  return Array.from(new Set(listOfItems));
};
