import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { SearchIcon } from '../components/Icons/SearchIcon';
import { ThemeLight } from '../components/Icons/ThemeLight';
import { HeaderAddCard } from '../components/Icons/HeaderAddCard';
import { Notification } from '../components/Icons/Notification';
import { ProfilePic } from '../components/ProfilePic';
import { brandLogo, person1 } from '../assets';
import { Logo } from '../components/Icons/Logo';
import { Menu } from '../components/Icons/Menu';
import axios from 'axios';
import { API_BASE_URL } from '../config/constant.js';
import { useRoles } from '../RolesContext';
import { MenuComponent } from '../components/MenuComponent.jsx';

import { Modal } from "flowbite-react";
import { motion, AnimatePresence } from "framer-motion";
import { MdCancel } from 'react-icons/md';
import MenuSectionIcon from '../components/MenuSectionIcon.jsx';
import { FaMoon, FaSun } from 'react-icons/fa';

const Header = (props) => {
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const { userId, users } = useRoles() || {};
    const { setSelectedCountry } = useRoles() || "india";
    const { role } = useRoles() || "india";
    const [tokenAvailable, setTokenAvailable] = useState(false);
    const [country, setCountry] = useState("india")
    const [openModal, setOpenModal] = useState(false);
    const [isClosing, setIsClosing] = useState(false); // Track closing animation
    const modalRef = useRef(null);

    // Theme toggle state
    const [theme, setTheme] = useState(localStorage.getItem("theme") ? localStorage.getItem("theme") : "light");

    // Effect to apply the theme
    useEffect(() => {
        if (theme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
        localStorage.setItem("theme", theme);
    }, [theme]);

    const handleThemeSwitch = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };


    const modalVariants = {
        hidden: { opacity: 0, x: "100%" },
        visible: { opacity: 1, x: "0%", transition: { duration: 0.4, ease: "easeInOut" } },
        exit: { opacity: 0, x: "100%", transition: { duration: 0.4, ease: "easeInOut" } },
    };

    const handleModalOpen = () => {
        setOpenModal(true);
    };

    useEffect(() => {
        // Close modal if clicked outside
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                // Trigger closing animation
                setIsClosing(true);

                // Wait for animation to complete before fully closing the modal
                setTimeout(() => {
                    setOpenModal(false);
                    setIsClosing(false); // Reset the closing state
                }, 400); // Match the animation duration in `modalVariants`
            }
        };

        // Add event listener
        document.addEventListener('mousedown', handleClickOutside);

        // Cleanup event listener
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [modalRef]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 1024 && openModal) {
                setIsClosing(true);

                // Wait for the animation to complete before fully closing the modal
                setTimeout(() => {
                    setOpenModal(false);
                    setIsClosing(false); // Reset the closing state
                }, 400); // Match the animation duration in `modalVariants`
            }
        };

        // Add event listener for resize
        window.addEventListener('resize', handleResize);

        // Cleanup event listener on component unmount
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [openModal]);

    // const [isOpen, setIsOpen] = useState(false);

    const toggleDrawer = () => {
        setIsOpen(!isOpen);
    };

    const closeOffcanvas = () => {
        setIsOpen(false);
    };

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const closeDropdown = () => {
        setDropdownOpen(false);
    };

    const handleLogout = () => {
        localStorage.removeItem("auth-token");
        navigate("/login");
    }

    useEffect(() => {
        let token = localStorage.getItem('auth-token');
        if (token === null) {
            setTokenAvailable(false)
        } else {
            setTokenAvailable(true);
        }
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                closeOffcanvas();
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                closeDropdown();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


    const MenuComponent = ({ to, name, icon }) => {
        const isActive = location.pathname === to;

        const handleModalClose = () => {
            // Trigger closing animation
            setIsClosing(true);

            // Wait for animation to complete before resetting the modal
            setTimeout(() => {
                setOpenModal(false);
                setIsClosing(false);
            }, 400); // Match the animation duration
        };

        return (
            <li className="mb-2 last:mb-0">
                <Link
                    onClick={handleModalClose}
                    className={`menu-section duration-200 ease-linear 
                        px-3 py-2 flex items-center relative justify-between ${isActive ? 'bg-[#0d0d0d] hover:bg-black/75 text-mainBg dark:bg-[#212121] font-semibold' : 'hover:bg-[#c8c8c8] dark:hover:bg-[#212121]'
                        } rounded-lg duration-300 group`}
                    to={to}
                >
                    <div className="flex items-center flex-1">
                        <div
                            className={`active-menu-status ${isActive ? 'bg-accent' : ''
                                } h-3 w-2 absolute left-[-4px] rounded-lg`}
                        ></div>
                        {/* {icon} */}
                        <div className={`icon-lg flex items-center justify-center duration-300 ${isActive ? 'bg-cardBg group-hover:bg-mainBg dark:bg-[#000] dark:group-hover:bg-[#212121] text-[#212121] dark:text-cardBg' : 'bg-cardBg group-hover:bg-mainBg dark:bg-[#212121] dark:group-hover:bg-[#000]'}  rounded-lg`}>
                            {/* <UserIcon width={16} height={16} fill={"none"} /> */}
                            {icon}
                        </div>
                        <span className="text-md ms-2">{name}</span>
                    </div>
                </Link>
            </li>
        );
    };

    const handleModalClose = () => {
        // Trigger closing animation
        setIsClosing(true);

        // Wait for animation to complete before resetting the modal
        setTimeout(() => {
            setOpenModal(false);
            setIsClosing(false);
        }, 400); // Match the animation duration
    };

    return (
        <div className="top-0 border-b-2 dark:border-[#2b2b2b] dark:bg-[#141414] to-mainBg/0 z-40 duration-200">
            <header className="w-full bg-try app-header px-3 py-2">
                <nav className="main-header flex items-center justify-between lg:justify-end" aria-label="Global">
                    <Link to="/" className="header-logo lg:hidden">
                        <svg
                            className="h-8 w-auto"
                            viewBox="0 0 276 200"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M275.49 161.021C275.25 161.871 275.02 162.721 274.78 163.581C273.08 169.641 269.62 174.521 263.66 176.621C254.1 179.991 244.43 183.151 234.62 185.66C213.57 191.03 192.18 194.661 170.54 196.551C154.92 197.911 139.26 198.821 123.59 199.561C100.57 200.641 77.59 199.631 54.66 197.601C42.28 196.511 29.9301 195.001 17.5901 193.581C7.9501 192.471 0.540115 184.53 0.230115 175.15C-0.0998854 165.05 6.4901 156.531 16.3401 155.001C19.6401 154.491 23.1402 155.031 26.5202 155.361C38.9702 156.581 51.3902 158.331 63.8602 159.101C80.1602 160.111 96.5102 160.991 112.83 160.861C154.33 160.521 195.39 156.171 235.52 144.981C239.97 143.741 244.36 142.241 248.69 140.601C259.9 136.371 272.17 142.841 274.89 154.551C275.05 155.251 275.3 155.94 275.5 156.63V161.021H275.49Z"
                                fill="#F05F23"
                            />
                            <path
                                d="M92.1501 143.38C74.2401 143.37 60.4202 142.1 46.7402 139.43C36.6202 137.45 29.4601 128.12 30.6301 118.46C31.9401 107.67 40.5303 100.05 51.1103 100.7C55.4703 100.97 59.7703 102.06 64.1103 102.68C77.2003 104.53 90.3302 104.71 103.51 103.67C138.29 100.9 171.07 90.95 202.58 76.37C206.77 74.43 210.86 72.0198 215.27 70.8798C224.53 68.4798 233.97 73.6999 237.45 82.4699C241.06 91.5799 237.82 101.85 229.27 106.56C222.31 110.39 215.07 113.79 207.77 116.94C181.92 128.09 155.12 136.05 127.27 140.34C114.32 142.33 101.29 143.42 92.1501 143.4V143.38Z"
                                fill="#F05F23"
                            />
                            <path
                                d="M166.66 41.5904C166.47 64.7904 147.87 82.9803 124.56 82.7503C101.85 82.5303 83.6503 63.7002 83.8503 40.6302C84.0403 18.1202 102.82 -0.17966 125.53 0.000340034C148.58 0.18034 166.85 18.6504 166.66 41.5904Z"
                                fill="#F05F23"
                            />
                        </svg>
                    </Link>
                    <div className="flex items-center gap-3">
                        {tokenAvailable && (
                            <>
                                {role === "India" && (
                                    <div className="flex space-x-2 mr-2 rounded-lg bg-mainBg dark:bg-black select-none duration-200">
                                        <label className="radio flex-1 flex flex-grow items-center justify-center rounded-lg cursor-pointer">
                                            <input type="radio" name="country" defaultValue="india" className="peer hidden flex-1" checked={country === "india"} onChange={() => { setCountry("india"); setSelectedCountry("india"); }} />
                                            <span className="text-sm flex-1 text-center peer-checked:bg-gradient-to-r peer-checked:bg-accent dark:peer-checked:bg-[#333] peer-checked:text-white peer-checked:font-semibold p-2 rounded-lg transition duration-150 ease-in-out">India</span>
                                        </label>
                                        <label className="radio flex-1 flex flex-grow items-center justify-center rounded-lg cursor-pointer">
                                            <input type="radio" name="country" defaultValue="canada" className="peer hidden flex-1" checked={country === "canada"} onChange={() => { setCountry("canada"); setSelectedCountry("canada"); }} />
                                            <span className="text-sm flex-1 text-center peer-checked:bg-gradient-to-r peer-checked:bg-accent dark:peer-checked:bg-[#333] peer-checked:text-white peer-checked:font-semibold p-2 rounded-lg transition duration-150 ease-in-out">Canada</span>
                                        </label>
                                    </div>
                                )}
                                <button
                                    onClick={handleThemeSwitch}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-200 dark:bg-[#2b2b2b] text-gray-800 dark:text-gray-200 transition-colors duration-300 hover:bg-gray-300 dark:hover:bg-[#222222] overflow-hidden"
                                >
                                    <AnimatePresence mode="wait" initial={false}>
                                        <motion.div
                                            key={theme === 'dark' ? 'moon' : 'sun'}
                                            initial={{ y: -20, opacity: 0, rotate: -90 }}
                                            animate={{ y: 0, opacity: 1, rotate: 0 }}
                                            exit={{ y: 20, opacity: 0, rotate: 90 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            {theme === 'dark' ? <FaSun /> : <FaMoon />}
                                        </motion.div>
                                    </AnimatePresence>
                                </button>
                                <div className="relative" ref={dropdownRef}>
                                    <button onClick={toggleDropdown}>
                                        <ProfilePic Img={users?.find(user => user._id === userId)?.avatar ? users?.find(user => user._id === userId)?.avatar : person1} alt="User Profile" />
                                    </button>
                                    {dropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1a1a1a] shadow-lg rounded-md z-50 border dark:border-[#2b2b2b]">
                                            <div className="px-4 py-2 border-b dark:border-[#2b2b2b]">
                                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                                    User Name: {users?.find(user => user._id === userId)?.username || 'Unknown User'}
                                                </p>
                                            </div>
                                            <div className="py-1">
                                                <button
                                                    onClick={() => {
                                                        closeDropdown();
                                                        handleLogout();
                                                    }}
                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#c03a03]"
                                                >
                                                    Logout
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                        {tokenAvailable && (
                            <button onClick={handleModalOpen} className="lg:hidden text-gray-800 dark:text-gray-200 duration-200">
                                <Menu width={32} height={32} />
                            </button>
                        )}
                    </div>
                </nav>
            </header>

            {tokenAvailable && (
                <Modal show={openModal} onClose={handleModalClose} ref={modalRef}>
                    <motion.div
                        variants={modalVariants}
                        initial="hidden"
                        animate={openModal && !isClosing ? "visible" : "hidden"}
                        exit="exit"
                        className="fixed top-0 right-0 h-full bg-mainBg dark:bg-[#141414] text-secondaryText flex flex-col gap-6 w-full max-w-96 shadow-lg"
                    >
                        <Modal.Body className="flex flex-col p-2 gap-6 shadow-lg transform translate-x-0 transition-transform duration-300">
                            <nav className="flex flex-col flex-1 overflow-auto">
                                <div className="w-full flex items-center justify-between p-4 mb-4">
                                    <NavLink onClick={handleModalClose} aria-label='logo-brand' to={'/'}>
                                        {/* <img src={brandLogo} alt="text-logo" className='h-12 object-cover w-auto' /> */}
                                        <svg
                                            className="w-47 text-[#2b2b2b] dark:text-cardBg"
                                            viewBox="0 0 794 153"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M307.58 16.4503V101.54C307.58 102.05 307.17 102.46 306.66 102.46H294.85C294.34 102.46 293.93 102.05 293.93 101.54V64.2503C293.93 63.2203 292.5 62.9603 292.14 63.9303L283.1 88.2003C282.97 88.5603 282.62 88.8003 282.23 88.8003H275.57C275.18 88.8003 274.84 88.5603 274.7 88.2003L265.66 63.9303C265.3 62.9603 263.87 63.2203 263.87 64.2503V101.54C263.87 102.05 263.46 102.46 262.95 102.46H251.14C250.63 102.46 250.22 102.05 250.22 101.54V16.4503C250.22 15.9403 250.63 15.5303 251.14 15.5303H257.43C257.8 15.5303 258.13 15.7503 258.28 16.0903L278.06 61.7603C278.38 62.5003 279.44 62.5003 279.76 61.7603L299.54 16.0903C299.69 15.7503 300.02 15.5303 300.39 15.5303H306.68C307.19 15.5303 307.6 15.9403 307.6 16.4503H307.58Z"
                                                fill="currentColor"
                                            />
                                            <path
                                                d="M337.02 103.46C331.06 103.46 326.25 101.76 322.61 98.3703C318.47 94.4003 316.4 88.9703 316.4 82.1003V35.8903C316.4 29.0203 318.47 23.5903 322.61 19.6203C326.25 16.2303 331.06 14.5303 337.02 14.5303C342.98 14.5303 347.78 16.2303 351.43 19.6203C355.57 23.5903 357.64 29.0203 357.64 35.8903V82.1003C357.64 88.9703 355.57 94.4003 351.43 98.3703C347.79 101.77 342.98 103.46 337.02 103.46ZM337.02 28.1903C334.7 28.1903 333 28.6903 331.93 29.6803C330.69 30.8403 330.07 32.9103 330.07 35.8903V82.1003C330.07 85.0803 330.69 87.1503 331.93 88.3103C333.01 89.3003 334.7 89.8003 337.02 89.8003C339.34 89.8003 341.12 89.3003 342.11 88.3103C343.35 87.2303 343.97 85.1603 343.97 82.1003V35.8903C343.97 32.8303 343.35 30.7603 342.11 29.6803C341.12 28.6903 339.42 28.1903 337.02 28.1903Z"
                                                fill="currentColor"
                                            />
                                            <path
                                                d="M407.51 102.46H401.07C400.71 102.46 400.39 102.25 400.23 101.93L381.37 62.0903C380.95 61.2003 379.61 61.5003 379.61 62.4903V101.54C379.61 102.05 379.2 102.46 378.69 102.46H366.88C366.37 102.46 365.96 102.05 365.96 101.54V16.4503C365.96 15.9403 366.37 15.5303 366.88 15.5303H373.32C373.68 15.5303 374 15.7403 374.16 16.0603L393.02 55.7903C393.44 56.6803 394.78 56.3803 394.78 55.3903V16.4503C394.78 15.9403 395.19 15.5303 395.7 15.5303H407.51C408.02 15.5303 408.43 15.9403 408.43 16.4503V101.54C408.43 102.05 408.02 102.46 407.51 102.46Z"
                                                fill="currentColor"
                                            />
                                            <path
                                                d="M460.12 102.461H447.45C447.07 102.461 446.72 102.221 446.59 101.861L437.06 76.7505C436.77 75.9805 435.68 75.9505 435.35 76.7105L431.62 85.2605C431.57 85.3805 431.54 85.5005 431.54 85.6305V101.531C431.54 102.041 431.13 102.451 430.62 102.451H418.81C418.3 102.451 417.89 102.041 417.89 101.531V16.4405C417.89 15.9305 418.3 15.5205 418.81 15.5205H430.62C431.13 15.5205 431.54 15.9305 431.54 16.4405V46.2905C431.54 47.3005 432.92 47.5805 433.31 46.6605L446.45 16.0805C446.6 15.7405 446.93 15.5205 447.3 15.5205H460.07C460.73 15.5205 461.18 16.2005 460.92 16.8105L444.1 56.4205C444.01 56.6405 444 56.8905 444.09 57.1105L460.99 101.211C461.22 101.821 460.77 102.471 460.13 102.471L460.12 102.461Z"
                                                fill="currentColor"
                                            />
                                            <path
                                                d="M505.93 103.46C499.97 103.46 495.17 101.76 491.52 98.3703C487.38 94.4003 485.31 88.9703 485.31 82.1003V71.7203C485.31 71.2103 485.72 70.8003 486.23 70.8003H498.04C498.55 70.8003 498.96 71.2103 498.96 71.7203V82.1003C498.96 85.0803 499.58 87.1503 500.82 88.3103C501.9 89.3003 503.59 89.8003 505.91 89.8003C508.23 89.8003 510.01 89.3003 511 88.3103C512.24 87.2303 512.86 85.1603 512.86 82.1003V76.6303C512.86 72.8203 511.33 69.5103 508.26 66.6903C507.6 66.1103 505.86 65.0303 503.04 63.4603C499.15 61.3903 496.29 59.5703 494.47 58.0003C491.49 55.3503 489.21 52.3303 487.64 48.9303C486.07 45.5403 485.28 41.8903 485.28 38.0003V35.8903C485.28 29.0203 487.35 23.5903 491.49 19.6203C495.13 16.2303 499.94 14.5303 505.9 14.5303C511.86 14.5303 516.66 16.2303 520.31 19.6203C524.45 23.5903 526.52 29.0203 526.52 35.8903V42.5403C526.52 43.0503 526.11 43.4603 525.6 43.4603H513.79C513.28 43.4603 512.87 43.0503 512.87 42.5403V35.8903C512.87 32.8303 512.25 30.7603 511.01 29.6803C510.02 28.6903 508.32 28.1903 505.92 28.1903C503.52 28.1903 501.9 28.6903 500.83 29.6803C499.59 30.8403 498.97 32.9103 498.97 35.8903V38.0003C498.97 41.8103 500.5 45.0803 503.57 47.8103C504.4 48.4703 506.01 49.4703 508.41 50.7903C512.71 53.1103 515.7 55.0103 517.35 56.5003C523.48 61.9603 526.54 68.6703 526.54 76.6203V82.0903C526.54 88.9603 524.47 94.3903 520.33 98.3603C516.69 101.76 511.88 103.45 505.92 103.45L505.93 103.46Z"
                                                fill="currentColor"
                                            />
                                            <path
                                                d="M575.73 16.4503V101.54C575.73 102.05 575.32 102.46 574.81 102.46H563C562.49 102.46 562.08 102.05 562.08 101.54V65.6303C562.08 65.1203 561.67 64.7103 561.16 64.7103H549.1C548.59 64.7103 548.18 65.1203 548.18 65.6303V101.54C548.18 102.05 547.77 102.46 547.26 102.46H535.45C534.94 102.46 534.53 102.05 534.53 101.54V16.4503C534.53 15.9403 534.94 15.5303 535.45 15.5303H547.26C547.77 15.5303 548.18 15.9403 548.18 16.4503V50.1203C548.18 50.6303 548.59 51.0403 549.1 51.0403H561.16C561.67 51.0403 562.08 50.6303 562.08 50.1203V16.4503C562.08 15.9403 562.49 15.5303 563 15.5303H574.81C575.32 15.5303 575.73 15.9403 575.73 16.4503Z"
                                                fill="currentColor"
                                            />
                                            <path
                                                d="M613.59 88.6803H599.49C599.04 88.6803 598.66 89.0003 598.58 89.4403L596.37 101.71C596.29 102.15 595.91 102.47 595.46 102.47H583.45C582.87 102.47 582.43 101.94 582.54 101.36L599.56 16.2703C599.65 15.8403 600.03 15.5303 600.47 15.5303H612.62C613.06 15.5303 613.44 15.8403 613.53 16.2703L630.55 101.36C630.66 101.93 630.23 102.47 629.64 102.47H617.63C617.18 102.47 616.8 102.15 616.72 101.71L614.51 89.4403C614.43 89.0003 614.05 88.6803 613.6 88.6803H613.59ZM611.81 73.9303L607.45 49.0403C607.27 48.0203 605.81 48.0203 605.63 49.0403L601.27 73.9303C601.17 74.5003 601.61 75.0103 602.18 75.0103H610.91C611.48 75.0103 611.92 74.4903 611.82 73.9303H611.81Z"
                                                fill="currentColor"
                                            />
                                            <path
                                                d="M658.08 102.46H638.39C637.88 102.46 637.47 102.05 637.47 101.54V16.4503C637.47 15.9403 637.88 15.5303 638.39 15.5303H658.08C663.96 15.5303 668.76 17.2703 672.49 20.7503C676.63 24.5603 678.7 29.9403 678.7 36.9003V81.6103C678.7 85.0103 678.2 88.0303 677.21 90.6803C676.05 93.5003 674.43 95.8203 672.37 97.6403C668.81 100.87 664.05 102.48 658.09 102.48L658.08 102.46ZM651.12 87.8803C651.12 88.3903 651.53 88.8003 652.04 88.8003H658.07C660.55 88.8003 662.29 88.3503 663.29 87.4303C664.45 86.4403 665.03 84.4903 665.03 81.5903V36.8803C665.03 33.9803 664.41 31.9103 663.17 30.6703C662.09 29.6803 660.4 29.1803 658.08 29.1803H652.05C651.54 29.1803 651.13 29.5903 651.13 30.1003V87.8703L651.12 87.8803Z"
                                                fill="currentColor"
                                            />
                                            <path
                                                d="M707.26 103.46C701.3 103.46 696.49 101.76 692.85 98.3703C688.71 94.4003 686.64 88.9703 686.64 82.1003V35.8903C686.64 29.0203 688.71 23.5903 692.85 19.6203C696.49 16.2303 701.3 14.5303 707.26 14.5303C713.22 14.5303 718.02 16.2303 721.67 19.6203C725.81 23.5903 727.88 29.0203 727.88 35.8903V82.1003C727.88 88.9703 725.81 94.4003 721.67 98.3703C718.03 101.77 713.22 103.46 707.26 103.46ZM707.26 28.1903C704.94 28.1903 703.24 28.6903 702.17 29.6803C700.93 30.8403 700.31 32.9103 700.31 35.8903V82.1003C700.31 85.0803 700.93 87.1503 702.17 88.3103C703.25 89.3003 704.94 89.8003 707.26 89.8003C709.58 89.8003 711.36 89.3003 712.35 88.3103C713.59 87.2303 714.21 85.1603 714.21 82.1003V35.8903C714.21 32.8303 713.59 30.7603 712.35 29.6803C711.36 28.6903 709.66 28.1903 707.26 28.1903Z"
                                                fill="currentColor"
                                            />
                                            <path
                                                d="M793.96 16.5603L783.51 101.65C783.45 102.11 783.06 102.46 782.59 102.46H776.53C776.12 102.46 775.75 102.18 775.64 101.79L764.55 62.4203C764.3 61.5203 763.02 61.5203 762.77 62.4203L751.8 101.79C751.69 102.19 751.32 102.47 750.91 102.47H744.85C744.38 102.47 743.99 102.12 743.93 101.66L733.48 16.5703C733.41 16.0203 733.84 15.5303 734.4 15.5303H746.31C746.78 15.5303 747.18 15.8903 747.23 16.3503L751.33 53.9803C751.44 55.0003 752.88 55.1103 753.14 54.1203L759.63 30.0003C759.74 29.6003 760.1 29.3203 760.52 29.3203H766.93C767.35 29.3203 767.71 29.6003 767.82 30.0003L774.31 54.1203C774.58 55.1103 776.01 55.0003 776.12 53.9803L780.22 16.3503C780.27 15.8803 780.67 15.5303 781.14 15.5303H793.05C793.61 15.5303 794.04 16.0203 793.97 16.5703L793.96 16.5603Z"
                                                fill="currentColor"
                                            />
                                            <path
                                                fillRule="evenodd"
                                                clipRule="evenodd"
                                                d="M126.76 32.1501C126.76 14.7401 112.66 0.620117 95.27 0.620117C77.88 0.620117 63.78 14.7401 63.78 32.1501C63.78 49.5601 77.88 63.6801 95.27 63.6801C112.66 63.6801 126.76 49.5601 126.76 32.1501Z"
                                                fill="#F05F23"
                                            />
                                            <path
                                                fillRule="evenodd"
                                                clipRule="evenodd"
                                                d="M146.71 94.1899C120.23 104.17 77.8899 115.32 35.2699 106.7C27.2099 105.07 21.9999 97.2099 23.6199 89.1399C25.2499 81.0699 33.0999 75.8499 41.1599 77.4799C98.4899 89.0699 158.85 56.2799 159.46 55.9499C166.66 51.9799 175.71 54.5899 179.68 61.7899C183.65 68.9899 181.06 78.0399 173.88 82.0299C172.81 82.6199 162.62 88.1899 146.7 94.1899H146.71Z"
                                                fill="#F05F23"
                                            />
                                            <path
                                                fillRule="evenodd"
                                                clipRule="evenodd"
                                                d="M185.4 109.56C185.4 109.56 185.4 109.56 185.39 109.56C185.39 109.56 185.39 109.56 185.4 109.56ZM185.38 109.58H185.36C185.36 109.58 185.37 109.58 185.38 109.58ZM13.0799 147.9C4.93989 146.75 -0.740095 139.22 0.409905 131.06C1.55991 122.91 9.07991 117.23 17.2299 118.38C117.98 132.57 183.35 109.76 187.64 108.18C193.95 105 201.81 106.69 206.21 112.54C211.16 119.12 209.84 128.46 203.27 133.41C202.03 134.35 199.44 136.3 184.54 140.37C176.61 142.54 163.54 145.65 146.34 148.2C117.19 152.52 70.4099 155.98 13.0799 147.91V147.9Z"
                                                fill="#F05F23"
                                            />
                                            <path
                                                d="M449.89 138.45L450.56 141.01L451.2 138.45L456.26 124.18H461.44L453.44 145.94H447.39L439.39 124.18H444.83L449.88 138.45H449.89Z"
                                                fill="currentColor"
                                            />
                                            <path d="M465.18 124.18H470.3V145.94H465.18V124.18Z" fill="currentColor" />
                                            <path
                                                d="M491.74 145.94L491.29 143.51C489.98 145.49 487.8 146.45 485.21 146.45C479.1 146.45 475.1 142.13 475.1 135.09C475.1 128.05 479.1 123.67 485.66 123.67C490.33 123.67 494.3 126.2 495.23 131.16H489.85C489.24 129.02 487.71 127.86 485.53 127.86C482.23 127.86 480.35 130.58 480.35 135.09C480.35 139.6 482.33 142.26 485.69 142.26C488.03 142.26 489.98 140.98 490.33 138.04H486.17V134.17H495.22V145.95H491.73L491.74 145.94Z"
                                                fill="currentColor"
                                            />
                                            <path
                                                d="M500.65 124.18H506.06L512.94 135.6L514.6 139.06L514.34 124.18H519.46V145.94H514.05L507.17 134.52L505.51 131.03L505.77 145.94H500.65V124.18Z"
                                                fill="currentColor"
                                            />
                                            <path
                                                d="M530.65 138.38L523.19 124.17H528.92L532.47 131.5L533.4 134L534.3 131.5L537.82 124.17H543.29L535.8 138.38V145.93H530.65V138.38Z"
                                                fill="currentColor"
                                            />
                                            <path
                                                d="M557.96 141.87H549.42L547.98 145.93H542.83L550.77 124.17H556.91L564.88 145.93H559.41L557.97 141.87H557.96ZM550.82 137.94H556.55L554.34 131.67L553.7 129.21L553.03 131.67L550.82 137.94Z"
                                                fill="currentColor"
                                            />
                                            <path
                                                d="M568.61 124.18H577.09C582.47 124.18 585.79 126.9 585.79 131.48C585.79 136.06 582.43 138.84 577.15 138.84H573.73V145.94H568.61V124.18ZM573.73 128.24V134.77H576.87C579.37 134.77 580.52 133.46 580.52 131.51C580.52 129.56 579.3 128.25 577 128.25H573.74L573.73 128.24Z"
                                                fill="currentColor"
                                            />
                                            <path
                                                d="M601.87 141.87H593.33L591.89 145.93H586.74L594.68 124.17H600.82L608.79 145.93H603.32L601.88 141.87H601.87ZM594.73 137.94H600.46L598.25 131.67L597.61 129.21L596.94 131.67L594.73 137.94Z"
                                                fill="currentColor"
                                            />
                                            <path
                                                d="M612.52 124.18H617.93L624.81 135.6L626.47 139.06L626.21 124.18H631.33V145.94H625.92L619.04 134.52L617.38 131.03L617.64 145.94H612.52V124.18Z"
                                                fill="currentColor"
                                            />
                                            <path
                                                d="M644.46 124.18H652.94C658.32 124.18 661.64 126.9 661.64 131.48C661.64 136.06 658.28 138.84 653 138.84H649.58V145.94H644.46V124.18ZM649.58 128.24V134.77H652.72C655.22 134.77 656.37 133.46 656.37 131.51C656.37 129.56 655.15 128.25 652.85 128.25H649.59L649.58 128.24Z"
                                                fill="currentColor"
                                            />
                                            <path
                                                d="M674.43 138.45L675.1 141.01L675.74 138.45L680.8 124.18H685.98L677.98 145.94H671.93L663.93 124.18H669.37L674.43 138.45Z"
                                                fill="currentColor"
                                            />
                                            <path
                                                d="M695.9 128.37H689.15V124.18H707.8V128.37H701.05V145.94H695.9V128.37Z"
                                                fill="currentColor"
                                            />
                                            <path d="M709.05 140.79H714.17V145.94H709.05V140.79Z" fill="currentColor" />
                                            <path
                                                d="M726.88 124.18H732V141.78H741.57V145.94H726.88V124.18Z"
                                                fill="currentColor"
                                            />
                                            <path
                                                d="M748.24 128.37H741.49V124.18H760.15V128.37H753.4V145.94H748.25V128.37H748.24Z"
                                                fill="currentColor"
                                            />
                                            <path
                                                d="M764.14 124.18H772.49C779.37 124.18 783.66 128.31 783.66 135.09C783.66 141.87 779.37 145.94 772.49 145.94H764.14V124.18ZM778.41 135.09C778.41 130.84 776.23 128.34 772.49 128.34H769.26V141.78H772.49C776.23 141.78 778.41 139.32 778.41 135.09Z"
                                                fill="currentColor"
                                            />
                                            <path d="M787.31 140.79H792.43V145.94H787.31V140.79Z" fill="currentColor" />
                                        </svg>
                                    </NavLink>
                                    <button
                                        className="text-red-600 text-3xl hover:text-red-400 duration-300 rounded-lg"
                                        onClick={handleModalClose}
                                    >
                                        <MdCancel size={26} />
                                    </button>
                                </div>
                                <ul className='flex flex-col'>
                                    <MenuComponent onClick={handleModalClose} to={'/'} name={"Contacts"} icon={<MenuSectionIcon />} isActive={false} />
                                    {role === "India" && <MenuComponent onClick={handleModalClose} to={'/users'} name={"Users"} icon={<MenuSectionIcon />} isActive={false} />}
                                    <MenuComponent onClick={handleModalClose} to={'/career'} name={"Career Master"} icon={<MenuSectionIcon />} isActive={false} />
                                    <MenuComponent onClick={handleModalClose} to={'/career-forms'} name={"Career Forms"} icon={<MenuSectionIcon />} isActive={false} />
                                    <MenuComponent onClick={handleModalClose} to={'/service'} name={"Service Master"} icon={<MenuSectionIcon />} isActive={false} />
                                    <MenuComponent onClick={handleModalClose} to={'/package'} name={"Package Master"} icon={<MenuSectionIcon />} isActive={false} />
                                </ul>
                            </nav>
                        </Modal.Body>
                    </motion.div>
                </Modal>
            )}
        </div>
    );
};

export default Header;
