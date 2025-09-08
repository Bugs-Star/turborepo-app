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
  /** ✅ 드래그 종료 후 서버 반영 등 커밋용 (옵션) */
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

    // 로컬 즉시 반영
    onReorder(reordered);

    // ✅ 커밋 콜백: 변경된 항목만 diff로 전달
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
                      className="flex items-center justify-between border border-gray-200 rounded-lg p-3 bg-white shadow-sm"
                    >
                      <div
                        {...provided.dragHandleProps}
                        className="cursor-grab text-gray-400 pr-2"
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
                            <div className="text-sm text-gray-600">
                              {renderExtra(item)}
                            </div>
                          )}
                        </div>
                      </div>

                      {hasRange && (
                        <div className="flex items-center text-gray-500 ml-4 mr-4 text-xs">
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
                            className="bg-orange-400 text-sm text-white px-3 py-1 rounded-xl cursor-pointer"
                          >
                            수정
                          </button>
                        )}
                        {onDelete && (
                          <button
                            type="button"
                            onClick={() => onDelete(item.id)}
                            className="bg-[#D74753] text-sm text-white px-3 py-1 rounded-xl cursor-pointer"
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
