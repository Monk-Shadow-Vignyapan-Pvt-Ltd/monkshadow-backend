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
import { motion } from "framer-motion";
import { MdCancel } from 'react-icons/md';
import MenuSectionIcon from '../components/MenuSectionIcon.jsx';

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


    const modalVariants = {
        hidden: { opacity: 0, x: "100%" },
        visible: { opacity: 1, x: "0%", transition: { duration: 0.4, ease: "easeInOut" } },
        exit: { opacity: 0, x: "100%", transition: { duration: 0.4, ease: "easeInOut" } },
    };

    const handleModalOpen = () => {
        setOpenModal(true);
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

    // useEffect(() => {
    //     const fetchUserData = async () => {
    //         let token = localStorage.getItem('auth-token');
    //         try {
    //             const response = await axios.get(
    //                 `${API_BASE_URL}/auth/getUser`,
    //                 { headers: { 'x-auth-token': token } }
    //               );
    //             setUser(response.data); // Store the user data in state
    //         } catch (error) {
    //             console.error('Error fetching user data:', error);
    //         }
    //     };

    //     fetchUserData();
    // }, []);

    return (
        <div className="top-0 border-b-2 dark:border-[#2b2b2b] dark:bg-[#141414] to-mainBg/0 z-40">
            <header className="w-full bg-try app-header px-3 py-2">
                <nav className="main-header flex items-center justify-between lg:justify-end" aria-label="Global">
                    <Link to="/" className="header-logo lg:hidden">
                        {/* <img className="h-10" src={brandLogo} alt="Monk Shadow Black Logo" /> */}
                        <svg
                            className="h-10 w-auto"
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
                        {tokenAvailable ?
                            <>
                                {role === "India" ? <div className="flex space-x-2 mr-2  rounded-lg bg-mainBg dark:bg-black select-none">
                                    <label className="radio flex-1 flex flex-grow items-center justify-center rounded-lg cursor-pointer">
                                        <input
                                            type="radio"
                                            name="country"
                                            defaultValue="india"
                                            className="peer hidden flex-1"
                                            checked={country === "india"}
                                            onChange={() => { setCountry("india"); setSelectedCountry("india"); }}
                                        />
                                        <span className="text-sm flex-1 text-center peer-checked:bg-gradient-to-r peer-checked:bg-accent dark:peer-checked:bg-[#333] peer-checked:text-white peer-checked:font-semibold p-2 rounded-lg transition duration-150 ease-in-out">
                                            India
                                        </span>
                                    </label>
                                    <label className="radio flex-1 flex flex-grow items-center justify-center rounded-lg cursor-pointer">
                                        <input
                                            type="radio"
                                            name="country"
                                            defaultValue="canada"
                                            className="peer hidden flex-1"
                                            checked={country === "canada"}
                                            onChange={() => { setCountry("canada"); setSelectedCountry("canada"); }}
                                        />
                                        <span className="text-sm flex-1 text-center peer-checked:bg-gradient-to-r peer-checked:bg-accent dark:peer-checked:bg-[#333] peer-checked:text-white peer-checked:font-semibold p-2 rounded-lg transition duration-150 ease-in-out">
                                            Canada
                                        </span>
                                    </label>
                                </div> : null}
                            </> : null}
                        <div className="flex items-center gap-3">
                            {tokenAvailable ?
                                <div className="relative" ref={dropdownRef}>
                                    <button onClick={toggleDropdown}>
                                        <ProfilePic Img={users?.find(user => user._id === userId)?.avatar ? users?.find(user => user._id === userId)?.avatar : person1} alt="User Profile" />
                                    </button>
                                    {dropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md z-50">
                                            <div className="px-4 py-2 border-b">
                                                <p className="text-sm font-medium">
                                                    User Name: {users?.find(user => user._id === userId)?.username || 'Unknown User'}
                                                </p>

                                                {/* <p className="text-xs text-gray-500">john.doe@example.com</p> */}
                                            </div>
                                            {tokenAvailable ? <div className="py-2">
                                                {/* <Link
                                            to="/user-details"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={closeDropdown}
                                        >
                                            User Details
                                        </Link> */}
                                                <button
                                                    onClick={() => {
                                                        closeDropdown();
                                                        handleLogout();

                                                    }}
                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    Logout
                                                </button>
                                            </div> : null}
                                        </div>
                                    )}
                                </div> : null}

                            {tokenAvailable ? <button onClick={handleModalOpen} className="lg:hidden">
                                <Menu width={32} height={32} stroke="#333333" />
                            </button> : null}
                        </div>
                    </div>
                </nav>
            </header>


            {tokenAvailable ? <Modal
                show={openModal}
                onClose={handleModalClose}
                ref={modalRef}
            >
                <motion.div
                    variants={modalVariants}
                    initial="hidden"
                    animate={openModal && !isClosing ? "visible" : "hidden"}
                    exit="exit"
                    className="fixed top-0 right-0 h-full bg-mainBg text-secondaryText flex flex-col gap-6 w-full sm:w-96 shadow-lg"
                >
                    <Modal.Body className="flex flex-col p-2 gap-6 shadow-lg transform translate-x-0 transition-transform duration-300">
                        <nav className="flex flex-col flex-1 overflow-auto">
                            <div className="w-full flex items-center justify-between p-4 mb-4">
                                <NavLink onClick={handleModalClose} aria-label='logo-brand' to={'/'}>
                                    <img src={brandLogo} alt="text-logo" className='h-12 object-cover w-auto' />
                                </NavLink>
                                <button
                                    className="text-red-600 text-3xl hover:text-red-400 duration-300 rounded-lg"
                                    onClick={handleModalClose}
                                >
                                    <MdCancel size={26} />
                                </button>
                            </div>
                            <ul className='flex flex-col'>
                                {role === "India" ? <MenuComponent onClick={handleModalClose} to={'/users'} name={"Users"} icon={<MenuSectionIcon />} isActive={false} /> : null}


                                <MenuComponent onClick={handleModalClose} to={'/contacts'} name={"Contacts"} icon={<MenuSectionIcon />} isActive={false} />

                                <MenuComponent onClick={handleModalClose} to={'/career'} name={"Career Master"} icon={<MenuSectionIcon />} isActive={false} />

                                <MenuComponent onClick={handleModalClose} to={'/career-forms'} name={"Career Forms"} icon={<MenuSectionIcon />} isActive={false} />




                            </ul>
                        </nav>
                    </Modal.Body>
                </motion.div>
            </Modal> : null}

        </div>
    );
};

export default Header;
