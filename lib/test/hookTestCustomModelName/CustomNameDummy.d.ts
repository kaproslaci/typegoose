import * as mongoose from 'mongoose';
import { Typegoose } from '../../typegoose';
export declare class WrongNameDummy extends Typegoose {
    text: string;
}
export declare const model: mongoose.Model<import("../../typegoose").InstanceType<WrongNameDummy>> & WrongNameDummy & typeof WrongNameDummy;
