"use client";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Calendar } from "lucide-react";
import React from "react";

interface BaseItem {
  id: string;
  name: string;
  image: string;
  // 선택적으로 날짜 필드를 포함할 수 있음
  startDate?: string;
  endDate?: string;
  startAt?: string;
  finishAt?: string;
}

interface DraggableListProps<T extends BaseItem> {
  items: T[];
  onReorder: (newItems: T[]) => void;
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
  onEdit,
  onDelete,
  renderExtra,
}: DraggableListProps<T>) => {
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    const reordered = Array.from(items);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    onReorder(reordered);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="list">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-3"
          >
            {items.map((item, index) => {
              // start/end 필드 호환 처리
              const start = (item.startDate ?? item.startAt) || "";
              const end = (item.endDate ?? item.finishAt) || "";
              const hasRange = Boolean(start && end);

              return (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided) => (
                    <div
                      className="flex items-center justify-between border border-gray-200 rounded-lg p-3 bg-white shadow-sm"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                    >
                      {/* Drag handle */}
                      <div
                        {...provided.dragHandleProps}
                        className="cursor-grab text-gray-400 pr-2"
                      >
                        ⋮⋮
                      </div>

                      {/* Item info */}
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

                      {/* 기간 표시 */}
                      {hasRange && (
                        <div className="flex items-center text-gray-500 ml-4 mr-4 text-xs">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>
                            {formatDate(start)} ~ {formatDate(end)}
                          </span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {onEdit && (
                          <button
                            type="button"
                            onClick={() => onEdit(item.id)}
                            className="bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600 transition cursor-pointer"
                            aria-label="수정"
                          >
                            수정
                          </button>
                        )}
                        {onDelete && (
                          <button
                            type="button"
                            onClick={() => onDelete(item.id)}
                            className="bg-[#D74753] text-white px-3 py-1 rounded hover:bg-[#C03F4A] transition cursor-pointer"
                            aria-label="삭제"
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
