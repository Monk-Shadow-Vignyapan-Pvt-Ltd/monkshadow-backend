import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import Modal from 'react-modal';
import 'react-toastify/dist/ReactToastify.css';
import { UploadIcon } from '../components/Icons/UploadIcon';
import DataTable from 'react-data-table-component';  // Import DataTable component
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

const Career = () => {
    const [position, setPosition] = useState('');
    const [experience, setExperience] = useState('');
    const [city, setCity] = useState('');
    const [jobType,setJobType] = useState('');
    const [shortDescription,setShortDescription] = useState('');
    const [jobDescription,setJobDescription] = useState('');
    const [applicationDeadline,setApplicationDeadline] = useState(new Date());
    const [status, setStatus] = useState(false);
    const [careers,setCareers] = useState([]);
    const [editingCareer,setEditingCareer] = useState(null);
    const [searchQuery,setSearchQuery] = useState("");
    const [isModalOpen,setIsModalOpen] = useState(false);
    
    const [isLoading, setIsLoading] = useState(true)
    const {selectCountry} = useRoles();

    const fetchCareers = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`${API_BASE_URL}/${selectCountry}/careers/getCareers`);
            setCareers(response.data.careers.reverse());
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching careers:', error);
            toast.error('Failed to fetch careers.');
        }
    };
    useEffect(() => {
        
        fetchCareers();
    }, [selectCountry]);

    const openModal = (career = null) => {
        setEditingCareer(career);
        setPosition(career ? career.position : '');
        setExperience(career ? career.experience : "");
        setCity(career ? career.city : "")
        setJobType(career ? career.jobType : "")
        setShortDescription(career ? career.shortDescription : "")
        setJobDescription(career ? career.jobDescription : "")
        setApplicationDeadline(career ? career.applicationDeadline : new Date())
        setStatus(career ? career.status : false)
        setIsModalOpen(true);
    };

    

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCareer(null);
    };


    const handleUploadClick = async () => {
        setIsLoading(true);
    
        if (!position || !experience || !city || !jobType || !shortDescription || !jobDescription || !applicationDeadline ) {
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
            closeModal();
        } catch (error) {
            console.error('Error uploading career:', error);
            toast.error('Failed to upload career.');
        } finally {
           
            
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
                        onClick={() => openModal(row)}
                    >
                        <EditIcon width={20} height={20} fill={"#444050"} />
                    </button>
                    <button
                        onClick={() => handleDeleteClick(row._id)}
                    >
                        <MdOutlineDelete size={26} fill='#ff2023' />
                    </button>
                    <div id={`tooltip-${row._id}`} className="tooltip-wrapper">
                        <IoIosInformationCircleOutline size={26} fill={"#444050"} />
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

    const customStyles = {
        headCells: {
            style: {
                color: "var(--accent)",
                fontWeight: "700",
                fontSize: "14px"
            },
        },
        cells: {
            style: {
                paddingTop: '8px',
                paddingBottom: '8px',
            },
        },
    };

    const filteredCareers = careers.filter(career =>
        career.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        career.experience.toLowerCase().includes(searchQuery.toLowerCase()) ||
        career.jobType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        career.city.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
        
        {isLoading  ?
        <div className='w-full h-100 flex justify-center items-center bg-cardBg card-shadow rounded-lg'>
               <i className="loader" />
           </div>
        :
        <div className="mx-auto w-full flex flex-col col-span-12 md:col-span-8 justify-between bg-cardBg rounded-lg card-shadow p-5 gap-6">

            <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center border-2 px-3 py-2 rounded-lg">
                    <label htmlFor="search-careers"><SearchIcon width={18} height={18} fill={"none"} /></label>
                    <input id='search-careers' value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="ms-2 w-full sm:w-60 bg-transparent text-sm p-0 focus:outline-0" type="text" placeholder="Search by Name or Description" />
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-accent hover:bg-accent/70 px-3 py-2 h-full text-sm font-semibold text-cardBg rounded-lg"
                >
                    Add Career
                </button>
            </div>

            <Modal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                contentLabel="Career Modal"
                className="w-full max-w-[500px] max-h-[96vh] overflow-auto bg-cardBg z-50 m-4 p-6 rounded-2xl flex flex-col gap-4"
                overlayClassName="overlay"
            >
                <h2 className="text-xl font-bold text-accent">
                    {editingCareer ? 'Edit Career' : 'Add Career'}
                </h2>
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
                        className="bg-mainBg placeholder:text-secondaryText focus:outline-accent text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
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
                        className="bg-mainBg placeholder:text-secondaryText focus:outline-accent text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
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
                        className="bg-mainBg placeholder:text-secondaryText focus:outline-accent text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
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
                        className="bg-mainBg placeholder:text-secondaryText focus:outline-accent text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
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
                        className="bg-mainBg placeholder:text-secondaryText focus:outline-accent text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label htmlFor="applicationDeadline" className="block text-sm font-semibold required">
                    Status
                    </label>
                    <div className="flex flex-1 space-x-2 rounded-lg bg-mainBg select-none">
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
                                                    onChange={() =>  setStatus(false)}
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
                        className="bg-mainBg placeholder:text-secondaryText focus:outline-accent text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label htmlFor="jobDescription" className="block text-sm font-semibold required">
                        Job Description
                    </label>
                    <Editor content={jobDescription} setContent={setJobDescription} />
                </div>

                
                

                <div className="grid grid-cols-2 gap-3 m-x-4 w-full">
                    <button
                        onClick={handleUploadClick}
                        className={`px-6 py-2 rounded-lg text-cardBg text-md font-medium  ${editingCareer
                                ? 'bg-blue-600 hover:bg-blue-700'
                                : 'bg-green-600 hover:bg-green-700'
                            }`}
                    >
                        { editingCareer ? 'Update Career' : 'Add Career'}
                    </button>
                    <button onClick={closeModal} className="px-6 py-2 rounded-lg font-medium text-md text-cardBg bg-dangerRed duration-300">
                        Cancel
                    </button>
                </div>
            </Modal>

            <h3 className="text-xl font-bold text-accent">All Careers</h3>
            <div className="overflow-hidden border-2 rounded-lg">
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
        </div>}
         
          <ToastContainer />
        </>
    );
};

Modal.setAppElement('#root'); // Set this if you are using #root in your HTML
export default Career;
