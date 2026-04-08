import React, { useState, useEffect } from "react";
import { useNavigate, useLoaderData, useFetcher } from "react-router";
import {
  Card,
  Text,
  BlockStack,
  Button,
  InlineStack,
  Box,
  Divider,
  RadioButton,
  Icon,
} from "@shopify/polaris";
import { DragHandleIcon } from "@shopify/polaris-icons";
import OnboardingLayout from "../components/onboarding/OnboardingLayout.jsx";
import { requireOnboarding } from "../utils/onboarding-guard.js";
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
import prisma from "../db.server.js";
import { seedSorting } from "../services/sorting.seed.js";

export const loader = async ({ request }) => {
  const { store, session } = await requireOnboarding(request);

  await seedSorting(session.shop);

  const sorting = await prisma.sorting.findMany({
    where: { storeId: store.id },
    orderBy: { position: "asc" },
  });

  return { sorting };
};

export const action = async ({ request }) => {
  const { store, session } = await requireOnboarding(request);

  await seedSorting(session.shop);

  const body = await request.json();
  const sortOrder = Array.isArray(body?.sortOrder) ? body.sortOrder : [];
  const sortOptionsEnabled = body?.sortOptionsEnabled ?? {};
  const defaultSort =
    typeof body?.defaultSort === "string" ? body.defaultSort : sortOrder[0];

  if (sortOrder.length === 0) {
    return { error: "Invalid data" };
  }

  const orderedSorts = [
    defaultSort,
    ...sortOrder.filter((sortId) => sortId !== defaultSort),
  ];

  await prisma.$transaction(
    orderedSorts.map((sortId, index) =>
      prisma.sorting.updateMany({
        where: {
          storeId: store.id,
          name: sortId,
        },
        data: {
          position: index + 1,
          isActive: Boolean(sortOptionsEnabled[sortId]),
        },
      }),
    ),
  );

  return { success: true };
};

const SortableItem = ({
  option,
  defaultOption,
  setDefaultOption,
  toggleOption,
}) => {
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
    zIndex: isDragging ? 1 : 0,
    position: "relative",
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Box
        padding="300"
        background={
          isDragging ? "bg-surface-brand-selected" : "bg-surface-secondary"
        }
        borderRadius="200"
        shadow={isDragging ? "shadow-600" : "none"}
      >
        <InlineStack align="space-between" blockAlign="center" wrap={false}>
          <InlineStack gap="300" blockAlign="center" wrap={false}>
            {/* The drag handle specifically gets the listeners */}
            <div
              {...attributes}
              {...listeners}
              style={{ cursor: "grab", color: "#8c9196", display: "flex" }}
            >
              <Icon source={DragHandleIcon} tone="subdued" />
            </div>
            <Text variant="bodyMd" as="span">
              {option.label}
            </Text>
          </InlineStack>

          <InlineStack gap="400" blockAlign="center">
            <RadioButton
              label="Default"
              labelHidden
              checked={defaultOption === option.id}
              onChange={() => setDefaultOption(option.id)}
              disabled={!option.enabled}
              name="defaultSort"
            />
            <Button variant="plain" onClick={() => toggleOption(option.id)}>
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
  const { sorting } = useLoaderData();
  const fetcher = useFetcher();
  const [options, setOptions] = useState(() =>
    sorting.map((sort) => ({
      id: sort.name,
      label: sort.label,
      enabled: sort.isActive,
    })),
  );
  const [defaultOption, setDefaultOption] = useState(
    () => sorting.find((sort) => sort.isActive)?.name ?? sorting[0]?.name,
  );

  useEffect(() => {
    const nextOptions = sorting.map((sort) => ({
      id: sort.name,
      label: sort.label,
      enabled: sort.isActive,
    }));

    setOptions(nextOptions);
    setDefaultOption(
      sorting.find((sort) => sort.isActive)?.name ?? sorting[0]?.name,
    );
  }, [sorting]);

  // Sensors for Drag and Drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const toggleOption = (id) => {
    setOptions((prev) =>
      prev.map((o) => (o.id === id ? { ...o, enabled: !o.enabled } : o)),
    );
  };

  useEffect(() => {
    const currentDefault = options.find((option) => option.id === defaultOption);

    if (currentDefault?.enabled) {
      return;
    }

    const fallbackDefault = options.find((option) => option.enabled)?.id;

    if (fallbackDefault && fallbackDefault !== defaultOption) {
      setDefaultOption(fallbackDefault);
    }
  }, [defaultOption, options]);

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

  const handleSave = () => {
    const payload = {
      sortOrder: options.map((option) => option.id),
      sortOptionsEnabled: Object.fromEntries(
        options.map((option) => [option.id, option.enabled]),
      ),
      defaultSort: defaultOption,
    };

    fetcher.submit(
      JSON.stringify(payload),
      {
        method: "post",
        encType: "application/json",
      },
    );
  };

  useEffect(() => {
    if (fetcher.data?.success) {
      navigate("/app/onboarding/storefront");
    }
  }, [fetcher.data]);

  return (
    <OnboardingLayout currentStep={5}>
      <Card>
        <BlockStack gap="500">
          <BlockStack gap="200">
            <Text variant="headingXl" as="h2">
              Sorting Options
            </Text>
            <Text variant="bodyMd" as="p" tone="subdued">
              Configure how customers can sort search results. Drag to reorder
              priority.
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
                    defaultOption={defaultOption}
                    setDefaultOption={setDefaultOption}
                    toggleOption={toggleOption}
                  />
                ))}
              </BlockStack>
            </SortableContext>
          </DndContext>

          <Text variant="bodySm" as="p" tone="subdued">
            Select the radio button to set the default sorting option. Toggle to
            enable/disable.
          </Text>

          <Box paddingBlockStart="200">
            <Button
              variant="primary"
              onClick={handleSave}
              loading={fetcher.state === "submitting"}
            >
              Save & Continue
            </Button>
          </Box>
        </BlockStack>
      </Card>
    </OnboardingLayout>
  );
};

export default Sorting;
