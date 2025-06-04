import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
// import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';

import { setProjects } from '../../../store/slices/projectSlice';

import { SERVER_URL } from '../../../Constants';

const EditProject = ({
  mainTitle,
  closeModal,
}: {
  mainTitle?: string;
  closeModal: () => void;
}) => {
  const dispatch = useAppDispatch();
  const projects = useAppSelector(
    (state) => state.project.features['PROJECTS']
  ) as Record<string, { title: string }>;
  const selectedProject = useAppSelector(
    (state) => state.project.selectedProject
  ) as string;

  const [title, setTitle] = useState(
    selectedProject !== null && projects[selectedProject]
      ? projects[selectedProject].title
      : ''
  );

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim()) return;

    const url = `${SERVER_URL}/api/v1/projects/`;
    toast.promise(
      axios
        .patch(
          url,
          { id: selectedProject, title: title },
          {
            headers: {
              Authorization: `Bearer ${localStorage.token}`,
            },
          }
        )
        .then(() => {
          // const dd = response.data;
          // if (dd.status === "error") {
          //   throw new Error();
          // } else {
          dispatch(
            setProjects({
              ...projects,
              [selectedProject]: {
                ...projects[selectedProject],
                title: title,
              },
            })
          );
          closeModal();
          // }
        })
        .catch((err) => {
          console.error(err);
          throw new Error(err);
        }),
      {
        pending: 'Updating project...',
        success: 'Project updated!',
        error: 'Cannot update project!',
      }
    );
  };

  return (
    <motion.form
      onSubmit={handleFormSubmit}
      className="space-y-6"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="hidden">{mainTitle}</div>
      <div>
        <label htmlFor="title" className="block text-lg font-medium mb-1">
          Project Title
        </label>
        <motion.input
          type="text"
          name="title"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Type your project title..."
          required
          whileFocus={{ scale: 1.02 }}
          className="w-full px-4 py-2 text-lg rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div className="flex justify-end">
        <motion.button
          type="submit"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg"
        >
          Submit
        </motion.button>
      </div>
    </motion.form>
  );
};

export default EditProject;
