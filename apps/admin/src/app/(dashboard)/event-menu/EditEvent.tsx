"use client";

import BaseForm from "@/components/BaseForm";
import { X } from "lucide-react";
import { useMemo, useState } from "react";
import { useEditEvent } from "@/hooks/event/useEditEvent";
import { notify } from "@/lib/notify";
import type { EditEventRequest } from "@/lib/api/events";

interface EditEventProps {
  eventId: string;
  initialData?: {
    eventImgUrl?: string;
    title?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
    eventOrder?: number;
  };
  onClose: () => void;
}

const EditEvent = ({ eventId, initialData, onClose }: EditEventProps) => {
  const { mutate, isPending } = useEditEvent(eventId);
  const [image, setImage] = useState<File | null>(null);

  const previewSrc = useMemo(() => {
    if (image) return URL.createObjectURL(image);
    return initialData?.eventImgUrl ?? null;
  }, [image, initialData?.eventImgUrl]);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    const fd = new FormData(e.currentTarget);

    if (image) fd.set("eventImg", image);

    const numKeys = ["eventOrder"] as const;
    numKeys.forEach((key) => {
      const raw = fd.get(key)?.toString().trim();
      if (!raw) fd.delete(key);
      else fd.set(key, String(Number(raw)));
    });

    if (fd.has("isActive")) {
      const v = fd.get("isActive");
      fd.set("isActive", v === "on" || v === "true" ? "true" : "false");
    }

    // ✅ FormData → EditEventRequest로 변환 (any 제거)
    const payload: EditEventRequest = {};
    const get = (k: string) => fd.get(k)?.toString();

    const title = get("title");
    if (title) payload.title = title;

    const description = get("description");
    if (description) payload.description = description;

    const startDate = get("startDate");
    if (startDate) payload.startDate = startDate;

    const endDate = get("endDate");
    if (endDate) payload.endDate = endDate;

    const isActive = get("isActive");
    if (typeof isActive === "string") payload.isActive = isActive === "true";

    const eventOrder = get("eventOrder");
    if (eventOrder !== undefined) {
      const n = Number(eventOrder);
      if (!Number.isNaN(n)) payload.eventOrder = n;
    }

    const file = fd.get("eventImg");
    if (file instanceof File && file.size > 0) {
      payload.eventImg = file; // ✅ File 허용
    }

    mutate(payload, {
      onSuccess: () => {
        notify.success("이벤트가 수정되었습니다.");
        onClose();
      },
    });
  };

  const toLocalInputValue = (iso?: string): string | undefined => {
    if (!iso) return undefined;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return undefined;

    const pad = (n: number) => String(n).padStart(2, "0");

    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());

    return `${yyyy}-${mm}-${dd}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={onClose}
    >
      <div
        className="relative bg-background rounded-2xl shadow-lg w-full max-w-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 cursor-pointer"
        >
          <X size={24} />
        </button>

        <BaseForm
          title="이벤트 수정"
          uploadLabel="이벤트 이미지"
          buttonLabel={isPending ? "저장 중..." : "이벤트 수정"}
          imageFile={image}
          imagePreviewUrl={previewSrc || undefined}
          onImageChange={setImage}
          onSubmit={handleSubmit}
        >
          {/* 제목 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              제목
            </label>
            <input
              type="text"
              name="title"
              defaultValue={initialData?.title}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring focus:border-[#005C14]"
            />
          </div>

          {/* 설명 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              설명
            </label>
            <textarea
              name="description"
              defaultValue={initialData?.description}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 min-h-[100px] focus:outline-none focus:ring focus:border-[#005C14]"
            />
          </div>

          {/* 기간 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                시작일시
              </label>
              <input
                type="date"
                name="startDate"
                defaultValue={toLocalInputValue(initialData?.startDate)}
                className="w-full text-sm border border-gray-300 rounded-lg px-2 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                종료일시
              </label>
              <input
                type="date"
                name="endDate"
                defaultValue={toLocalInputValue(initialData?.endDate)}
                className="w-full text-sm border border-gray-300 rounded-lg px-2 py-2"
              />
            </div>
          </div>

          {/* 활성/표시순서 */}
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={!!initialData?.isActive}
                className="h-4 w-4"
              />
              <span className="text-sm text-gray-700">노출(활성)</span>
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                표시순서(작을수록 위)
              </label>
              <input
                type="number"
                name="eventOrder"
                defaultValue={
                  typeof initialData?.eventOrder === "number"
                    ? initialData.eventOrder
                    : undefined
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>
          </div>
        </BaseForm>
      </div>
    </div>
  );
};

export default EditEvent;
