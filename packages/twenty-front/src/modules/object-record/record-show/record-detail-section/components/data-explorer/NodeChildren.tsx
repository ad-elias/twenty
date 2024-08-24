import {
  DataExplorerQueryNode,
  DataExplorerQueryNodeWithChildren,
} from '@/object-record/record-field/types/guards/isFieldDataExplorerQueryValue';
import { AddNode } from '@/object-record/record-show/record-detail-section/components/data-explorer/AddNode';
import { AggregateFunctionNode } from '@/object-record/record-show/record-detail-section/components/data-explorer/AggregateFunctionNode';
import { JoinNode } from '@/object-record/record-show/record-detail-section/components/data-explorer/JoinNode';
import { SelectNode } from '@/object-record/record-show/record-detail-section/components/data-explorer/SelectNode';
import styled from '@emotion/styled';

const StyledNodeContainer = styled.div`
  display: flex;
  padding-left: ${({ theme }) => theme.spacing(4)};
`;

interface NodeChildrenProps<T extends DataExplorerQueryNodeWithChildren> {
  node: T;
  hotkeyScope: string;
  onChange: (newNode: T) => void;
}

export const NodeChildren = <T extends DataExplorerQueryNodeWithChildren>(
  props: NodeChildrenProps<T>,
) => {
  const onChildChange = (newNode: DataExplorerQueryNode, i: number) => {
    const childNodesBefore = props.node.childNodes?.slice(0, i) ?? [];
    const childNodesAfter = props.node.childNodes?.slice(i + 1) ?? [];
    props.onChange({
      ...props.node,
      childNodes: [...childNodesBefore, newNode, ...childNodesAfter],
    });
  };

  return (
    <>
      <StyledNodeContainer>
        <AddNode
          parentNode={props.node}
          onAdd={(newParentNode) => {
            props.onChange({
              ...props.node,
              childNodes: [newParentNode, ...(props.node.childNodes ?? [])],
            });
          }}
        />
      </StyledNodeContainer>
      {props.node.childNodes?.map((node, i) => {
        return (
          <StyledNodeContainer>
            {node.type === 'join' ? (
              <JoinNode
                parentNode={props.node}
                node={node}
                hotkeyScope={props.hotkeyScope}
                onChange={() => {
                  onChildChange(node, i);
                }}
              />
            ) : node.type === 'select' ? (
              <SelectNode
                parentNode={props.node}
                node={node}
                hotkeyScope={props.hotkeyScope}
                onChange={() => {
                  onChildChange(node, i);
                }}
              />
            ) : node.type === 'aggregateFunction' ? (
              <AggregateFunctionNode
                parentNode={props.node}
                node={node}
                hotkeyScope={props.hotkeyScope}
                onChange={() => {
                  onChildChange(node, i);
                }}
              />
            ) : null}
          </StyledNodeContainer>
        );
      })}
    </>
  );
};
