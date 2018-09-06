import * as mongoose from 'mongoose';
import { Typegoose } from '../../typegoose';
export declare class Hook extends Typegoose {
    material: string;
    shape?: string;
}
export declare const model: mongoose.Model<import("../../../../../../../../../../../../Users/ZoltanSzilvai/Source/Repos/livlia/livlia-workspace/forks/dependencies/typegoose/src/typegoose").InstanceType<Hook>> & Hook & typeof Hook;
