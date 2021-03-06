import React from "react";
import styled from "@emotion/styled/macro";
import { Disclaimer } from "@leafygreen-ui/typography";
import { ProjectBuildVariant } from "gql/generated/types";
import { VariantTasksState } from "pages/configurePatch/ConfigurePatchCore";
import Checkbox from "@leafygreen-ui/checkbox";
import { css } from "@emotion/core";
import isEmpty from "lodash/isEmpty";
import { Button } from "components/Button";

interface Props {
  variants: ProjectBuildVariant[];
  selectedBuildVariant: string[];
  selectedVariantTasks: VariantTasksState;
  setSelectedVariantTasks: React.Dispatch<
    React.SetStateAction<VariantTasksState>
  >;
  loading: boolean;
  onClickSchedule: () => void;
}
interface TasksState {
  [task: string]: true;
}

export const ConfigureTasks: React.FC<Props> = ({
  variants,
  selectedBuildVariant,
  selectedVariantTasks,
  setSelectedVariantTasks,
  loading,
  onClickSchedule,
}) => {
  const buildVariantCount = Object.keys(selectedVariantTasks).length;
  const taskCount = Object.values(selectedVariantTasks).reduce(
    (prev, curr) => prev + Object.values(curr).length,
    0
  );

  const projectVariantTasksMap: {
    [variant: string]: string[];
  } = variants.reduce((prev, { name, tasks }) => {
    prev[name] = tasks; // eslint-disable-line no-param-reassign
    return prev;
  }, {});
  const temp = selectedBuildVariant.map((buildVariant) => ({
    buildVariant,
    tasks: projectVariantTasksMap[buildVariant || variants[0].name],
  }));
  const currentTasks = [];
  for (let i = 0; i < temp.length; i++) {
    currentTasks.push(temp[i]);
  }
  const onClickSelectAll = () => {
    const variantTasks = selectedBuildVariant.map((buildVariant) =>
      variants.find((element) => element.name === buildVariant)
    );
    const checkAllTasks = (tasks: string[]) => {
      const checkedTasks = {};
      for (let i = 0; i < tasks.length; i++) {
        checkedTasks[tasks[i]] = true;
      }
      return checkedTasks;
    };
    const selectedTasks = {};
    for (let i = 0; i < variantTasks.length; i++) {
      selectedTasks[variantTasks[i].name] = checkAllTasks(
        variantTasks[i].tasks
      );
    }
    setSelectedVariantTasks({ ...selectedVariantTasks, ...selectedTasks });
  };

  const onClickDeselectAll = (): void => {
    const tempSelectedVariantTasks = { ...selectedVariantTasks };
    for (let i = 0; i < selectedBuildVariant.length; i++) {
      delete tempSelectedVariantTasks[selectedBuildVariant[i]];
    }
    setSelectedVariantTasks({ ...tempSelectedVariantTasks });
  };
  const getTaskCheckboxChangeHandler = (task: string, variant: string) => (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const { checked } = e.target;
    const nextVariantTasks = { ...selectedVariantTasks[variant] };
    if (checked) {
      setSelectedVariantTasks({
        ...selectedVariantTasks,
        [variant]: { ...nextVariantTasks, [task]: true },
      });
    } else {
      delete nextVariantTasks[task];
      const nextSelectedVariantTasks = {
        ...selectedVariantTasks,
        [variant]: nextVariantTasks,
      };
      if (isEmpty(nextVariantTasks)) {
        delete nextSelectedVariantTasks[variant];
      }
      setSelectedVariantTasks(nextSelectedVariantTasks);
    }
  };
  return (
    <TabContentWrapper>
      <Actions>
        <Button
          dataCy="schedule-patch"
          variant="primary"
          onClick={onClickSchedule}
          disabled={isEmpty(selectedVariantTasks) || loading}
          loading={loading}
        >
          Schedule
        </Button>
        <ButtonLink
          data-cy="configurePatch-selectAll"
          onClick={onClickSelectAll}
        >
          Select All
        </ButtonLink>
        <ButtonLink
          data-cy="configurePatch-deselectAll"
          onClick={onClickDeselectAll}
        >
          Deselect All
        </ButtonLink>
      </Actions>
      <StyledDisclaimer data-cy="x-tasks-across-y-variants">
        {`${taskCount} task${
          taskCount !== 1 ? "s" : ""
        } across ${buildVariantCount} build variant${
          buildVariantCount !== 1 ? "s" : ""
        }`}
      </StyledDisclaimer>
      <Tasks data-cy="configurePatch-tasks">
        {currentTasks.map((currentTask) =>
          currentTask.tasks.map((task) => {
            let checked = false;
            for (let i = 0; i < selectedBuildVariant.length; i++) {
              if (checked === true) {
                break;
              } else {
                checked =
                  !!selectedVariantTasks[selectedBuildVariant[i]] &&
                  selectedVariantTasks[selectedBuildVariant[i]][task] === true;
              }
            }
            return (
              <Checkbox
                data-cy={`configurePatch-${task}`}
                data-checked={checked}
                key={task}
                onChange={getTaskCheckboxChangeHandler(
                  task,
                  currentTask.buildVariant
                )}
                label={task}
                checked={checked}
              />
            );
          })
        )}
      </Tasks>
    </TabContentWrapper>
  );
};

const Actions = styled.div`
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  & > :first-of-type {
    margin-right: 40px;
  }
  & > :not(:first-of-type) {
    margin-right: 24px;
  }
`;
const Tasks = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: auto auto;
  grid-template-areas: "a a";
  grid-auto-rows: auto;
  grid-column-gap: 30px;
  grid-row-gap: 12px;
`;
const ButtonLink = styled.div`
  cursor: pointer;
`;
const StyledDisclaimer = styled(Disclaimer)`
  margin-bottom: 8px;
`;
export const cardSidePadding = css`
  padding-left: 8px;
  padding-right: 8px;
`;
const TabContentWrapper = styled.div`
  ${cardSidePadding}
`;
