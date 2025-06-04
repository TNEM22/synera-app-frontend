import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface OperationState {
  isFilterActive: boolean;
  isSortActive: boolean;
  sortType: string | null;
  showSortDropdown: boolean;
  showManageDropdown: boolean;
  showProjectsDropdown: boolean;
  projectsSelectedCategory: string;
  selectedView: string;
}

const initialState: OperationState = {
  isFilterActive: true,
  isSortActive: false,
  sortType: null,
  showSortDropdown: false,
  showManageDropdown: false,
  showProjectsDropdown: false,
  projectsSelectedCategory: '',
  selectedView: 'Board',
};

const operationSlice = createSlice({
  name: 'operation',
  initialState,
  reducers: {
    setIsFilterActive(state, action: PayloadAction<boolean>) {
      state.isFilterActive = action.payload;
    },
    setIsSortActive(state, action: PayloadAction<boolean>) {
      state.isSortActive = action.payload;
    },
    setSortType(state, action: PayloadAction<string | null>) {
      state.sortType = action.payload;
    },
    setShowSortDropdown(state, action: PayloadAction<boolean>) {
      state.showSortDropdown = action.payload;
    },
    setShowManageDropdown(state, action: PayloadAction<boolean>) {
      state.showManageDropdown = action.payload;
    },
    setShowProjectsDropdown(state, action: PayloadAction<boolean>) {
      state.showProjectsDropdown = action.payload;
    },
    setProjectsSelectedCategory(state, action: PayloadAction<string>) {
      state.projectsSelectedCategory = action.payload;
    },
    setSelectedView(state, action: PayloadAction<string>) {
      state.selectedView = action.payload;
    },
  },
});

export const {
  setIsFilterActive,
  setIsSortActive,
  setSortType,
  setShowSortDropdown,
  setShowManageDropdown,
  setShowProjectsDropdown,
  setProjectsSelectedCategory,
  setSelectedView,
} = operationSlice.actions;

export default operationSlice.reducer;
