import { UseGuards } from '@nestjs/common';
import { Args, ArgsType, Field, Query, Resolver } from '@nestjs/graphql';

import { ChartService } from 'src/engine/core-modules/chart/chart.service';
import { DataExplorerResult } from 'src/engine/core-modules/chart/dtos/data-explorer-result.dto';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { JwtAuthGuard } from 'src/engine/guards/jwt.auth.guard';

@ArgsType()
class ChartDataArgs {
  @Field(() => String)
  chartId: string;
}

@UseGuards(JwtAuthGuard)
@Resolver()
export class ChartResolver {
  constructor(private readonly chartService: ChartService) {}

  @Query(() => DataExplorerResult)
  async dataExplorerQueryResult(
    @AuthWorkspace() { id: workspaceId }: Workspace,
    @AuthUser() user: User,
    @Args() { chartId }: ChartDataArgs,
  ) {
    return await this.chartService.run(workspaceId, chartId);
  }
}
