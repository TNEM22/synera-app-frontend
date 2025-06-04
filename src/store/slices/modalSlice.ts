import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type Task = {
  _id?: string;
  id?: string;
  title?: string | undefined;
  note?: string | undefined;
  milestones?: string[];
  completedMilestones?: string[];
  assignedDate?: string;
  comments?: string[];
  pinned?: string[];
  collaborators?: string[];
  status?: string;
};

interface ModalState {
  isModalOpen: boolean;
  modalName: string | null;
  taskColId: string | null;
  taskState: Task | null;
}

const initialState: ModalState = {
  isModalOpen: false,
  modalName: null,
  taskColId: null,
  taskState: null,
};

const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    setIsModalOpen(state, action: PayloadAction<boolean>) {
      state.isModalOpen = action.payload;
    },
    setModalName(state, action: PayloadAction<string | null>) {
      state.modalName = action.payload;
    },
    setTaskColId(state, action: PayloadAction<string | null>) {
      state.taskColId = action.payload;
    },
    setTaskState(state, action: PayloadAction<Task | null>) {
      state.taskState = action.payload;
    },
  },
});

export const { setIsModalOpen, setModalName, setTaskColId, setTaskState } =
  modalSlice.actions;
export default modalSlice.reducer;
