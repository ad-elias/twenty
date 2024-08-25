import {
  DataExplorerQueryNode,
  DataExplorerQueryNodeJoin,
  DataExplorerQueryNodeSelect,
  DataExplorerQueryNodeWithChildren,
} from '@/object-record/record-field/types/guards/isFieldDataExplorerQueryValue';
import { AggregateFunctionNode } from '@/object-record/record-show/record-detail-section/components/data-explorer/AggregateFunctionNode';
import { JoinOrSelectNode } from '@/object-record/record-show/record-detail-section/components/data-explorer/JoinOrSelectNode';
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

  const onChildAdd = (
    newNode?: DataExplorerQueryNodeJoin | DataExplorerQueryNodeSelect,
  ) => {
    if (!newNode) throw new Error('Cannot add undefined node');

    props.onChange({
      ...props.node,
      childNodes: [newNode, ...(props.node.childNodes ?? [])],
    });
  };

  return (
    <>
      <StyledNodeContainer>
        {props.node?.type === 'select' ? null : (
          <JoinOrSelectNode
            parentNode={props.node}
            hotkeyScope={props.hotkeyScope}
            onChange={onChildAdd}
          />
        )}
      </StyledNodeContainer>
      {props.node.childNodes?.map((childNode, i) => {
        return (
          <StyledNodeContainer>
            {(props.node.type === 'source' || props.node.type === 'join') &&
            (childNode.type === 'join' || childNode.type === 'select') ? (
              <JoinOrSelectNode
                parentNode={props.node}
                node={childNode}
                hotkeyScope={props.hotkeyScope}
                onChange={() => {
                  onChildChange(childNode, i);
                }}
              />
            ) : childNode.type === 'aggregateFunction' ? (
              <AggregateFunctionNode
                parentNode={props.node}
                node={childNode}
                hotkeyScope={props.hotkeyScope}
                onChange={() => {
                  onChildChange(childNode, i);
                }}
              />
            ) : (
              'Unsupported child node'
            )}
          </StyledNodeContainer>
        );
      })}
    </>
  );
};
