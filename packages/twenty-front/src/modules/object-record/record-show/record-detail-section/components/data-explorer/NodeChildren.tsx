import {
  DataExplorerQueryNode,
  DataExplorerQueryNodeAggregateFunction,
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

const StyledSelectNodeRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

interface NodeChildrenProps<T extends DataExplorerQueryNodeWithChildren> {
  node: T;
  hotkeyScope: string;
  onChange: (newNode: T) => void;
}

export const NodeChildren = <T extends DataExplorerQueryNodeWithChildren>(
  props: NodeChildrenProps<T>,
) => {
  const onChildChange = (i: number, changedNode?: DataExplorerQueryNode) => {
    const childNodesBefore = props.node.childNodes?.slice(0, i) ?? [];
    const childNodesAfter = props.node.childNodes?.slice(i + 1) ?? [];
    const nodeWithChangedChild = {
      ...props.node,
      childNodes: [...childNodesBefore, changedNode, ...childNodesAfter].filter(
        (childNode) => childNode !== undefined,
      ),
    };
    console.log(
      'onChildChange',
      'changedNode',
      changedNode,
      'nodeWithChangedChild',
      nodeWithChangedChild,
    );
    props.onChange(nodeWithChangedChild);
  };

  const onChildAdd = (
    newNode?:
      | DataExplorerQueryNodeJoin
      | DataExplorerQueryNodeSelect
      | DataExplorerQueryNodeAggregateFunction,
  ) => {
    if (!newNode) throw new Error('Cannot add undefined node');
    const nodeWithNewChild = {
      ...props.node,
      childNodes: [newNode, ...(props.node.childNodes ?? [])],
    };
    console.log('onChildAdd', nodeWithNewChild);
    props.onChange(nodeWithNewChild);
  };

  return (
    <>
      <StyledNodeContainer>
        {(props.node.childNodes ?? []).every(
          (siblingNode) => siblingNode.type !== 'aggregateFunction',
        ) && (
          <StyledSelectNodeRow>
            {props.node?.type !== 'select' && (
              <JoinOrSelectNode
                parentNode={props.node}
                hotkeyScope={props.hotkeyScope}
                onChange={onChildAdd}
              />
            )}
            <AggregateFunctionNode
              parentNode={props.node}
              hotkeyScope={props.hotkeyScope}
              onChange={onChildAdd}
            />
          </StyledSelectNodeRow>
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
                onChange={(changedNode) => {
                  onChildChange(i, changedNode);
                }}
              />
            ) : childNode.type === 'aggregateFunction' ? (
              <AggregateFunctionNode
                parentNode={props.node}
                node={childNode}
                hotkeyScope={props.hotkeyScope}
                onChange={(changedNode) => {
                  onChildChange(i, changedNode);
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
