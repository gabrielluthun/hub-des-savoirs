import { DeckListItem } from '@/features/anki/components/decks/DeckListItem';
import type { DeckTreeNode } from '@/features/anki/lib/decks';

interface DeckTreeRowsProps {
  nodes: DeckTreeNode[];
  depth: number;
  deckCounts: Record<string, number>;
  selectedDeck: string | null;
  expanded: Record<string, boolean>;
  onToggleExpand: (path: string) => void;
  onSelectDeck: (deck: string | null) => void;
  onDeleteDeck: (name: string) => void;
}

export function DeckTreeRows({
  nodes,
  depth,
  deckCounts,
  selectedDeck,
  expanded,
  onToggleExpand,
  onSelectDeck,
  onDeleteDeck,
}: DeckTreeRowsProps) {
  return (
    <>
      {nodes.map((node) => {
        const hasChildren = node.children.length > 0;
        const isExpanded = expanded[node.path] ?? true;
        return (
          <div key={node.path}>
            <DeckListItem
              name={node.label}
              count={deckCounts[node.path] ?? 0}
              active={selectedDeck === node.path}
              depth={depth}
              expandable={hasChildren}
              expanded={isExpanded}
              onToggleExpand={() => onToggleExpand(node.path)}
              onSelect={() => onSelectDeck(node.path)}
              onDelete={() => onDeleteDeck(node.path)}
            />
            {hasChildren && isExpanded ? (
              <DeckTreeRows
                nodes={node.children}
                depth={depth + 1}
                deckCounts={deckCounts}
                selectedDeck={selectedDeck}
                expanded={expanded}
                onToggleExpand={onToggleExpand}
                onSelectDeck={onSelectDeck}
                onDeleteDeck={onDeleteDeck}
              />
            ) : null}
          </div>
        );
      })}
    </>
  );
}
