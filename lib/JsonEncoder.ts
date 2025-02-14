import * as MongoDb from 'mongodb';

export default class JsonEncoder {
  static encode(obj: any) {
    if (obj instanceof MongoDb.ObjectID) {
      return {
        $type:  'ObjectId',
        $value: obj.toHexString(),
        $date:  obj.generationTime * 1000
      };
    }
    if (obj instanceof MongoDb.Binary) {
      return {
        $type:  'Binary',
        $value:  {
          $sub_type: obj.sub_type,
          $data: obj.buffer.toString('base64')
        }
      };
    }
    if (obj instanceof Date) {
      return {
        $type: 'Date',
        $value: obj.toISOString()
      };
    }
    if (obj instanceof RegExp) {
      return {
        $type: 'RegExp',
        $value: {
          $pattern: obj.source,
          $flags:   obj.flags
        }
      };
    }
    if (Array.isArray(obj)) {
      return [...obj.map(JsonEncoder.encode)];
    }
    if (obj && typeof obj === 'object') {
      for (const [key, value] of Object.entries(obj)) {
        obj[key] = JsonEncoder.encode(value);
      }
    }

    return obj;
  }

  static decode(obj: any) {
    if (obj && obj.$type === 'ObjectId') {
      return new MongoDb.ObjectID(obj.$value);
    }
    if (obj && obj.$type === 'Binary') {
      return new MongoDb.Binary(Buffer.from(decodeURIComponent(obj.$value.$data), 'base64'), parseInt(obj.$value.$sub_type));
    }
    if (obj && obj.$type === "Date") {
      return new Date(obj.$value);
    }
    if (obj && obj.$type === "RegExp") {
      return new RegExp(obj.$value.$pattern, obj.$value.$flags);
    }
    if (Array.isArray(obj)) {
      return [...obj.map(JsonEncoder.decode)];
    }
    if (obj && typeof obj === 'object') {
      for (const [key, value] of Object.entries(obj)) {
        obj[key] = JsonEncoder.decode(value);
      }
    }

    return obj;
  }
}
