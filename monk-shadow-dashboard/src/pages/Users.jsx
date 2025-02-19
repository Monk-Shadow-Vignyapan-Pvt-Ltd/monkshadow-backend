import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import Modal from 'react-modal';
import 'react-toastify/dist/ReactToastify.css';
import { UploadIcon } from '../components/Icons/UploadIcon';
import DataTable from 'react-data-table-component';
import { API_BASE_URL } from '../config/constant.js';
import { EditIcon } from '../components/Icons/EditIcon.jsx';
import { MdOutlineDelete } from 'react-icons/md';
import { ShowPasswordIcon } from '../components/Icons/ShowPasswordIcon';
import { useRoles } from '../RolesContext';
import AccessDenied from '../components/AccessDenied.jsx';
import { SearchIcon } from '../components/Icons/SearchIcon.jsx';
import { FaPlus } from 'react-icons/fa6';
import { FaCheck } from 'react-icons/fa';
import AddCenter from "../Modals/AddCenter.jsx";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const Users = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [avatar, setAvatar] = useState(null);
    const [file, setFile] = useState(null);
    const [users, setUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [currentSection, setCurrentSection] = useState(null);
    const [country,setCountry] = useState('');
    const [countryList,setCountryList] = useState(["India","Canada"]);
    const [isLoading, setIsLoading] = useState(true);
    


    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isTableDataOpen, setIsTableDataOpen] = useState(true);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [filteredUsersList, setFilteredUsersList] = useState([]);
    const [originalTotalPages, setOriginalTotalPages] = useState(0);
    const [isSearchLoading, setIsSearchLoading] = useState(true);


    const fetchUsers = async (page) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/auth/getUsers?page=${page}`);
            setUsers(response.data.users);
            setFilteredUsersList(response.data.users);
            setOriginalTotalPages(response.data.pagination.totalPages)
            setTotalPages(response.data.pagination.totalPages);
            setIsLoading(false)
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to fetch users.');
        }
    };

    useEffect(() => {
        fetchUsers(currentPage);
    }, [currentPage]);

    const fetchData = async (query) => {
        if (query && query.trim()) {
            setSearchQuery(query);
            setIsSearchLoading(false);
            try {
                const response = await axios.post(`${API_BASE_URL}/auth/searchUsers/?search=${query}`);
                setFilteredUsersList(response.data.users)
                setCurrentPage(1);
                setTotalPages(1);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsSearchLoading(true);
            }
        } else {
            setSearchQuery('');
            setFilteredUsersList(users)
            setCurrentPage(1);
            setTotalPages(originalTotalPages);
        }

    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };


    const openModal = (user = null) => {
        setEditingUser(user);
        setEmail(user ? user.email : '');

        setPassword('');
        setUsername(user ? user.username : '');
        setAvatar(user ? user.avatar : null);
        setCountry(user ? user.country : "India");
        user ? decodeBase64Image(user.avatar, setFile) : setFile(null);
        // setIsModalOpen(true);

        setIsFormOpen(true);

        // Check screen width and toggle states accordingly
        if (window.innerWidth < 1024) {
            setIsTableDataOpen(false); // Hide table for smaller screens
        }

    };


    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                // Always show the table on larger screens
                setIsTableDataOpen(true);
            } else {
                // On smaller screens, ensure only the active view (table/form) is visible
                if (isFormOpen) {
                    setIsTableDataOpen(false);
                } else {
                    setIsTableDataOpen(true);
                }
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isFormOpen]); // Dependency ensures this runs when `isFormOpen` changes


    const decodeBase64Image = (base64Image, setFileFunction) => {
        try {
            // Check for and remove the base64 prefix (JPEG or PNG)
            const base64PrefixJpeg = 'data:image/jpeg;base64,';
            const base64PrefixPng = 'data:image/png;base64,';

            let mimeType = '';
            if (base64Image.startsWith(base64PrefixJpeg)) {
                base64Image = base64Image.slice(base64PrefixJpeg.length);
                mimeType = 'image/jpeg';
            } else if (base64Image.startsWith(base64PrefixPng)) {
                base64Image = base64Image.slice(base64PrefixPng.length);
                mimeType = 'image/png';
            } else {
                throw new Error("Unsupported image type");
            }

            // Decode base64 string
            const byteCharacters = atob(base64Image); // Decode base64 string
            const byteArrays = [];

            // Convert the binary data into an array of bytes
            for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
                const slice = byteCharacters.slice(offset, Math.min(offset + 1024, byteCharacters.length));
                const byteNumbers = new Array(slice.length);
                for (let i = 0; i < slice.length; i++) {
                    byteNumbers[i] = slice.charCodeAt(i);
                }
                byteArrays.push(new Uint8Array(byteNumbers));
            }

            // Create a Blob from the binary data
            const blob = new Blob(byteArrays, { type: mimeType });

            // Create a File object from the Blob
            const file = new File([blob], "image." + mimeType.split("/")[1], { type: mimeType });

            // Set the file state using the provided setter function
            setFileFunction(file);
        } catch (error) {
            console.error("Error decoding base64 image:", error);
        }
    };

    const closeModal = () => {
        // setIsModalOpen(false);

        setIsFormOpen(false);

        if (window.innerWidth < 1024) {
            setIsTableDataOpen(true); // Hide table for smaller screens
        }

        setEditingUser(null);
    };


    const handleUploadClick = async () => {
        setIsLoading(true);
        if (!email || !username || !password) {
            setIsLoading(false);
            return toast.warn('Please fill out all required fields.');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setIsLoading(false);
            toast.error('Please enter a valid email address.');
            return;
        }

        setUploading(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
            const data = {
                email,
                username,
                password: password || undefined,
                country,
                avatar: file ? reader.result : null,
            
            };


            try {
                const endpoint = editingUser
                    ? `${API_BASE_URL}/auth/updateUser/${editingUser._id}`
                    : `${API_BASE_URL}/auth/addUser`;

                await axios.post(endpoint, data, {
                    headers: { 'Content-Type': 'application/json' },
                });
                toast.success(editingUser ? 'User updated successfully!' : 'User added successfully!');
                //setCenterId(selectedCenter)
                fetchUsers();
                setIsLoading(false);
                closeModal();
            } catch (error) {
                console.error('Error uploading user:', error);
                toast.error('Failed to upload user.');
            } finally {
                setUploading(false);
            }
        };

        if (file) {
            reader.readAsDataURL(file);
        } else {
            reader.onloadend();
        }
    };

    const handleDelete = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                setIsLoading(true);
                await axios.delete(`${API_BASE_URL}/auth/deleteUser/${userId}`);
                toast.success('User deleted successfully!');
                fetchUsers();
                setIsLoading(false)
            } catch (error) {
                console.error('Error deleting user:', error);
                toast.error('Failed to delete user.');
            }
        }
    };

    // const columns = [
    //     {
    //         name: 'ID',
    //         width: "150px",
    //         selector: (row, index) => row._id.slice(-4),
    //         sortable: true,
    //     },
    //     {
    //         name: 'Email',
    //         selector: row => row.email,
    //         sortable: true,
    //     },
    //     {
    //         name: 'Username',
    //         selector: row => row.username,
    //         sortable: true,
    //     },
    //     {
    //         name: 'Role',
    //         selector: row => row.role,
    //         sortable: true,
    //     },
    //     {
    //         name: 'Center',
    //         selector: row => (
    //             row.centerId ? centersList.find(center => center._id === row.centerId).centerName : "No Center"),
    //     },
    //     {
    //         name: 'Avatar',
    //         selector: row => (
    //             row.avatar ? (
    //                 <img
    //                     src={row.avatar}
    //                     alt="Image"
    //                     className="w-10 h-10 object-cover border-2 border-lightAccent rounded-md shadow-sm"
    //                 />
    //             ) : (
    //                 <div>No Image</div>
    //             )
    //         ),
    //         sortable: true
    //     },
    //     ...(actionRoles?.actions?.edit || actionRoles?.actions?.delete
    //         ? [
    //             {
    //                 name: "Actions",
    //                 width: "140px",
    //                 cell: (row) => (
    //                     <div className="flex gap-4">
    //                         {actionRoles?.actions?.edit && (
    //                             <button onClick={() => openModal(row)}>
    //                                 <EditIcon width={20} height={20} fill={"#444050"} />
    //                             </button>
    //                         )}
    //                         {actionRoles?.actions?.delete && (
    //                             <button onClick={() => handleDelete(row._id)}>
    //                                 <MdOutlineDelete size={26} fill="#F05F23" />
    //                             </button>
    //                         )}
    //                     </div>
    //                 ),
    //             },
    //         ]
    //         : []),
    // ];

    // const customStyles = {
    //     headCells: {
    //         style: {
    //             color: "var(--accent)",
    //             fontWeight: "700",
    //             fontSize: "14px"
    //         },
    //     },
    //     cells: {
    //         style: {
    //             paddingTop: '8px',
    //             paddingBottom: '8px',
    //         },
    //     },
    // };

    // // const filteredUsers = users.filter(user => {
    // //     const center = centersList.find(center => center?._id === user?.centerId);
    // //     return (
    // //         user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    // //         user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    // //         (center ? center.centerName.toLowerCase().includes(searchQuery.toLowerCase()) : "No Center".toLowerCase().includes(searchQuery.toLowerCase()))
    // //     )
    // // }
    // // );

    // const actionRoles = {
    //     actions: {
    //         edit: true,
    //         delete: true
    //     }
    // };


    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    return (
        <>
            
                {isLoading  ?
                    <div className='w-full flex-1 flex justify-center items-center bg-cardBg'>
                        <i className="loader" />
                    </div>
                    :
                    <>
                        <div className="flex-1 h-full w-full flex overflow-hidden">
                            {isTableDataOpen && (

                                <div className={`mx-auto w-full h-full flex flex-col ${isFormOpen ? "flex-1" : "flex-1"} bg-cardBg p-5 gap-6 overflow-y-auto`}>
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center border-2 px-3 py-2 rounded-lg">
                                            <label htmlFor="search-category"><SearchIcon width={18} height={18} fill={"none"} /></label>
                                            <input id='search-category' value={searchQuery} onChange={(e) => { fetchData(e.target.value) }} className="ms-2 w-full sm:w-60 bg-transparent text-sm p-0 focus:outline-0" type="text" placeholder="Search by email or username" />
                                        </div>
                                        
                                            <button onClick={() => openModal()} className="btnLinear icon-xl h-full aspect-square flex items-center justify-center rounded-lg duration-300">
                                                <FaPlus size={18} fill={"#ffffff"} />
                                            </button> 
                                    </div>

                                    
                                        <>
                                            {isSearchLoading &&
                                                <div className={`flex-1 w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ${isFormOpen ? "lg:grid-cols-1 2xl:grid-cols-2" : "lg:grid-cols-3 2xl:grid-cols-4"} gap-4 overflow-y-auto`}>
                                                    {/* <DataTable
                                                columns={columns}
                                                data={filteredUsers}
                                                pagination
                                                highlightOnHover
                                                // pointerOnHover
                                                // striped
                                                customStyles={customStyles}
                                            /> */}

                                                    {filteredUsersList.map((users) => (
                                                        <div key={users._id} className="border-2 h-fit rounded-lg relative flex flex-col gap-3 p-3">
                                                            <div className="flex flex-col gap-1">
                                                                <span className="font-semibold text-sm">Id</span>
                                                                <span className="text-sm">{users._id.slice(-4)}</span>
                                                            </div>
                                                            <div className="flex flex-col gap-1">
                                                                <span className="font-semibold text-sm">Users Name</span>
                                                                <span className="text-sm">{users.username}</span>
                                                            </div>
                                                            <div className="flex flex-col gap-1">
                                                                <span className="font-semibold text-sm">Users Email</span>
                                                                <span className="text-sm">{users.email}</span>
                                                            </div>
                                                           
                                                            <div className="flex absolute top-2.5 right-2 gap-2">
                                                                
                                                                    <button onClick={() => openModal(users)}>
                                                                        <EditIcon width={16} height={16} fill={"#444050"} />
                                                                    </button> 
                                                                
                                                                    <button onClick={() => handleDelete(users._id)}>
                                                                        <MdOutlineDelete size={23} fill='#F05F23' />
                                                                    </button>
                                                            </div>
                                                        </div>
                                                    ))}

                                                </div>}
                                        </>
                                        
                                    <div className="flex justify-center mt-2">
                                        <button
                                            className="font-Outfit px-4 py-1 mr-4 rounded-md text-primary bg-gradient-to-r from-gradientStart to-gradientEnd hover:to-gradientStart duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400"
                                            disabled={currentPage === 1}
                                            onClick={() => handlePageChange(currentPage - 1)}
                                        >
                                            Previous
                                        </button>
                                        <button
                                            className="font-Outfit px-4 py-1 rounded-md text-primary bg-gradient-to-r from-gradientStart to-gradientEnd hover:to-gradientStart duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400"
                                            disabled={currentPage === totalPages}
                                            onClick={() => handlePageChange(currentPage + 1)}
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}

                            {isFormOpen && (
                                <form className="bg-cardBg border-l-2 p-4 lg:max-w-100 flex flex-col gap-4 overflow-y-auto flex-1">
                                    <div className="w-full flex items-center justify-between gap-3">
                                        <h2 className="text-xl font-bold text-accent">
                                            {editingUser ? 'Edit User' : 'Add User'}
                                        </h2>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button onClick={closeModal} className="icon-xl flex items-center justify-center rounded-lg bg-dangerRed hover:bg-dangerRed/75 duration-300">
                                                <FaPlus className="rotate-45" size={18} fill={"#ffffff"} />
                                            </button>
                                            <button
                                                onClick={handleUploadClick}
                                                disabled={uploading}
                                                className={`icon-xl flex items-center justify-center rounded-lg duration-300 ${uploading
                                                    ? 'bg-gray-400 cursor-not-allowed'
                                                    : editingUser
                                                        ? 'bg-green-600 hover:bg-green-700'
                                                        : 'bg-green-600 hover:bg-green-700'
                                                    }`}
                                            >
                                                {/* {uploading ? 'Uploading...' : editingUser ? 'Update User' : 'Add User'} */}
                                                <FaCheck size={18} fill={"#ffffff"} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-4 flex-1 overflow-y-auto">
                                        <div className="col-span-12 sm:col-span-6 flex flex-col gap-1">
                                            <label htmlFor="username" className="block text-sm font-semibold required">
                                                User Name
                                            </label>
                                            <input
                                                id="username"
                                                type="text"
                                                value={username}
                                                placeholder="Enter User Name"
                                                onChange={(e) => setUsername(e.target.value)}
                                                className="bg-mainBg placeholder:text-secondaryText focus:outline-accent text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
                                            />
                                        </div>

                                        <div className="col-span-12 sm:col-span-6 flex flex-col gap-1">
                                            <label htmlFor="question" className="block text-sm font-semibold required">
                                                Email
                                            </label>
                                            <input
                                                id="email"
                                                type="text"
                                                value={email}
                                                placeholder="Enter Email"
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="bg-mainBg placeholder:text-secondaryText focus:outline-accent text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
                                            />
                                        </div>

                                        <div className="col-span-12 sm:col-span-6 flex flex-col gap-1">
                                            <label htmlFor="password" className="block text-sm font-semibold required">
                                                Password
                                            </label>
                                            <div className="flex items-center bg-mainBg rounded-lg px-3 py-2 focus-within:outline focus-within:outline-accent -outline-offset-2">
                                                <input
                                                    id="password"
                                                    value={password}
                                                    required
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="font-input-style flex-1 text-sm min-w-0 bg-mainBg placeholder:text-secondaryText focus:outline-none"
                                                    type={showPassword ? 'text' : 'password'}
                                                    placeholder="Enter your Password"
                                                />
                                                <button onClick={() => setShowPassword((prev) => !prev)}><ShowPasswordIcon width={16} height={16} fill="none" className="cursor-pointer" /></button>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-1">
                                                                    <label htmlFor="country" className="block text-sm font-semibold">
                                                                        Select Country
                                                                    </label>
                                                                    <div className="flex items-center gap-2">
                                                                        <select
                                                                            name="pageName"
                                                                            value={country}
                                                                            onChange={(e) => {
                                                                                setCountry(e.target.value);
                                                                            }}
                                                                            className="relative w-full cursor-default font-input-style text-sm rounded-lg px-3 py-2 bg-mainBg placeholder:text-secondaryText focus:ring-1 focus:outline-accent focus:ring-accent"
                                                                            required
                                                                        >
                                                                            <option disabled value="">Select Country</option>
                                                                            {countryList.map((country, index) => (
                                                                                <option key={index} value={country}>
                                                                                    {country}
                                                                                </option>
                                                                            ))}
                                                                        </select>
                                                                        {/* <button onClick={(e) => openStateModal(e)} className="flex items-center justify-center p-2 rounded-lg bg-mainBg hover:bg-lightGray">
                                                                            <FaPlus size={18} fill="#2dafbe" />
                                                                        </button> */}
                                                                    </div>
                                                                </div>

                                        <div className="col-span-12 flex flex-col gap-1">
                                            <label htmlFor="testimonialImage" className="block text-sm font-semibold">
                                                User Image
                                            </label>
                                            <div
                                                className={`upload-box w-full border-2 border-dashed rounded-lg flex justify-center items-center bg-mainBg ${dragging ? 'dragging' : ''}`}
                                                onDragEnter={handleDragEnter}
                                                onDragLeave={handleDragLeave}
                                                onDragOver={(e) => e.preventDefault()}
                                                onDrop={handleDrop}
                                            >
                                                {file ? (
                                                    <div className="relative w-full">
                                                        <button
                                                            className="absolute top-3 right-3 bg-red-500 text-white text-xs icon-lg flex items-center justify-center rounded-full shadow-lg hover:bg-red-600"
                                                            onClick={() => setFile(null)} // Clear the file on click
                                                        >
                                                            <FaPlus className="rotate-45 text-mainBg" size={18} />
                                                        </button>
                                                        <img
                                                            src={URL.createObjectURL(file)}
                                                            alt="Preview"
                                                            className="max-h-[300px] w-full object-cover object-top rounded-lg"
                                                        />
                                                        <span className="absolute bottom-0 rounded-b-lg w-full bg-gradient-to-t from-accent to-accent/0 text-cardBg text-center px-2 pt-4 pb-2">{file.name}</span>
                                                    </div>
                                                ) : (
                                                    <div className="upload-prompt h-50 flex flex-col items-center justify-center text-secondaryText">
                                                        <UploadIcon width={24} height={24} fill={'none'} />
                                                        <div className="flex flex-col items-center mt-2">
                                                            <span className="text-md text-secondaryText">Drag and drop</span>
                                                            <span className="text-md text-secondaryText font-semibold">or</span>
                                                            <label className="text-md text-accent font-semibold">
                                                                Browse Image
                                                                <input
                                                                    type="file"
                                                                    onChange={handleFileChange}
                                                                    style={{ display: 'none' }}
                                                                />
                                                            </label>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        

                                    </div>
                                </form>
                            )}
                        </div>

                        {/* <Modal
                            isOpen={isModalOpen}
                            onRequestClose={closeModal}
                            contentLabel="User Modal"
                            className="w-full max-w-[700px] max-h-[96vh] overflow-auto bg-cardBg z-50 m-4 p-6 rounded-2xl flex flex-col gap-4"
                            overlayClassName="overlay"
                        >


                        </Modal> */}

                    </>}
            <ToastContainer />
        </>
    );
};

Modal.setAppElement('#root');
export default Users;
