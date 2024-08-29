import { Field, ObjectType } from '@nestjs/graphql';

import { IsOptional } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

@ObjectType('DataExplorerResult')
export class DataExplorerResult {
  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  rows?: { [T in string]: any }[];

  @Field(() => String, { nullable: true })
  @IsOptional()
  sqlQuery?: string;
}
