import { getModelForClass, modelOptions, prop, Severity } from '@typegoose/typegoose';
import { Type, plainToInstance } from 'class-transformer';
import { AppConfig, ConnectionConfig, GraphType, InputConfig, NodeConfig, NodeType, OutputBranchConfig, OutputConfig, TypeDefinition, TypeProperty, VariableConfig } from '@dataflow-ide/dataflow-core';
import type { ConnectorConfig, Coordinates, ParameterType } from '@dataflow-ide/dataflow-core';
import mongoose from 'mongoose';
import { dehydrate } from '../utils/db-utils';

type NodeTypeValue = (typeof NodeType)[keyof typeof NodeType];

class TypePropertyClass implements TypeProperty {
    @prop({ required: true })
    public id!: string;

    @prop({ required: true })
    public name!: string;

    @prop({ required: true })
    public type!: string;

    @prop({ required: true })
    public isCollection!: boolean;
}

class TypeDefinitionClass implements TypeDefinition {
    @prop({ required: true })
    public id!: string;

    @prop({ required: true })
    public name!: string;

    @Type(() => TypePropertyClass)
    @prop({ required: true, type: () => [TypePropertyClass] })
    public properties!: TypePropertyClass[]
}

class GraphTypeClass extends TypeDefinitionClass implements GraphType {
}

class VariableConfigClass implements VariableConfig {
    @prop({ required: true })
    public id!: string;

    @prop({ required: true })
    public name!: string;

    @prop({ required: true })
    public type!: string;

    @prop({ required: true })
    public isCollection!: boolean;
}

@modelOptions({
    schemaOptions: { collection: 'appconfigs', timestamps: true },
    options: { allowMixed: Severity.ALLOW }
})
class AppConfigClass implements AppConfig {
    @prop({ required: true, index: true })
    public id!: string;

    @prop({ required: true })
    public name!: string;

    @Type(() => NodeConfigClass)
    @prop({ required: true, type: () => [NodeConfigClass] })
    public nodes!: NodeConfigClass[];

    @Type(() => ConnectionConfigClass)
    @prop({ type: () => [ConnectionConfigClass] })
    public connections?: ConnectionConfigClass[];

    @Type(() => VariableConfigClass)
    @prop({ required: true, type: () => [VariableConfigClass] })
    public variables!: VariableConfigClass[];

    @Type(() => GraphTypeClass)
    @prop({ type: () => [GraphTypeClass] })
    public types?: GraphTypeClass[];

    @prop()
    public zoom?: number;

    @prop({ required: true, index: true })
    public userId!: string;
}

class CoordinatesClass implements Coordinates {
    @prop({ required: true })
    public x!: number;

    @prop({ required: true })
    public y!: number;
}

class NodeConfigClass implements NodeConfig {
    @prop({ required: true })
    public id!: string;

    @prop({ required: true })
    public name!: string;

    @prop({ required: true })
    public executable!: boolean;

    @prop()
    public description?: string;

    @prop({ required: true, enum: NodeType, type: String })
    public type!: NodeTypeValue;

    @Type(() => InputConfigClass)
    @prop({ required: true, type: () => [InputConfigClass] })
    public inputs?: InputConfigClass[];

    @Type(() => OutputConfigClass)
    @prop({ required: true, type: () => [OutputConfigClass] })
    public outputs?: OutputConfigClass[];

    @Type(() => OutputBranchConfigClass)
    @prop({ required: true, type: () => [OutputBranchConfigClass] })
    public branches?: OutputBranchConfigClass[];

    @Type(() => CoordinatesClass)
    @prop({ required: true, type: () => CoordinatesClass })
    public position!: CoordinatesClass;

    // JSON.stringify() of a Map<string, any>
    @prop()
    public context?: string;
}

class ConnectorConfigClass implements ConnectorConfig {
    @prop({ required: true })
    public id!: string;

    @prop({ required: true })
    public pin!: string;
}

class ConnectionConfigClass implements ConnectionConfig {
    @Type(() => ConnectorConfigClass)
    @prop({ required: true, type: () => ConnectorConfigClass })
    public from!: ConnectorConfigClass;

    @Type(() => ConnectorConfigClass)
    @prop({ required: true, type: () => ConnectorConfigClass })
    public to!: ConnectorConfigClass;
}

class InputConfigClass implements InputConfig {
    @prop({ required: true })
    public id!: string;

    @prop({ required: true })
    public name!: string;

    @prop({ required: true, type: String })
    public type!: ParameterType;

    @prop({ required: true })
    public required!: boolean;

    @prop()
    public defaultValue?: unknown;

    @prop()
    public editable?: boolean;

    @prop()
    public isCollection?: boolean;

    @prop()
    public typeEditable?: boolean;

    @prop()
    public collectionEditable?: boolean;

    @prop()
    public options?: Record<string, string | number | boolean>;
}

class OutputConfigClass implements OutputConfig {
    @prop({ required: true })
    public id!: string;

    @prop({ required: true })
    public name!: string;

    @prop({ required: true, type: String })
    public type!: ParameterType;

    @prop()
    public isCollection?: boolean;
}

class OutputBranchConfigClass implements OutputBranchConfig {
    @prop({ required: true })
    public id!: string;

    @prop({ required: true })
    public name!: string;
}

function hydrateAppConfig(config: AppConfig): AppConfigClass {
    return plainToInstance(AppConfigClass, config, {
        enableImplicitConversion: true
    });
}

function dehydrateAppConfig(instance: AppConfigClass): AppConfig {
    return dehydrate(instance);
}

export { AppConfigClass, hydrateAppConfig, dehydrateAppConfig }

export const AppConfigModel =
  mongoose.models.AppConfigClass ||
  getModelForClass(AppConfigClass);
