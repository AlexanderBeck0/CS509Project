import type { Item } from "@/utils/types";
import { useState, type ReactNode } from "react";

interface EditItemFormProps {
    item: Item;
    className?: string;
}

/**
 * The values of Item that are allowed to be edited by the Seller
 */
const EDITABLE_ITEM_KEYS = ['name', 'description', 'startDate', 'endDate', 'image', 'initialPrice'];

export default function EditItemForm(props: EditItemFormProps): ReactNode {
    const [keysInUse, setKeysInUse] = useState<typeof EDITABLE_ITEM_KEYS[number][]>([]);

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
            <select role="listbox" onChange={(e) => props.onKeySelect(e.currentTarget.value as typeof EDITABLE_ITEM_KEYS[number])}
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
    return (
        <div className="flex flex-row">
            <label className="flex items-center p-1 font-bold bg-slate-200 rounded-tl-md rounded-bl-md">{props.itemField}</label>
            <input type="text" required={true} className="bg-slate-100 rounded-tl-none rounded-bl-none mr-1" name={props.itemField}></input>
            <button type="button" className="button p-1 max-w-fit max-h-fit bg-red-300 hover:bg-red-400 active:bg-red-500 rounded-lg"
                onClick={props.onRemove}>Remove</button>
        </div>
    );
}