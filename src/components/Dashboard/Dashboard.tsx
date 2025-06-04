import { motion } from 'framer-motion';
// import { useSelector, useDispatch } from 'react-redux';
import { useAppDispatch, useAppSelector } from '../../store/hooks';

import Header from './Header';

import Modal from '../Modal/Modal';
import CreateProject from '../Modal/Project/CreateProject';
import EditProject from '../Modal/Project/EditProject';
import DeleteProject from '../Modal/Project/DeleteProject';
import AddTask from '../Modal/Task/AddTask';
import EditTask from '../Modal/Task/EditTask';
import EditColumn from '../Modal/Task_Column/EditColumn';

import { setIsModalOpen, setModalName } from '../../store/slices/modalSlice';

const Dashboard = ({
  children,
  animate,
}: {
  children: React.ReactNode;
  animate?: boolean;
}) => {
  const dispatch = useAppDispatch();

  const isModalOpen = useAppSelector((state) => state.modal.isModalOpen);
  const modalName = useAppSelector((state) => state.modal.modalName);

  const closeModal = () => {
    dispatch(setIsModalOpen(false));
    dispatch(setModalName(null));
  };

  function getModal() {
    switch (modalName) {
      case 'create-project':
        return (
          <CreateProject mainTitle="Create Project" closeModal={closeModal} />
        );
      case 'edit-project':
        return <EditProject mainTitle="Edit Project" closeModal={closeModal} />;
      case 'delete-project':
        return (
          <DeleteProject mainTitle="Delete Project" closeModal={closeModal} />
        );
      case 'add-task':
        return <AddTask mainTitle="Add Task" closeModal={closeModal} />;
      case 'edit-task':
        return <EditTask mainTitle="Edit Task" closeModal={closeModal} />;
      case 'edit-columns':
        return (
          <EditColumn mainTitle="Add/Edit Columns" closeModal={closeModal} />
        );
      default:
        return <div title="🚧Under Construction!🚧" />;
    }
  }

  return (
    <motion.div
      initial={animate ? { marginLeft: -300 } : undefined}
      animate={animate ? { marginLeft: 0 } : undefined}
      exit={animate ? { marginLeft: -300 } : undefined}
      transition={animate ? { duration: 0.3, ease: 'linear' } : undefined}
      className="flex flex-1 w-full flex-col dark:text-white dark:bg-[#2A2B2F]"
    >
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {getModal()}
      </Modal>
      <Header />
      {children}
    </motion.div>
  );
};

export default Dashboard;
