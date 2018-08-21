import * as mongoose from 'mongoose';
import { Typegoose } from '../../typegoose';
export declare class Car extends Typegoose {
    model: string;
    isSedan?: boolean;
    price: mongoose.Types.Decimal128;
}
export declare const model: mongoose.Model<import("../../../../../../../../Users/saferunner/workspace/web/typegoose/src/typegoose").InstanceType<Car>> & Car & typeof Car;
