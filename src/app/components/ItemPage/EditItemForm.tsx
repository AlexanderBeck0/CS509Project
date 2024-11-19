import type { Item } from "@/utils/types";
import { useState, type HTMLInputTypeAttribute, type ReactNode } from "react";

interface EditItemFormProps {
    item: Item;
    /**
     * A message to show under the edit button. If `undefined`, nothing is shown.
     */
    message?: string;
    className?: string;
}

/**
 * The values of Item that are allowed to be edited by the Seller
 */
const EDITABLE_ITEM_KEYS = ['name', 'description', 'startDate', 'endDate', 'image', 'initialPrice'] as const;

export default function EditItemForm(props: EditItemFormProps): ReactNode {
    const [keysInUse, setKeysInUse] = useState<typeof EDITABLE_ITEM_KEYS[number][]>([]);
    const [message, setMessage] = useState<string | null>(props?.message || null);

    function onKeySelect(key: typeof EDITABLE_ITEM_KEYS[number]): void {
        if (!keysInUse.includes(key)) setKeysInUse([...keysInUse, key]);
    }

    function removeKey(key: typeof EDITABLE_ITEM_KEYS[number]): void {
        setKeysInUse(keysInUse.filter(existingKey => existingKey !== key));
    }

    /**
     * The action handler for when the form is submitted. Will save the changes.
     * @param formData The form data. {@link https://react.dev/reference/react-dom/components/form}
     */
    function saveChanges(formData: FormData): void {
        const changes = Object.fromEntries(formData.entries());
        alert("Backend of this component is not yet complete!");
        setMessage("Request: " + JSON.stringify(changes));
    }

    return (
        <div className={props.className}>
            <h3 className="text-xl">Edit Item</h3>
            <form action={saveChanges}>
                {keysInUse.map((key, index) => (
                    <EditItemField key={index} itemField={key as typeof EDITABLE_ITEM_KEYS[number]} onRemove={() => removeKey(key)} />
                ))}
                {keysInUse.length < EDITABLE_ITEM_KEYS.length && (
                    <EditItemSelect availibleKeys={EDITABLE_ITEM_KEYS.filter(key => !keysInUse.includes(key))} onKeySelect={onKeySelect} />
                )}
                <button type="submit" disabled={keysInUse.length === 0}
                    className="button py-2 px-4 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-bold rounded-md disabled:cursor-not-allowed disabled:bg-gray-500"
                >Edit Item</button>
            </form>
            {!!message && <p className="text-md">{message}</p>}
        </div>
    )
}

interface EditItemSelectProps {
    availibleKeys: typeof EDITABLE_ITEM_KEYS[number][];
    onKeySelect: (key: typeof EDITABLE_ITEM_KEYS[number]) => void;
}

function EditItemSelect(props: EditItemSelectProps) {
    return (
        <div className="flex flex-row items-center">
            <label>Select a field: </label>
            <select role="listbox" onChange={(e) => {
                props.onKeySelect(e.currentTarget.value as typeof EDITABLE_ITEM_KEYS[number]);
                e.currentTarget.value = ""; // Ensure that "Select a field" is shown when an option is clicked
            }}
                className="p-1 border rounded focus:outline-none focus:shadow-outline" defaultValue="">
                <option value="" disabled>Select a field</option>
                {props.availibleKeys.map((key, index) => (
                    <option key={index} value={key}>{key}</option>
                ))}
            </select>
        </div>
    );
}

interface EditItemFieldProps {
    itemField: typeof EDITABLE_ITEM_KEYS[number];
    onRemove: () => void;
}

function EditItemField(props: EditItemFieldProps) {
    // REALLY unelegant way of doing it, but I couldn't figure out a better way
    const INPUT_TYPE_MAP: Record<typeof EDITABLE_ITEM_KEYS[number], HTMLInputTypeAttribute> = {
        "name": "text",
        "description": "text",
        "endDate": "date",
        "startDate": "date",
        "initialPrice": "number",
        "image": "url"
    };

    return (
        <div className="flex flex-row">
            <label className="flex items-center p-1 font-bold bg-slate-200 rounded-tl-md rounded-bl-md">{props.itemField}</label>
            <input type={INPUT_TYPE_MAP[props.itemField]} required={true} className="bg-slate-100 rounded-tl-none rounded-bl-none mr-1"
                name={props.itemField} min={INPUT_TYPE_MAP[props.itemField] === "number" ? 1 :
                    INPUT_TYPE_MAP[props.itemField] === "date" ? new Date().toISOString().split("T")[0] : undefined}></input>
            <button type="button" className="button p-1 max-w-fit max-h-fit bg-red-300 hover:bg-red-400 active:bg-red-500 rounded-lg"
                onClick={props.onRemove}>Remove</button>
        </div>
    );
}