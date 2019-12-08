import * as _ from 'lodash';

export class ObjectUtil {
  static convertKeyToCamelCase(data: any) {
    if (!data) {
      return data;
    } else if (Array.isArray(data)) {
      return _.map(data, item => ObjectUtil.convertKeyToCamelCase(item));
    } else if (data instanceof Object) {
      return _.mapValues(_.mapKeys(data, (value: any, key: string) => _.camelCase(key)), (obj: any) =>
        obj && obj instanceof Object ? ObjectUtil.convertKeyToCamelCase(obj) : obj,
      );
    }

    return data;
  }

  static convertKeyToSnakeCase(data: object, ignoreDigit = false) {
    if (!data) {
      return data;
    } else if (Array.isArray(data)) {
      return _.map(data, item => ObjectUtil.convertKeyToSnakeCase(item));
    } else if (data instanceof Object) {
      return _.mapValues(
        _.mapKeys(data, (value: any, key: string) => {
          let newKey: string = _.snakeCase(key);
          if (!ignoreDigit) {
            newKey = _.words(newKey).reduce((result, word, index) => `${result}${index && isNaN(+word.charAt(0)) ? '_' : ''}${word}`, '');
          }

          return newKey;
        }),
        (obj: any) => (obj && obj instanceof Object ? ObjectUtil.convertKeyToSnakeCase(obj) : obj),
      );
    }
    return data;
  }

  static jsonToParams(
    data: object,
  ): {
    [key: string]: any;
  } {
    const params: {
      [key: string]: any;
    } = {};
    const formData = new FormData();
    ObjectUtil.writeToFormData(formData, data, '');

    formData.forEach((value, key) => {
      params[key] = value;
    });

    return params;
  }

  static jsonToFormData(data: object): FormData {
    const formData = new FormData();
    ObjectUtil.writeToFormData(formData, data, '');

    return formData;
  }

  private static writeToFormData(formData: FormData, data: any, prefixKey: string = '') {
    if (data !== undefined && data != null) {
      if (data instanceof File) {
        formData.append(prefixKey, data);
      } else if (Array.isArray(data)) {
        _.each(data, v => {
          ObjectUtil.writeToFormData(formData, v, `${prefixKey}[]`);
        });
      } else if (data instanceof Object) {
        _.each(Object.keys(data), key => {
          if (prefixKey) {
            ObjectUtil.writeToFormData(formData, data[key], `${prefixKey}[${key}]`);
          } else {
            ObjectUtil.writeToFormData(formData, data[key], `${key}`);
          }
        });
      } else {
        formData.append(prefixKey, data);
      }
    }
  }
}
