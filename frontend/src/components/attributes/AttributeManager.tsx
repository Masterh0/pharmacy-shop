"use client";

import { useState } from "react";

import { useAttributes } from "@/lib/hooks/useAttributes";

import AttributeTable from "./AttributeTable";
import AttributeFormModal from "./AttributeFormModal";
import AttributeValuesModal from "./AttributeValuesModal";
import DeleteAttributeDialog from "./DeleteAttributeDialog";

import type {
    Attribute,
    AttributeValue,
} from "@/lib/api/attributeApi";

export default function AttributeManager() {

    const { data, isLoading } = useAttributes();

    const [selected, setSelected] =
        useState<Attribute | null>(null);

    const [editing, setEditing] =
        useState<Attribute | null>(null);

    const [deleteItem, setDeleteItem] =
        useState<Attribute | null>(null);

    const [formOpen, setFormOpen] =
        useState(false);

    const [valuesOpen, setValuesOpen] =
        useState(false);

    if (isLoading)
        return <p>درحال دریافت...</p>;

    return (
        <>

            <div className="flex justify-between mb-5">

                <h1 className="text-xl font-bold">
                    مدیریت ویژگی‌ها
                </h1>

                <button
                    onClick={() => {

                        setEditing(null);

                        setFormOpen(true);

                    }}
                    className="bg-sky-500 text-white px-4 py-2 rounded-lg"
                >
                    افزودن ویژگی
                </button>

            </div>
                    
            <AttributeTable

                attributes={data ?? []}

                onEdit={(item) => {

                    setEditing(item);

                    setFormOpen(true);

                }}

                onDelete={(item) => {

                    setDeleteItem(item);

                }}

                onManageValues={(item) => {

                    setSelected(item);

                    setValuesOpen(true);

                }}

            />

            <AttributeFormModal

                open={formOpen}

                onClose={() => setFormOpen(false)}

                attribute={editing}

            />

            <AttributeValuesModal

                open={valuesOpen}

                attribute={selected}

                onClose={() => setValuesOpen(false)}

            />

            <DeleteAttributeDialog

                open={!!deleteItem}

                attributeId={deleteItem?.id ?? null}

                attributeName={deleteItem?.name}

                onClose={() => setDeleteItem(null)}

            />

        </>
    );

}