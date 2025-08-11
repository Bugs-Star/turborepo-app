"use client";
import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

interface MenuItem {
  id: string;
  name: string;
  image: string;
}

const initialMenus: MenuItem[] = [
  { id: "1", name: "프리미엄 블렌드 커피", image: "/coffee.jpg" },
  { id: "2", name: "스트로베리 아사이", image: "/acai.jpg" },
  { id: "3", name: "레드벨벳", image: "/redvelvet.png" },
  { id: "4", name: "말차 라떼", image: "/matcha.jpg" },
];

const RecommendMenu = () => {
  const [menus, setMenus] = useState(initialMenus);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    const reordered = Array.from(menus);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setMenus(reordered);
  };

  return (
    <div className="max-w-5xl mx-auto mt-5 bg-white p-6 rounded-lg">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold">추천 메뉴 재정렬</h1>
        <div className="flex items-center gap-2">
          <button className="bg-[#005C14] text-white px-4 py-2 rounded-lg hover:bg-green-900 cursor-pointer">
            새 추천메뉴 추가
          </button>
        </div>
      </div>

      {/* Drag & Drop 리스트 */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="menus">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-3"
            >
              {menus.map((menu, index) => (
                <Draggable key={menu.id} draggableId={menu.id} index={index}>
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

                      {/* 메뉴 정보 */}
                      <div className="flex items-center gap-3 flex-1">
                        <img
                          src={menu.image}
                          alt={menu.name}
                          className="w-14 h-14 rounded ml-3"
                        />
                        <span>{menu.name}</span>
                      </div>

                      {/* 삭제 버튼 */}
                      <button className="bg-[#D74753] text-white px-2 py-1 rounded hover:bg-[#C03F4A] cursor-pointer">
                        추천메뉴 삭제
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default RecommendMenu;
