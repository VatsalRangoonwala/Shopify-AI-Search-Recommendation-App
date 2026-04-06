import React, { useMemo } from "react";
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

// DND KIT
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
  { id: "price_asc", label: "Price: Low → High" },
  { id: "price_desc", label: "Price: High → Low" },
  { id: "newest", label: "Newest" },
  { id: "popularity", label: "Popularity" },
];


// 🔹 Sortable Item
function SortableItem({ option, enabled, defaultSort, onToggle, onDefault }) {
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
        background={isDragging ? "bg-surface-brand-selected" : "bg-surface-secondary"}
        borderRadius="200"
      >
        <InlineStack align="space-between" blockAlign="center">
          <InlineStack gap="300" blockAlign="center">
            {/* Drag Handle */}
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
            />

            <Button variant="plain" onClick={() => onToggle(option.id)}>
              {enabled ? "Enabled" : "Disabled"}
            </Button>
          </InlineStack>
        </InlineStack>
      </Box>
    </div>
  );
}


// 🔹 Main Component
export default function SortingSettings({ state, onChange }) {

  // Convert state → ordered list
  const options = useMemo(() => {
    return sortOptionsList.map((opt) => ({
      ...opt,
      enabled: state.sortOptionsEnabled[opt.id],
    }));
  }, [state.sortOptionsEnabled]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 🔹 Toggle enable/disable
  const toggleOption = (id) => {
    onChange("sortOptionsEnabled", {
      ...state.sortOptionsEnabled,
      [id]: !state.sortOptionsEnabled[id],
    });
  };

  // 🔹 Change default sort
  const setDefault = (id) => {
    onChange("defaultSort", id);
  };

  // 🔹 Handle drag
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = options.findIndex((i) => i.id === active.id);
    const newIndex = options.findIndex((i) => i.id === over.id);

    const newOrder = arrayMove(options, oldIndex, newIndex);

    // 🔥 IMPORTANT: Save order if needed (optional backend)
    // For now just re-map enabled state
    const updated = {};
    newOrder.forEach((item) => {
      updated[item.id] = state.sortOptionsEnabled[item.id];
    });

    onChange("sortOptionsEnabled", updated);
  };

  return (
    <Card>
      <BlockStack gap="500">
        
        {/* Header */}
        <BlockStack gap="200">
          <Text variant="headingMd">Sorting Settings</Text>
          <Text tone="subdued">
            Drag to reorder sorting priority. Enable or disable options and choose default.
          </Text>
        </BlockStack>

        <Divider />

        {/* Drag List */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={options.map((o) => o.id)}
            strategy={verticalListSortingStrategy}
          >
            <BlockStack gap="200">
              {options.map((option) => (
                <SortableItem
                  key={option.id}
                  option={option}
                  enabled={option.enabled}
                  defaultSort={state.defaultSort}
                  onToggle={toggleOption}
                  onDefault={setDefault}
                />
              ))}
            </BlockStack>
          </SortableContext>
        </DndContext>

        <Text tone="subdued" variant="bodySm">
          Select default sorting and reorder how options appear to customers.
        </Text>

      </BlockStack>
    </Card>
  );
}