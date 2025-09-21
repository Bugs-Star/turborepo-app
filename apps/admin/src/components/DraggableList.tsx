"use client";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
  type DroppableProvided,
  type DraggableProvided,
} from "@hello-pangea/dnd";
import { Calendar } from "lucide-react";
import React from "react";

interface BaseItem {
  id: string;
  name: string;
  image: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  startAt?: string;
  finishAt?: string;
}

type MoveDiff = { id: string; from: number; to: number };

interface DraggableListProps<T extends BaseItem> {
  items: T[];
  onReorder: (newItems: T[]) => void;
  onReorderCommit?: (args: {
    oldItems: T[];
    newItems: T[];
    moves: MoveDiff[];
  }) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  renderExtra?: (item: T) => React.ReactNode;
}

const formatDate = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const DraggableList = <T extends BaseItem>({
  items,
  onReorder,
  onReorderCommit,
  onEdit,
  onDelete,
  renderExtra,
}: DraggableListProps<T>) => {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const oldItems = items;
    const reordered = Array.from(items);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);

    onReorder(reordered);

    if (onReorderCommit) {
      const oldIndex = new Map(oldItems.map((it, i) => [it.id, i]));
      const moves: MoveDiff[] = reordered
        .map((it, newIdx) => ({
          id: it.id,
          from: oldIndex.get(it.id)!,
          to: newIdx,
        }))
        .filter((m) => m.from !== m.to);

      if (moves.length)
        onReorderCommit({ oldItems, newItems: reordered, moves });
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="list">
        {(provided: DroppableProvided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="space-y-3"
          >
            {items.map((item, index) => {
              const start = (item.startDate ?? item.startAt) || "";
              const end = (item.endDate ?? item.finishAt) || "";
              const hasRange = Boolean(start && end);

              return (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided: DraggableProvided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="flex items-center justify-between border border-border rounded-lg p-3 bg-card text-card-foreground shadow-sm"
                    >
                      <div
                        {...provided.dragHandleProps}
                        className="cursor-grab text-muted-foreground pr-2"
                        aria-label="드래그 핸들"
                      >
                        ⋮⋮
                      </div>

                      <div className="flex items-center gap-3 flex-1">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-14 h-14 rounded ml-3 object-cover"
                        />
                        <div className="flex flex-col">
                          <span className="font-medium">{item.name}</span>
                          {renderExtra && (
                            <div className="text-sm text-muted-foreground">
                              {renderExtra(item)}
                            </div>
                          )}
                        </div>
                      </div>

                      {hasRange && (
                        <div className="flex items-center text-muted-foreground ml-4 mr-4 text-xs">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>
                            {formatDate(start)} ~ {formatDate(end)}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        {onEdit && (
                          <button
                            type="button"
                            onClick={() => onEdit(item.id)}
                            className="text-sm px-3 py-1 rounded-xl cursor-pointer border border-border bg-edit text-white hover:opacity-90 transition"
                          >
                            수정
                          </button>
                        )}
                        {onDelete && (
                          <button
                            type="button"
                            onClick={() => onDelete(item.id)}
                            className="text-sm px-3 py-1 rounded-xl cursor-pointer bg-danger text-white hover:opacity-90 transition"
                          >
                            삭제
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default DraggableList;
