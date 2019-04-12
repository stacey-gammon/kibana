
export function flatten(shape: { [key: string]: any }, prefix = '') {
  let output: { [key: string]: string } = {};
  if (!shape) {
    return {};
  }
  Object.keys(shape).map(key => {
    const value = shape[key];
    if (Array.isArray(value) || typeof value === 'object') {
      output = {
        ...output,
        ...flatten(shape[key], prefix + key + '.'),
      };
    } else {
      output[prefix + key] = value;
    }
  });
  return output;
}
