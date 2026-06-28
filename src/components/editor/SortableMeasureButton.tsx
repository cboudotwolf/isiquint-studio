"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableMeasureButtonProps {
  index: number;
  isActive: boolean;
  onClick: () => void;
}

export function SortableMeasureButton({ index, isActive, onClick }: SortableMeasureButtonProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `measure-${index}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 0,
  };

  return (
    <button
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      className={`w-5 h-5 text-xs rounded transition-colors cursor-grab active:cursor-grabbing ${
        isActive
          ? "bg-isiq-accent text-white"
          : "bg-isiq-surface border border-isiq-border hover:border-isiq-accent text-isiq-text"
      }`}
      {...attributes}
      {...listeners}
    >
      {index + 1}
    </button>
  );
}
