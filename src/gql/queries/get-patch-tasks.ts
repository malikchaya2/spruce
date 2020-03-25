import gql from "graphql-tag";
import { SortDir } from "gql/queries/get-task-tests";

export const PATCH_TASKS_LIMIT = 10;

export const GET_PATCH_TASKS = gql`
  query PatchTasks(
    $patchId: String!
    $sortBy: TaskSortCategory
    $sortDir: SortDirection
    $page: Int
    $statuses: [String!]
  ) {
    patchTasks(
      patchId: $patchId
      limit: ${PATCH_TASKS_LIMIT}
      page: $page
      statuses: $statuses
      sortDir: $sortDir
      sortBy: $sortBy
    ) {
      id
      status
      baseStatus
      displayName
      buildVariant
    }
  }
`;

export interface TaskResult {
  id: string;
  status: string;
  baseStatus: string;
  displayName: string;
  buildVariant: string;
}

export interface PatchTasksQuery {
  patchTasks: [TaskResult];
}

type TaskSortBy = "NAME" | "STATUS" | "BASE_STATUS" | "VARIANT";

export enum PatchStatus {
  Created = "created",
  Started = "started",
  Success = "success",
  Failed = "failed"
}

export enum TaskSortDir {
  Desc = "DESC",
  Asc = "ASC"
}

export interface PatchTasksVariables {
  patchId: string;
  sortBy?: TaskSortBy;
  sortDir?: SortDir;
  page?: number;
  statuses?: [PatchStatus];
}