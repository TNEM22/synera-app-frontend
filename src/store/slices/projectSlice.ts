import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface ProjectState {
  features: {
    TEAM: Record<string, unknown>;
    PROJECTS: Record<string, unknown>;
    TASKS: Array<unknown>;
    REMINDERS: Record<string, unknown>;
    MESSENGERS: Record<string, unknown>;
  };
  selectedProject: string | null;
  projectTasks: Record<string, Record<string, unknown[]>>;
}

const initialState: ProjectState = {
  features: {
    TEAM: {},
    PROJECTS: {},
    TASKS: [],
    REMINDERS: {},
    MESSENGERS: {},
  },
  selectedProject: null,
  projectTasks: {
    // DESIGN_SYSTEM: {
    //   TODO: [],
    //   IN_PROGRESS: [],
    //   DONE: [],
    // }
  },
};

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    setTeam(state, action: PayloadAction<Record<string, unknown>>) {
      state.features.TEAM = action.payload;
    },
    setProjects(state, action: PayloadAction<Record<string, unknown>>) {
      state.features.PROJECTS = action.payload;
    },
    setTasks(state, action: PayloadAction<Array<unknown>>) {
      state.features.TASKS = action.payload;
    },
    setReminders(state, action: PayloadAction<Record<string, unknown>>) {
      state.features.REMINDERS = action.payload;
    },
    setMessengers(state, action: PayloadAction<Record<string, unknown>>) {
      state.features.MESSENGERS = action.payload;
    },
    setSelectedProject(state, action: PayloadAction<string | null>) {
      state.selectedProject = action.payload;
    },
    setProjectTasks(
      state,
      action: PayloadAction<Record<string, Record<string, unknown[]>>>
    ) {
      state.projectTasks = action.payload;
    },
  },
});

export const {
  setTeam,
  setProjects,
  setTasks,
  setReminders,
  setMessengers,
  setSelectedProject,
  setProjectTasks,
} = projectSlice.actions;

export default projectSlice.reducer;
