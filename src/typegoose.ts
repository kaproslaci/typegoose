import 'reflect-metadata';
import * as mongoose from 'mongoose';
import * as _ from 'lodash';

(mongoose as any).Promise = global.Promise;

import { schema, models, methods, virtuals, hooks, plugins, constructors } from './data';

export * from './method';
export * from './prop';
export * from './hooks';
export * from './plugin';
export { getClassForDocument } from './utils';

export type InstanceType<T> = T & mongoose.Document;
export type ModelType<T> = mongoose.Model<InstanceType<T>> & T;

export interface GetModelForClassOptions {
  existingMongoose?: mongoose.Mongoose;
  schemaOptions?: mongoose.SchemaOptions;
  existingConnection?: mongoose.Connection;
}

export class Typegoose {
  static MODEL_NAME?: string;
  getModelForClass<T>(
    t: T, {
      existingMongoose,
      schemaOptions,
      existingConnection,
    }: GetModelForClassOptions = {},
  ) {
    const modelName = (this.constructor as any).MODEL_NAME || this.constructor.name;
    if (!models[modelName]) {
      this.setModelForClass(t, {
        existingMongoose,
        schemaOptions,
        existingConnection,
      });
    }

    return models[modelName] as ModelType<this> & T;
  }

  setModelForClass<T>(
    t: T, {
      existingMongoose,
      schemaOptions,
      existingConnection,
    }: GetModelForClassOptions = {}) {
    const modelName = (this.constructor as any).MODEL_NAME || this.constructor.name;

    // get schema of current model
    let sch = this.buildSchema(modelName, schemaOptions);
    // get parents class name
    let parentCtor = Object.getPrototypeOf(this.constructor.prototype).constructor;
    // iterate trough all parents
    while (parentCtor && parentCtor.name !== 'Typegoose' && parentCtor.name !== 'Object') {
      // extend schema
      debugger;
      sch = this.buildSchema(parentCtor.name, schemaOptions, sch);
      // next parent
      parentCtor = Object.getPrototypeOf(parentCtor.prototype).constructor;
    }
    debugger;
    let model = mongoose.model.bind(mongoose);
    if (existingConnection) {
      model = existingConnection.model.bind(existingConnection);
    } else if (existingMongoose) {
      model = existingMongoose.model.bind(existingMongoose);
    }

    models[modelName] = model(modelName, sch);
    constructors[modelName] = this.constructor;

    return models[modelName] as ModelType<this> & T;
  }

  private buildSchema(name: string, schemaOptions, sch?: mongoose.Schema) {
    const Schema = mongoose.Schema;

    if (!sch) {
      sch = schemaOptions ?
        new Schema(schema[name], schemaOptions) :
        new Schema(schema[name]);
    } else {
      sch.add(schema[name]);
    }

    const staticMethods = methods.staticMethods[name];
    if (staticMethods) {
      sch.statics = Object.assign(staticMethods, sch.statics || {});
    } else {
      sch.statics = sch.statics || {};
    }

    const instanceMethods = methods.instanceMethods[name];
    if (instanceMethods) {
      sch.methods = Object.assign(instanceMethods, sch.methods || {});
    } else {
      sch.methods = sch.methods || {};
    }

    if (hooks[name]) {
      const preHooks = hooks[name].pre;
      preHooks.forEach((preHookArgs) => {
        (sch as any).pre(...preHookArgs);
      });
      const postHooks = hooks[name].post;
      postHooks.forEach((postHookArgs) => {
        (sch as any).post(...postHookArgs);
      });
    }

    if (plugins[name]) {
      _.forEach(plugins[name], (plugin) => {
        sch.plugin(plugin.mongoosePlugin, plugin.options);
      });
    }

    const getterSetters = virtuals[name];
    _.forEach(getterSetters, (value, key) => {
      if (value.get) {
        sch.virtual(key).get(value.get);
      }
      if (value.set) {
        sch.virtual(key).set(value.set);
      }
    });

    return sch;
  }
}
