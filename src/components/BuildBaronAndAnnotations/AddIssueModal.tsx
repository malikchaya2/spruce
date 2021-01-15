import React, { useReducer } from "react";
import { useMutation } from "@apollo/client";
import styled from "@emotion/styled";
import { Body } from "@leafygreen-ui/typography";
import { Input, Tooltip } from "antd";
import { ConditionalWrapper } from "components/ConditionalWrapper";
import { Modal } from "components/Modal";
import { WideButton } from "components/Spawn";
import { useBannerDispatchContext } from "context/banners";
import {
  AddAnnotationIssueMutation,
  AddAnnotationIssueMutationVariables,
} from "gql/generated/types";
import { ADD_ANNOTATION } from "gql/mutations/add-annotation";

const { TextArea } = Input;
interface Props {
  visible: boolean;
  dataCy: string;
  closeModal: () => void;
  taskId: string;
  execution: number;
  isIssue: boolean;
}

export const AddIssueModal: React.FC<Props> = ({
  visible,
  dataCy,
  closeModal,
  taskId,
  execution,
  isIssue,
}) => {
  const dispatchBanner = useBannerDispatchContext();
  const title = isIssue ? "Add Issue" : "Add Suspected Issue";
  const issueString = isIssue ? "issue" : "suspected issue";

  const init = () => ({
    url: "",
    issueKey: "",
  });
  interface addIssueState {
    url: string;
    issueKey: string;
  }

  type Action =
    | { type: "reset" }
    | { type: "saveUrl"; url: string }
    | { type: "saveKey"; issueKey: string };

  const reducer = (state: addIssueState, action: Action) => {
    switch (action.type) {
      case "reset":
        return init();
      case "saveUrl":
        return {
          ...state,
          url: action.url,
        };
      case "saveKey":
        return {
          ...state,
          issueKey: action.issueKey,
        };
      default:
        throw new Error();
    }
  };

  const [addIssueModalState, dispatch] = useReducer(reducer, init());

  const [addAnnotation, { loading: loadingAddAnnotation }] = useMutation<
    AddAnnotationIssueMutation,
    AddAnnotationIssueMutationVariables
  >(ADD_ANNOTATION, {
    onCompleted: () => {
      dispatchBanner.successBanner(`Successfully added ${issueString}`);
    },
    onError(error) {
      dispatchBanner.errorBanner(
        `There was an error adding the issue: ${error.message}`
      );
    },
    refetchQueries: ["GetTask"],
  });

  const onClickAdd = () => {
    // todo: add analytics
    const apiIssue = {
      url: addIssueModalState.url,
      issueKey: addIssueModalState.issueKey,
    };
    addAnnotation({ variables: { taskId, execution, apiIssue, isIssue } });
    dispatch({
      type: "reset",
    });
    closeModal();
  };

  const onClickCancel = () => {
    dispatch({
      type: "reset",
    });
    closeModal();
  };

  return (
    <Modal
      data-cy={dataCy}
      visible={visible}
      onCancel={onClickCancel}
      title={title}
      footer={[
        <>
          <WideButton dataCy="modal-cancel-button" onClick={onClickCancel}>
            Cancel
          </WideButton>{" "}
          <ConditionalWrapperWithMargin
            condition={
              addIssueModalState.url === "" ||
              addIssueModalState.issueKey === ""
            }
            wrapper={(children) => (
              <Tooltip title="Url and display text are required">
                <span>{children}</span>
              </Tooltip>
            )}
          >
            <WideButton
              data-cy="add-issue-save-button"
              variant="primary"
              disabled={
                addIssueModalState.url === "" ||
                addIssueModalState.issueKey === ""
              }
              loading={loadingAddAnnotation}
              onClick={onClickAdd}
            >
              Save
            </WideButton>
          </ConditionalWrapperWithMargin>
        </>,
      ]}
    >
      <Body weight="medium">URL</Body>
      <StyledTextArea
        data-cy="url-text-area"
        autoSize={{ minRows: 1, maxRows: 2 }}
        value={addIssueModalState.url}
        onChange={(e) =>
          dispatch({
            type: "saveUrl",
            url: e.target.value,
          })
        }
      />
      <Body weight="medium">Display Text</Body>
      <StyledTextArea
        data-cy="issue-key-text-area"
        autoSize={{ minRows: 1, maxRows: 2 }}
        value={addIssueModalState.issueKey}
        onChange={(e) =>
          dispatch({
            type: "saveKey",
            issueKey: e.target.value,
          })
        }
      />
    </Modal>
  );
};

const StyledTextArea = styled(TextArea)`
  margin-bottom: 40px;
  resize: none;
`;

const ConditionalWrapperWithMargin = styled(ConditionalWrapper)`
  margin-left: 16px;
`;