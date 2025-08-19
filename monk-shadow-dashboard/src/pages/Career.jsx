import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import Modal from 'react-modal';
import 'react-toastify/dist/ReactToastify.css';
import { UploadIcon } from '../components/Icons/UploadIcon';
import DataTable from 'react-data-table-component'; // Import DataTable component
import { API_BASE_URL } from '../config/constant.js';
import Select from 'react-select'
import { SearchIcon } from '../components/Icons/SearchIcon.jsx';
import { EditIcon } from '../components/Icons/EditIcon.jsx';
import { MdOutlineDelete } from 'react-icons/md';
import { useRoles } from '../RolesContext';
import AccessDenied from '../components/AccessDenied.jsx';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { IoIosInformationCircleOutline } from "react-icons/io";
import Editor from '../components/Editor.jsx';
import { FaCheck, FaPlus } from 'react-icons/fa6';
import { NoDataIcon } from "../components/Icons/NoDataIcon.jsx";


Modal.setAppElement("#root");

const Career = () => {
    const [position, setPosition] = useState('');
    const [experience, setExperience] = useState('');
    const [city, setCity] = useState('');
    const [jobType, setJobType] = useState('');
    const [shortDescription, setShortDescription] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [applicationDeadline, setApplicationDeadline] = useState(new Date());
    const [status, setStatus] = useState(false);
    const [careers, setCareers] = useState([]);
    const [editingCareer, setEditingCareer] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isFormOpen, setIsFormOpen] = useState(false); // Changed from isModalOpen

    const [isLoading, setIsLoading] = useState(true)
    const { selectCountry } = useRoles();
    const [isTableDataOpen, setIsTableDataOpen] = useState(true);

    // State to track the current theme
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    // Effect to listen for theme changes
    useEffect(() => {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    const newTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
                    setTheme(newTheme);
                }
            });
        });

        observer.observe(document.documentElement, {
            attributes: true,
        });

        return () => observer.disconnect();
    }, []);


    const fetchCareers = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`${API_BASE_URL}/${selectCountry}/careers/getCareers`);
            setCareers(response.data.careers.reverse());
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching careers:', error);
            toast.error('Failed to fetch careers.');
            setIsLoading(false);
        }
    };
    useEffect(() => {

        fetchCareers();
    }, [selectCountry]);

    const openForm = (career = null) => {
        setEditingCareer(career);
        setPosition(career ? career.position : '');
        setExperience(career ? career.experience : "");
        setCity(career ? career.city : "")
        setJobType(career ? career.jobType : "")
        setShortDescription(career ? career.shortDescription : "")
        setJobDescription(career ? career.jobDescription : "")
        // Format date correctly for input type="date"
        const deadline = career ? new Date(career.applicationDeadline) : new Date();
        const formattedDeadline = deadline.toISOString().split('T')[0];
        setApplicationDeadline(formattedDeadline);

        setStatus(career ? career.status : false)
        setIsFormOpen(true);

        if (window.innerWidth < 1024) {
            setIsTableDataOpen(false);
        }
    };



    const closeForm = () => {
        setIsFormOpen(false);
        setEditingCareer(null);
        if (window.innerWidth < 1024) {
            setIsTableDataOpen(true);
        }
    };

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsTableDataOpen(true);
            } else {
                if (isFormOpen) {
                    setIsTableDataOpen(false);
                } else {
                    setIsTableDataOpen(true);
                }
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isFormOpen]);


    const handleUploadClick = async () => {
        setIsLoading(true);

        if (!position || !experience || !city || !jobType || !shortDescription || !jobDescription || !applicationDeadline) {
            setIsLoading(false);
            return toast.warn('Please fill out all required fields.');
        }

        const data = {
            position,
            experience,
            city, // May be null if no file is provided
            jobType,
            shortDescription,
            jobDescription,
            applicationDeadline,
            status
        };

        try {
            const endpoint = editingCareer
                ? `${API_BASE_URL}/${selectCountry}/careers/updateCareer/${editingCareer._id}`
                : `${API_BASE_URL}/${selectCountry}/careers/addCareer`;

            await axios.post(endpoint, data, {
                headers: { 'Content-Type': 'application/json' },
            });

            toast.success(
                editingCareer
                    ? 'Career updated successfully!'
                    : 'Career added successfully!'
            );

            fetchCareers();
            setIsLoading(false);
            closeForm();
        } catch (error) {
            console.error('Error uploading career:', error);
            toast.error('Failed to upload career.');
            setIsLoading(false);
        }
    };


    const handleDeleteClick = async (id) => {
        if (window.confirm('Are you sure you want to delete this career?')) {
            try {
                setIsLoading(true);
                await axios.delete(`${API_BASE_URL}/${selectCountry}/careers/deleteCareer/${id}`);
                toast.success('career deleted successfully!');
                fetchCareers()
                setIsLoading(false);
            } catch (error) {
                console.error('Error deleting career:', error);
                toast.error('Failed to delete career.');
                setIsLoading(false);
            }
        }
    };

    // Columns for the DataTable
    const columns = [
        {
            name: 'ID',

            selector: (row, index) => row._id.slice(-4),
            sortable: true,
        },
        {
            name: 'Position',

            selector: row => row.position,
            sortable: true,
        },
        {
            name: 'Experience',

            selector: row => row.experience,
            sortable: true,
        },
        {
            name: 'Job Type',

            selector: row => row.jobType,
            sortable: true,
        },
        {
            name: 'Application Deadline',

            selector: row => new Date(row.applicationDeadline).toLocaleDateString(),
            sortable: true,
        },
        {
            name: 'Actions',

            cell: row => (
                <div className="flex gap-4">
                    <button
                        onClick={() => openForm(row)}
                    >
                        <EditIcon width={20} height={20} fill={"currentColor"} />
                    </button>
                    <button
                        onClick={() => handleDeleteClick(row._id)}
                    >
                        <MdOutlineDelete size={26} fill='#ff2023' />
                    </button>
                    <div id={`tooltip-${row._id}`} className="tooltip-wrapper">
                        <IoIosInformationCircleOutline size={26} fill={"currentColor"} />
                    </div>
                    <ReactTooltip
                        anchorId={`tooltip-${row._id}`}
                        place="top"
                        content={
                            <div>
                                <div>
                                    <strong>Created At:</strong> {new Date(row.createdAt).toLocaleString()}
                                </div>
                                <div>
                                    <strong>Updated At:</strong> {new Date(row.updatedAt).toLocaleString()}
                                </div>
                            </div>
                        }
                    />
                </div>
            ),
        }
    ];

    const customStyles = useMemo(() => {
        const isDark = theme === 'dark';
        return {
            headCells: {
                style: {
                    // color: "var(--accent)",
                    fontWeight: "700",
                    fontSize: "14px",
                    backgroundColor: isDark ? '#1a1a1a' : '#F8F7FA',
                    color: isDark ? '#e6e6e6' : '#444050',
                },
            },
            cells: {
                style: {
                    paddingTop: '8px',
                    paddingBottom: '8px',
                    backgroundColor: isDark ? '#141414' : '#ffffff',
                    color: isDark ? '#e6e6e6' : '#444050',
                },
            },
            headRow: {
                style: {
                    borderBottomColor: isDark ? '#2b2b2b' : '#e0e0e0',
                },
            },
            rows: {
                style: {
                    '&:not(:last-of-type)': {
                        borderBottomColor: isDark ? '#2b2b2b' : '#e0e0e0',
                    },
                },
                highlightOnHoverStyle: {
                    backgroundColor: isDark ? '#2b2b2b' : '#f2f2f2',
                    color: isDark ? '#e6e6e6' : '#000000',
                },
            },
            pagination: {
                style: {
                    backgroundColor: isDark ? '#141414' : '#ffffff',
                    color: isDark ? '#e6e6e6' : '#444050',
                    borderTopColor: isDark ? '#2b2b2b' : '#e0e0e0',
                },
            },
            table: {
                style: {
                    backgroundColor: isDark ? '#141414' : '#ffffff',
                },
            },
            tableWrapper: {
                style: {
                    backgroundColor: isDark ? '#141414' : '#ffffff',
                },
            },
        };
    }, [theme]);

    const filteredCareers = careers.filter(career =>
        career.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        career.experience.toLowerCase().includes(searchQuery.toLowerCase()) ||
        career.jobType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        career.city.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>

            {isLoading ?
                <div className='w-full flex-1 flex justify-center items-center bg-cardBg dark:bg-[#141414] dark:text-[#e6e6e6] duration-200'>
                    <i className="loader" />
                </div>
                :
                <div className="flex-1 h-full w-full flex overflow-hidden">
                    {isTableDataOpen && (
                        <div className={`mx-auto w-full flex flex-col flex-1 duration-200 bg-cardBg dark:bg-[#141414] dark:text-[#e6e6e6] p-5 gap-6 overflow-y-auto`}>

                            <div className={`w-full ${isFormOpen && "lg:flex-col lg:items-start xl:flex-row xl:items-center"} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
                                <h3 className="text-xl font-bold text-accent dark:text-[#e6e6e6]">All Careers</h3>
                                <div className={`flex items-center gap-3 w-full sm:w-auto ${isFormOpen && "lg:w-full xl:w-auto"}`}>
                                    <div className={`flex-1 sm:max-w-fit ${isFormOpen && "lg:flex-1 lg:max-w-none"} flex items-center dark:bg-[#1a1a1a] focus-visible:border-[#f05f23] dark:focus-within:border-[#7b3517] border-2 dark:border-[#2b2b2b] px-3 py-2 rounded-lg`}>
                                        <label htmlFor="search-careers"><SearchIcon width={18} height={18} fill={"none"} /></label>
                                        <input id='search-careers' value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`ms-2 w-full ${isFormOpen ? "sm:w-full xl:w-60" : "sm:w-60"} bg-transparent text-sm p-0 focus:outline-0`} type="text" placeholder="Search by Name or Description" />
                                    </div>
                                    <button
                                        onClick={() => openForm()}
                                        className="bg-accent hover:bg-accent/70 duration-300 w-8 h-8 flex aspect-square items-center justify-center text-sm font-semibold text-cardBg rounded-lg"
                                    >
                                        {/* Add Career */}
                                        <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 48 48"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={5} d="m24.06 10l-.036 28M10 24h28"></path></svg>
                                    </button>
                                </div>
                            </div>

                            <div className={`overflow-hidden border-2 dark:border-[#2b2b2b] rounded-lg ${isFormOpen ? "lg:w-[calc(100vw-300px-400px)]" : "lg:w-[calc(100vw-300px)]"}`}>
                                {/* DataTable Component */}
                                <DataTable
                                    columns={columns}
                                    data={filteredCareers}
                                    pagination
                                    highlightOnHover
                                    pointerOnHover
                                    // striped
                                    customStyles={customStyles}
                                />

                            </div>
                        </div>
                    )}

                    {isFormOpen && (
                        <div className="bg-cardBg dark:bg-[#141414] dark:text-[#e6e6e6] border-l-2 dark:border-[#2b2b2b] p-4 lg:max-w-100 flex flex-col gap-4 overflow-y-auto flex-1">
                            <div className="flex items-center justify-between w-full">
                                <h2 className="text-xl font-bold text-accent dark:text-[#e6e6e6]">
                                    {editingCareer ? 'Edit Career' : 'Add Career'}
                                </h2>
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={closeForm} className="icon-xl flex items-center justify-center rounded-lg bg-dangerRed hover:bg-dangerRed/75 dark:bg-[#4d1a19] duration-300">
                                        <FaPlus className="rotate-45" size={18} fill={"#ffffff"} />
                                    </button>
                                    <button
                                        onClick={handleUploadClick}
                                        className={`icon-xl flex items-center justify-center rounded-lg duration-300 ${editingCareer
                                            ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-950'
                                            : 'bg-green-600 hover:bg-green-700 dark:bg-[#005239]'
                                            }`}
                                    >
                                        {/* {editingCareer ? 'Update Career' : 'Add Career'} */}
                                        <FaCheck size={14} fill={"#ffffff"} />
                                    </button>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label htmlFor="position" className="block text-sm font-semibold required">
                                    Position
                                </label>
                                <input
                                    id="position"
                                    type="text"
                                    value={position}
                                    placeholder="Enter Position"
                                    onChange={(e) => setPosition(e.target.value)}
                                    className="bg-mainBg placeholder:text-secondaryText dark:bg-black border-2 border-[#c5c5c5] dark:border-[#2b2b2b] focus-visible:border-[#f05f23] dark:focus-visible:border-[#7b3517] focus-visible:outline-none text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label htmlFor="experience" className="block text-sm font-semibold required">
                                    Experience
                                </label>
                                <input
                                    id="experience"
                                    type="text"
                                    value={experience}
                                    placeholder="Enter Experience"
                                    onChange={(e) => setExperience(e.target.value)}
                                    className="bg-mainBg placeholder:text-secondaryText dark:bg-black border-2 border-[#c5c5c5] dark:border-[#2b2b2b] focus-visible:border-[#f05f23] dark:focus-visible:border-[#7b3517] focus-visible:outline-none text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label htmlFor="city" className="block text-sm font-semibold required">
                                    City
                                </label>
                                <input
                                    id="city"
                                    type="text"
                                    value={city}
                                    placeholder="Enter City"
                                    onChange={(e) => setCity(e.target.value)}
                                    className="bg-mainBg placeholder:text-secondaryText dark:bg-black border-2 border-[#c5c5c5] dark:border-[#2b2b2b] focus-visible:border-[#f05f23] dark:focus-visible:border-[#7b3517] focus-visible:outline-none text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label htmlFor="jobType" className="block text-sm font-semibold required">
                                    Job Type
                                </label>
                                <input
                                    id="jobType"
                                    type="text"
                                    value={jobType}
                                    placeholder="Enter Job Type"
                                    onChange={(e) => setJobType(e.target.value)}
                                    className="bg-mainBg placeholder:text-secondaryText dark:bg-black border-2 border-[#c5c5c5] dark:border-[#2b2b2b] focus-visible:border-[#f05f23] dark:focus-visible:border-[#7b3517] focus-visible:outline-none text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label htmlFor="applicationDeadline" className="block text-sm font-semibold required">
                                    Application Deadline
                                </label>
                                <input
                                    id="applicationDeadline"
                                    type="date"
                                    value={applicationDeadline}

                                    onChange={(e) => setApplicationDeadline(e.target.value)}
                                    className="bg-mainBg placeholder:text-secondaryText dark:bg-black border-2 border-[#c5c5c5] dark:border-[#2b2b2b] focus-visible:border-[#f05f23] dark:focus-visible:border-[#7b3517] focus-visible:outline-none text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label htmlFor="applicationDeadline" className="block text-sm font-semibold required">
                                    Status
                                </label>
                                <div className="flex flex-1 space-x-2 rounded-lg bg-mainBg dark:bg-black select-none">
                                    <label className="radio flex-1 flex flex-grow items-center justify-center rounded-lg cursor-pointer">
                                        <input
                                            type="radio"
                                            name="status"
                                            defaultValue="on"
                                            className="peer hidden flex-1"
                                            checked={status}
                                            onChange={() => setStatus(true)}
                                        />
                                        <span className="text-sm flex-1 text-center peer-checked:bg-gradient-to-r peer-checked:bg-accent peer-checked:text-white peer-checked:font-semibold p-2 rounded-lg transition duration-150 ease-in-out">
                                            On
                                        </span>
                                    </label>
                                    <label className="radio flex-1 flex flex-grow items-center justify-center rounded-lg cursor-pointer">
                                        <input
                                            type="radio"
                                            name="status"
                                            defaultValue="off"
                                            className="peer hidden flex-1"
                                            checked={!status}
                                            onChange={() => setStatus(false)}
                                        />
                                        <span className="text-sm flex-1 text-center peer-checked:bg-gradient-to-r peer-checked:bg-accent peer-checked:text-white peer-checked:font-semibold p-2 rounded-lg transition duration-150 ease-in-out">
                                            Off
                                        </span>
                                    </label>
                                </div>
                            </div>



                            <div className="flex flex-col gap-1">
                                <label htmlFor="description" className="block text-sm font-semibold required">
                                    Short Description
                                </label>
                                <textarea
                                    id="description"
                                    value={shortDescription}
                                    onChange={(e) => setShortDescription(e.target.value)}
                                    placeholder="Enter Short Description"
                                    style={{ minHeight: "100px" }}
                                    className="bg-mainBg placeholder:text-secondaryText dark:bg-black border-2 border-[#c5c5c5] dark:border-[#2b2b2b] focus-visible:border-[#f05f23] dark:focus-visible:border-[#7b3517] focus-visible:outline-none text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label htmlFor="jobDescription" className="block text-sm font-semibold required">
                                    Job Description
                                </label>
                                <div className='h-fit'>
                                    <Editor content={jobDescription} setContent={setJobDescription} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            }

            <ToastContainer />
        </>
    );
};

Modal.setAppElement('#root'); // Set this if you are using #root in your HTML
export default Career;
