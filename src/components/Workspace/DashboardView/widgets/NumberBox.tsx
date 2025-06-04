import { motion, useMotionValue, animate } from 'framer-motion';
import { useEffect, useState } from 'react';

type Props = {
  title: string;
  value: number;
};

const AnimatedNumber = ({ value }: { value: number }) => {
  const count = useMotionValue(0);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const animation = animate(count, value, {
      //   duration: 1.2,
      duration: 0.5,
      ease: 'easeOut',
      onUpdate: (latest) => {
        setDisplayValue(Math.round(latest));
      },
    });

    return animation.stop;
  }, [count, value]);

  return <motion.span>{displayValue}</motion.span>;
};

const NumberBox = ({ title, value }: Props) => {
  return (
    <motion.div
      className='h-40 flex-1 py-4 px-10 rounded-md flex flex-col justify-around items-center border dark:border-[#ffffff21] dark:bg-[#24262C]'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h1
        className='text-xl'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {title}
      </motion.h1>
      <motion.h2
        className='text-5xl font-light font-sans'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <AnimatedNumber value={value} />
      </motion.h2>
    </motion.div>
  );
};

export default NumberBox;
