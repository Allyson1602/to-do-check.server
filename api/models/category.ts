import { EIcon } from "../enums/icon";
import { ToDo } from "./to-do";

export class Category {
  id: number;
  iconName: EIcon;
  isFavorite: boolean;
  title: string;
  todoItems: ToDo[];
}
