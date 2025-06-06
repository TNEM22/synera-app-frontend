import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import { useNavigate, Link } from 'react-router-dom';

import { SERVER_URL } from '../../Constants';

const SignupPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [seePassword, setSeePassword] = useState(false);
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [seePasswordConfirm, setSeePasswordConfirm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (localStorage.token && localStorage.name) {
      navigate('/');
    }
  });

  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (
      email.trim() &&
      name.trim() &&
      password.trim() &&
      passwordConfirm.trim()
    ) {
      const url = `${SERVER_URL}/api/v1/users/signup`;
      toast.promise(
        axios
          .post(url, {
            email: email.trim(),
            name: name.trim(),
            password: password.trim(),
            passwordConfirm: passwordConfirm.trim(),
          })
          .then((res) => {
            const dd = res.data;
            setEmail('');
            setName('');
            setPassword('');
            setPasswordConfirm('');

            if (dd.status === 'success') {
              localStorage.setItem('token', dd.token);
              localStorage.setItem('name', dd.data.name.split(' ')[0]);
              navigate('/login');
            } else {
              if (typeof dd.message === 'object') {
                // console.log(dd.message);
                for (const key in dd.message) {
                  toast.error(dd.message[key].message);
                }
                dd.message = 'Something went wrong!';
              }

              throw new Error(dd.message || 'Something went wrong!');
            }
          })
          .catch((err) => {
            // console.log(err);
            if (err.response.status === 400) {
              if (typeof err.response.data.message === 'object') {
                const errorMessages = Object.keys(
                  err.response.data.message
                ).reduce((acc, curr) => {
                  return acc + err.response.data.message[curr].message + ',';
                }, '');
                // console.log(errorMessages);
                setFormError(errorMessages);
              } else {
                setFormError(err.response.data.message);
                throw new Error(err.response.data.message);
              }
            } else {
              setFormError('An unexpected error occurred. Please try again.');
            }
            throw new Error('Something went wrong!');
          }),
        {
          pending: 'Signing Up...',
          success: 'Signed Up!',
          error: {
            render({ data }: { data: { message: string } }) {
              return data.message;
            },
          },
        }
      );
    }
  }

  const formVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.2, duration: 0.6, ease: 'easeOut' },
    }),
  };

  return (
    <div className="fixed h-full w-full flex justify-center items-center bg-[#2A2B2F] text-white">
      <motion.div
        exit={{ opacity: 0, scale: 0.2 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.5,
          scale: { type: 'spring', duration: 0.5, bounce: 0.4 },
        }}
        className="shadow rounded-xl w-[350px] p-6 bg-[#1F2023] shadow-white"
      >
        {/* Animated Icons */}
        <div className="flex gap-1 justify-center mb-4">
          {[0, 1].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.3 }}
              className={`${
                i === 1 ? 'rotate-180 mt-3' : 'mr-1'
              } drop-shadow-[0_4px_8px_rgba(255,255,255,0.3)]`}
            >
              <motion.svg
                width="30"
                height="120"
                viewBox="0 0 30 120"
                xmlns="http://www.w3.org/2000/svg"
                animate={{ scale: [1, 1.1, 1], opacity: [1, 0.7, 1] }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: 'easeInOut',
                  delay: i * 0.5,
                }}
              >
                <polygon points="0,40 30,30 30,62 0,72" fill="#FFFFFF" />
                <path
                  d="M0 70 L35 90"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="5"
                />
              </motion.svg>
            </motion.div>
          ))}
        </div>

        {formError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-sm mb-2"
          >
            <ul>
              {formError.split(',').map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Title */}
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="font-bold text-3xl pb-2 mb-3 border-b border-slate-500"
        >
          Sign Up
        </motion.h1>

        {/* Form */}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {/* Email */}
          <motion.div
            custom={1}
            variants={formVariants}
            initial="hidden"
            animate="visible"
            className="relative"
          >
            <label
              htmlFor="email"
              className="absolute text-sm -top-3 left-2 bg-[#1F2023] px-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email..."
              required
              className="block w-full border border-slate-500 rounded-md p-2 bg-transparent placeholder:text-slate-400"
            />
          </motion.div>

          {/* Name */}
          <motion.div
            custom={2}
            variants={formVariants}
            initial="hidden"
            animate="visible"
            className="relative"
          >
            <label
              htmlFor="name"
              className="absolute text-sm -top-3 left-2 bg-[#1F2023] px-1"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your fullname..."
              required
              className="block w-full border border-slate-500 rounded-md p-2 bg-transparent placeholder:text-slate-400"
            />
          </motion.div>

          {/* Password */}
          <motion.div
            custom={3}
            variants={formVariants}
            initial="hidden"
            animate="visible"
            className="relative"
          >
            <label
              htmlFor="password"
              className="absolute text-sm -top-3 left-2 bg-[#1F2023] px-1"
            >
              Password
            </label>
            <div className="flex items-center justify-end">
              <input
                type={seePassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password..."
                required
                className="block w-full border border-slate-500 rounded-md p-2 bg-transparent placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setSeePassword(!seePassword)}
                className="absolute mr-4 p-1 cursor-pointer"
              >
                {seePassword ? <AiFillEye /> : <AiFillEyeInvisible />}
              </button>
            </div>
          </motion.div>

          {/* Password Confirm */}
          <motion.div
            custom={4}
            variants={formVariants}
            initial="hidden"
            animate="visible"
            className="relative"
          >
            <label
              htmlFor="passwordConfirm"
              className="absolute text-sm -top-3 left-2 bg-[#1F2023] px-1"
            >
              Password Confirm
            </label>

            <div className="flex items-center justify-end">
              <input
                type={seePasswordConfirm ? 'text' : 'password'}
                id="passwordConfirm"
                name="passwordConfirm"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="Enter your password again..."
                required
                className="block w-full border border-slate-500 rounded-md p-2 bg-transparent placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setSeePasswordConfirm(!seePasswordConfirm)}
                className="absolute mr-4 p-1 cursor-pointer"
              >
                {seePasswordConfirm ? <AiFillEye /> : <AiFillEyeInvisible />}
              </button>
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full font-bold mt-2 py-2 px-2 rounded-md cursor-pointer text-white bg-blue-500 active:bg-blue-600 shadow-md hover:shadow-blue-500 transition"
          >
            Submit
          </motion.button>

          {/* Login Link */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full"
          >
            <Link
              to="/login"
              className="block text-center font-bold mt-3 py-2 rounded-md cursor-pointer text-white bg-green-500 active:bg-green-600 shadow-md hover:shadow-green-600 transition"
            >
              Login
            </Link>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
};

export default SignupPage;
