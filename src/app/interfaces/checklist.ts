import {CheckListItem} from "./checklist-item";

export interface CheckList {
    id:  string;
    title: string;
    items: CheckListItem[];
}