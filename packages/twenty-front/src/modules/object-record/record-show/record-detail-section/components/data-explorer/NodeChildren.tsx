import {
  DataExplorerQueryNode,
  DataExplorerQueryNodeJoin,
  DataExplorerQueryNodeSelect,
  DataExplorerQueryNodeSource,
} from '@/object-record/record-field/types/guards/isFieldDataExplorerQueryValue';
import { AddNode } from '@/object-record/record-show/record-detail-section/components/data-explorer/AddNode';
import { JoinNode } from '@/object-record/record-show/record-detail-section/components/data-explorer/JoinNode';
import { SelectNode } from '@/object-record/record-show/record-detail-section/components/data-explorer/SelectNode';
import styled from '@emotion/styled';

const StyledNodeContainer = styled.div`
  display: flex;
  padding-left: ${({ theme }) => theme.spacing(4)};
`;

interface NodeChildrenProps {
  node:
    | DataExplorerQueryNodeSource
    | DataExplorerQueryNodeJoin
    | DataExplorerQueryNodeSelect;
  hotkeyScope: string;
  onChange: (newNode: DataExplorerQueryNode) => void;
}

export const NodeChildren = (props: NodeChildrenProps) => {
  return (
    <>
      <StyledNodeContainer>
        <AddNode
          node={props.node}
          onAdd={(newNode) => {
            props.onChange({
              ...props.node,
              childNodes: [newNode, ...(props.node.childNodes ?? [])],
            });
          }}
        />
      </StyledNodeContainer>
      {props.node.childNodes?.map((node) => {
        return (
          <StyledNodeContainer>
            {node.type === 'join' ? (
              <JoinNode
                parentNode={props.node}
                node={node}
                hotkeyScope={props.hotkeyScope}
                onChange={() => {}}
              />
            ) : node.type === 'select' ? (
              <SelectNode
                parentNode={props.node}
                node={node}
                hotkeyScope={props.hotkeyScope}
                onChange={() => {}}
              />
            ) : node.type === 'aggregateFunction' ? (
              <AggregateFunctionNode
                parentNode={props.node}
                node={node}
                hotkeyScope={props.hotkeyScope}
                onChange={() => {}}
              />
            ) : null}
          </StyledNodeContainer>
        );
      })}
    </>
  );
};
