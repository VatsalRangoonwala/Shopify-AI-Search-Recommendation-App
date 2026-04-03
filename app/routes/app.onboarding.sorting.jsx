import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  Card, Text, BlockStack, Button, InlineStack, Box, Divider, RadioButton, Icon,
} from "@shopify/polaris";
import { DragHandleIcon } from "@shopify/polaris-icons";
import OnboardingLayout from "../components/onboarding/OnboardingLayout";

// Dnd-kit imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const initialOptions = [
  { id: "relevance", label: "Relevance", enabled: true },
  { id: "price-asc", label: "Price: Low to High", enabled: true },
  { id: "price-desc", label: "Price: High to Low", enabled: true },
  { id: "newest", label: "Newest First", enabled: true },
  { id: "bestselling", label: "Best Selling", enabled: false },
];

// Sub-component for individual Sortable Items
const SortableItem = ({ option, defaultOption, setDefaultOption, toggleOption }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: option.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    position: 'relative',
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Box
        padding="300"
        background={isDragging ? "bg-surface-brand-selected" : "bg-surface-secondary"}
        borderRadius="200"
        shadow={isDragging ? "shadow-600" : "none"}
      >
        <InlineStack align="space-between" blockAlign="center" wrap={false}>
          <InlineStack gap="300" blockAlign="center" wrap={false}>
            {/* The drag handle specifically gets the listeners */}
            <div 
              {...attributes} 
              {...listeners} 
              style={{ cursor: "grab", color: "#8c9196", display: 'flex' }}
            >
              <Icon source={DragHandleIcon} tone="subdued" />
            </div>
            <Text variant="bodyMd" as="span">
              {option.label}
            </Text>
          </InlineStack>
          
          <InlineStack gap="400" blockAlign="center">
            {/* <RadioButton
              label="Default"
              labelHidden
              checked={defaultOption === option.id}
              onChange={() => setDefaultOption(option.id)}
              name="defaultSort"
            /> */}
            <Button
              variant="plain"
              onClick={() => toggleOption(option.id)}
            >
              {option.enabled ? "Enabled" : "Disabled"}
            </Button>
          </InlineStack>
        </InlineStack>
      </Box>
    </div>
  );
};

const Sorting = () => {
  const navigate = useNavigate();
  const [options, setOptions] = useState(initialOptions);
  const [defaultOption, setDefaultOption] = useState("relevance");

  // Sensors for Drag and Drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const toggleOption = (id) => {
    setOptions((prev) =>
      prev.map((o) => (o.id === id ? { ...o, enabled: !o.enabled } : o))
    );
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setOptions((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <OnboardingLayout currentStep={5}>
      <Card>
        <BlockStack gap="500">
          <BlockStack gap="200">
            <Text variant="headingXl" as="h2">Sorting Options</Text>
            <Text variant="bodyMd" as="p" tone="subdued">
              Configure how customers can sort search results. Drag to reorder priority.
            </Text>
          </BlockStack>

          <Divider />

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={options} strategy={verticalListSortingStrategy}>
              <BlockStack gap="200">
                {options.map((option) => (
                  <SortableItem
                    key={option.id}
                    option={option}
                    defaultOption={defaultOption}
                    setDefaultOption={setDefaultOption}
                    toggleOption={toggleOption}
                  />
                ))}
              </BlockStack>
            </SortableContext>
          </DndContext>

          <Text variant="bodySm" as="p" tone="subdued">
            Select the radio button to set the default sorting option. Toggle to enable/disable.
          </Text>

          <Box paddingBlockStart="200">
            <Button variant="primary" onClick={() => navigate("/app/onboarding/storefront")}>
              Continue
            </Button>
          </Box>
        </BlockStack>
      </Card>
    </OnboardingLayout>
  );
};

export default Sorting;