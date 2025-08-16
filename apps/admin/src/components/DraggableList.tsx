"use client";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Calendar } from "lucide-react";

interface BaseItem {
  id: string;
  name: string;
  image: string;
}

interface DraggableListProps<T extends BaseItem> {
  items: T[];
  onReorder: (newItems: T[]) => void;
  onDelete?: (id: string) => void;
  renderExtra?: (item: T) => React.ReactNode;
}

const DraggableList = <T extends BaseItem>({
  items,
  onReorder,
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
            {items.map((item, index) => (
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
                        className="w-14 h-14 rounded ml-3"
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

                    {"startAt" in item && "finishAt" in item && (
                      <div className="flex justify-center text-gray-400 mr-15 text-xs">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>
                          {(item as any).startAt} ~ {(item as any).finishAt}
                        </span>
                      </div>
                    )}

                    {/* Delete button */}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(item.id)}
                        className="bg-[#D74753] text-white px-2 py-1 rounded hover:bg-[#C03F4A] cursor-pointer"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default DraggableList;
