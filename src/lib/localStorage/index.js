const ls = window.localStorage;

const ERROR_LOCAL_STORAGE_NOT_AVAILABLE =
  'The localStorage API is not available on this device.';
export class LocalStorage {
  isAvailable() {
    if (!ls) {
      return false;
    }
    const _ = '_';
    try {
      ls.setItem(_, _);
      return true;
    } catch (e) {
      return false;
    } finally {
      ls.removeItem(_);
    }
  }

  sizeInBytes() {
    let size = 0;
    for (let key in ls) {
      switch (key) {
        case 'clear':
        case 'getItem':
        case 'key':
        case 'length':
        case 'removeItem':
        case 'setItem':
          continue;
      }
      size += ls[key].length;
    }
    return size;
  }

  withKey(key) {
    if (!this.isAvailable()) {
      console &&
        console.warn &&
        console.warn(ERROR_LOCAL_STORAGE_NOT_AVAILABLE);
      throw new Error(ERROR_LOCAL_STORAGE_NOT_AVAILABLE);
    }
    return {
      get: () => JSON.parse(ls.getItem(key)),
      set: value => ls.setItem(key, JSON.stringify(value)),
      remove: () => ls.removeItem(key),
      key: () => key,
      getAndRemove: () => {
        try {
          return JSON.parse(ls.getItem(key));
        } finally {
          ls.removeItem(key);
        }
      }
    };
  }
}

const instance = new LocalStorage();
module.exports = instance;
module.exports.isAvailable = instance.isAvailable.bind(instance);
module.exports.sizeInBytes = instance.sizeInBytes.bind(instance);
module.exports.withKey = instance.withKey.bind(instance);
