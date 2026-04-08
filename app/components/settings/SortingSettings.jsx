import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Text,
  BlockStack,
  InlineStack,
  Button,
  Box,
  Divider,
  RadioButton,
  Icon,
} from "@shopify/polaris";
import { DragHandleIcon } from "@shopify/polaris-icons";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const sortOptionsList = [
  { id: "id_asc", label: "Featured" },
  { id: "price_asc", label: "Price: Low to High" },
  { id: "price_desc", label: "Price: High to Low" },
  { id: "created_at_desc", label: "Newest" },
  { id: "title_asc", label: "A-Z" },
  { id: "title_desc", label: "Z-A" },
];

const legacySortIdMap = {
  newest: "created_at_desc",
  popularity: "id_asc",
};

const defaultSortingState = {
  sortOptionsEnabled: sortOptionsList.reduce((acc, option) => {
    acc[option.id] = true;
    return acc;
  }, {}),
  sortOrder: sortOptionsList.map((option) => option.id),
  defaultSort: "id_asc",
};

const sortOptionsById = sortOptionsList.reduce((lookup, option) => {
  lookup[option.id] = option;
  return lookup;
}, {});

function normalizeSortId(id) {
  return legacySortIdMap[id] ?? id;
}

function buildSortOrder(ids = []) {
  const seen = new Set();

  return [...ids, ...defaultSortingState.sortOrder]
    .map(normalizeSortId)
    .filter((id) => {
      if (!sortOptionsById[id] || seen.has(id)) {
        return false;
      }

      seen.add(id);
      return true;
    });
}

function buildStateFromSortingRows(rows) {
  const normalizedRows = Array.isArray(rows) ? rows : [];
  const sortOptionsEnabled = { ...defaultSortingState.sortOptionsEnabled };

  normalizedRows.forEach((row) => {
    const sortId = normalizeSortId(row.name);

    if (sortOptionsById[sortId]) {
      sortOptionsEnabled[sortId] = Boolean(row.isActive);
    }
  });

  const sortOrder = buildSortOrder(normalizedRows.map((row) => row.name));
  const defaultSort =
    sortOrder.find((id) => sortOptionsEnabled[id]) ?? defaultSortingState.defaultSort;

  return {
    sortOptionsEnabled,
    sortOrder,
    defaultSort,
  };
}

function normalizeSortingState(state) {
  if (Array.isArray(state)) {
    return buildStateFromSortingRows(state);
  }

  const nextState = state ?? {};
  const incomingEnabled = Object.entries(nextState.sortOptionsEnabled ?? {}).reduce(
    (acc, [id, enabled]) => {
      const normalizedId = normalizeSortId(id);

      if (sortOptionsById[normalizedId]) {
        acc[normalizedId] = Boolean(enabled);
      }

      return acc;
    },
    {},
  );

  const sortOptionsEnabled = {
    ...defaultSortingState.sortOptionsEnabled,
    ...incomingEnabled,
  };

  const sortOrder = buildSortOrder(nextState.sortOrder ?? Object.keys(incomingEnabled));
  const requestedDefaultSort = normalizeSortId(nextState.defaultSort);
  const defaultSort = sortOptionsEnabled[requestedDefaultSort]
    ? requestedDefaultSort
    : sortOrder.find((id) => sortOptionsEnabled[id]) ?? defaultSortingState.defaultSort;

  return {
    sortOptionsEnabled,
    sortOrder,
    defaultSort,
  };
}

function SortableItem({ option, defaultSort, onToggle, onDefault }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: option.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Box
        padding="300"
        background={
          isDragging ? "bg-surface-brand-selected" : "bg-surface-secondary"
        }
        borderRadius="200"
      >
        <InlineStack align="space-between" blockAlign="center">
          <InlineStack gap="300" blockAlign="center">
            <div {...attributes} {...listeners} style={{ cursor: "grab" }}>
              <Icon source={DragHandleIcon} tone="subdued" />
            </div>

            <Text>{option.label}</Text>
          </InlineStack>

          <InlineStack gap="400" blockAlign="center">
            <RadioButton
              label="Default"
              labelHidden
              checked={defaultSort === option.id}
              onChange={() => onDefault(option.id)}
              disabled={!option.enabled}
              name="defaultSort"
            />

            <Button variant="plain" onClick={() => onToggle(option.id)}>
              {option.enabled ? "Enabled" : "Disabled"}
            </Button>
          </InlineStack>
        </InlineStack>
      </Box>
    </div>
  );
}

export default function SortingSettings({
  initialState,
  onSave,
  loading = false,
}) {
  const [localState, setLocalState] = useState(() =>
    normalizeSortingState(initialState),
  );
  const [initialSnapshot, setInitialSnapshot] = useState(() =>
    JSON.stringify(normalizeSortingState(initialState)),
  );

  useEffect(() => {
    const normalized = normalizeSortingState(initialState);
    setLocalState(normalized);
    setInitialSnapshot(JSON.stringify(normalized));
  }, [initialState]);

  const isDirty = useMemo(() => {
    return JSON.stringify(localState) !== initialSnapshot;
  }, [initialSnapshot, localState]);

  const options = useMemo(() => {
    return localState.sortOrder.map((id) => ({
      ...sortOptionsById[id],
      enabled: Boolean(localState.sortOptionsEnabled[id]),
    }));
  }, [localState]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const updateState = (updates) => {
    setLocalState((previousState) =>
      normalizeSortingState({ ...previousState, ...updates }),
    );
  };

  const toggleOption = (id) => {
    const sortOptionsEnabled = {
      ...localState.sortOptionsEnabled,
      [id]: !localState.sortOptionsEnabled[id],
    };

    const defaultSort = sortOptionsEnabled[localState.defaultSort]
      ? localState.defaultSort
      : localState.sortOrder.find((optionId) => sortOptionsEnabled[optionId]) ??
        defaultSortingState.defaultSort;

    updateState({ sortOptionsEnabled, defaultSort });
  };

  const setDefault = (id) => {
    if (!localState.sortOptionsEnabled[id]) {
      return;
    }

    updateState({ defaultSort: id });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = options.findIndex((option) => option.id === active.id);
    const newIndex = options.findIndex((option) => option.id === over.id);

    updateState({
      sortOrder: arrayMove(localState.sortOrder, oldIndex, newIndex),
    });
  };

  const handleSave = () => {
    if (typeof onSave !== "function") {
      return;
    }

    onSave(localState);
  };

  return (
    <Card>
      <BlockStack gap="500">
        <BlockStack gap="200">
          <Text variant="headingMd">Sorting Settings</Text>
          <Text tone="subdued">
            Drag to reorder sorting priority. Enable or disable options and
            choose default.
          </Text>
        </BlockStack>

        <Divider />

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={options.map((option) => option.id)}
            strategy={verticalListSortingStrategy}
          >
            <BlockStack gap="200">
              {options.map((option) => (
                <SortableItem
                  key={option.id}
                  option={option}
                  defaultSort={localState.defaultSort}
                  onToggle={toggleOption}
                  onDefault={setDefault}
                />
              ))}
            </BlockStack>
          </SortableContext>
        </DndContext>

        {isDirty && (
          <Box paddingBlockStart="200">
            <InlineStack align="space-between">
              <Text tone="subdued">Unsaved changes</Text>
              <Button variant="primary" onClick={handleSave} loading={loading}>
                Save
              </Button>
            </InlineStack>
          </Box>
        )}

        <Text tone="subdued" variant="bodySm">
          Select default sorting and reorder how options appear to customers.
        </Text>
      </BlockStack>
    </Card>
  );
}
