import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import DataTable from 'react-data-table-component';
import Modal from 'react-modal';
import { API_BASE_URL } from '../config/constant.js';
import { SearchIcon } from '../components/Icons/SearchIcon.jsx';
import { useRoles } from '../RolesContext';
import AccessDenied from '../components/AccessDenied.jsx';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { IoIosInformationCircleOutline } from "react-icons/io";
import { FaCheck, FaPlus } from 'react-icons/fa6';
import { EditIcon } from '../components/Icons/EditIcon.jsx';
import { MdOutlineDelete } from 'react-icons/md';
import {
    Label,
    Listbox,
    ListboxButton,
    ListboxOption,
    ListboxOptions,
} from "@headlessui/react";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { NoDataIcon } from '../components/Icons/NoDataIcon.jsx';

Modal.setAppElement('#root');

const CareerForms = () => {
    const [careers, setCareers] = useState([]);
    const [isFormOpen, setIsFormOpen] = useState(false); // For Follow-up sidebar
    const [isStatusFormOpen, setIsStatusFormOpen] = useState(false); // For Status sidebar
    const [isAddEditFormOpen, setIsAddEditFormOpen] = useState(false); // For Add/Edit sidebar
    const [isTableDataOpen, setIsTableDataOpen] = useState(true); // For responsive layout
    const [isLoading, setIsLoading] = useState(false); // Loading state
    const [searchQuery, setSearchQuery] = useState('');
    const { selectCountry } = useRoles();
    const [selectedCareerForm, setSelectedCareerForm] = useState({});
    const [editingCareerForm, setEditingCareerForm] = useState(null);
    const [editingStatus, setEditingStatus] = useState(null);
    const [newStatus, setNewStatus] = useState("");
    const [followStatus, setFollowStatus] = useState("Pending");
    const [followupMessage, setFollowupMessage] = useState("");
    const [customStatuses, setCustomStatuses] = useState([]);
    const [isStatusLoading, setIsStatusLoading] = useState(true);
    const [editStatusLoading, setEditStatusLoading] = useState(false);
    const [isFollowUpLoading, setIsFollowUpLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [filteredCareersList, setFilteredCareersList] = useState([]);
    const [originalTotalPages, setOriginalTotalPages] = useState(0);
    const [isSearchLoading, setIsSearchLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'closed'

    // State for the Add/Edit form fields
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [city, setCity] = useState("");
    const [readyToRelocate, setReadyToRelocate] = useState(false);
    const [resume, setResume] = useState("");


    const fetchData = async (page) => {
        setIsLoading(true); // Start loading
        try {
            const careersResponse = await axios.get(`${API_BASE_URL}/${selectCountry}/careerForms/getCareerForms?page=${page}`);
            const careersData = careersResponse?.data?.careerForms || [];
            setCareers(careersData);
            setFilteredCareersList(careersData);
            setOriginalTotalPages(careersResponse.data.pagination.totalPages)
            setTotalPages(careersResponse.data.pagination.totalPages);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to fetch data.');
        } finally {
            setIsLoading(false); // Stop loading
        }
    };

    const fetchSearchData = async (query) => {
        if (query && query.trim()) {
            setSearchQuery(query);
            setIsSearchLoading(false);
            try {
                const response = await axios.post(`${API_BASE_URL}/${selectCountry}/careerForms/searchCareerForms/?search=${query}`);
                setFilteredCareersList(response.data.careerForms)
                setCurrentPage(1);
                setTotalPages(1);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsSearchLoading(true);
            }
        } else {
            setSearchQuery('');
            setFilteredCareersList(careers)
            setCurrentPage(1);
            setTotalPages(originalTotalPages);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const fetchStatuses = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/statuses/getStatuses`);
            setCustomStatuses(response.data.statuses);
            setIsStatusLoading(false);
            setEditStatusLoading(false);
        } catch (error) {
            console.error('Error fetching statuses:', error);
            toast.error('Failed to fetch statuses.');
        }
    };

    useEffect(() => {
        fetchStatuses();
    }, []);

    useEffect(() => {
        fetchData(currentPage);
    }, [selectCountry, currentPage]);

    const openFollowUpForm = (careerForm) => {
        setSelectedCareerForm(careerForm);
        setIsFormOpen(true);
        setIsStatusFormOpen(false);
        setIsAddEditFormOpen(false);
        if (window.innerWidth < 1024) {
            setIsTableDataOpen(false);
        }
    };

    const closeFollowUpForm = () => {
        setIsFormOpen(false);
        if (window.innerWidth < 1024) {
            setIsTableDataOpen(true);
        }
    };

    const openAddEditForm = (careerForm) => {
        setEditingCareerForm(careerForm);
        setName(careerForm.name);
        setEmail(careerForm.email);
        setPhone(careerForm.phone);
        setCity(careerForm.city);
        setReadyToRelocate(careerForm.readytoRelocate);
        setResume(careerForm.resume);
        setIsAddEditFormOpen(true);
        setIsFormOpen(false);
        setIsStatusFormOpen(false);
        if (window.innerWidth < 1024) {
            setIsTableDataOpen(false);
        }
    };

    const closeAddEditForm = () => {
        setIsAddEditFormOpen(false);
        setEditingCareerForm(null);
        if (window.innerWidth < 1024) {
            setIsTableDataOpen(true);
        }
    };


    useEffect(() => {
        const handleResize = () => {
            const anyFormOpen = isFormOpen || isStatusFormOpen || isAddEditFormOpen;
            if (window.innerWidth >= 1024) {
                setIsTableDataOpen(true);
            } else {
                if (anyFormOpen) {
                    setIsTableDataOpen(false);
                } else {
                    setIsTableDataOpen(true);
                }
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isFormOpen, isStatusFormOpen, isAddEditFormOpen]);

    const handleCareerCloseToggle = async (career) => {
        setIsLoading(true);
        const data = {
            ...career,
            isCareerClose: !career.isCareerClose,
        };
        try {
            const response = await axios.post(
                `${API_BASE_URL}/${selectCountry}/careerForms/updateCareerForm/${career._id}`,
                data,
                { headers: { 'Content-Type': 'application/json' } }
            );
            if (response.status === 200) {
                fetchData(currentPage);
            }
        } catch (error) {
            console.error('Error updating career form:', error);
            toast.error('Failed to update career form.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateCareerForm = async () => {
        if (!editingCareerForm) return;
        setIsLoading(true);

        const data = {
            ...editingCareerForm,
            name,
            email,
            phone,
            city,
            readytoRelocate: readyToRelocate,
        };

        try {
            const endpoint = `${API_BASE_URL}/${selectCountry}/careerForms/updateCareerForm/${editingCareerForm._id}`;
            await axios.post(endpoint, data, {
                headers: { 'Content-Type': 'application/json' },
            });
            toast.success('Career form updated successfully!');
            fetchData(currentPage);
            closeAddEditForm();
        } catch (error) {
            console.error('Error updating career form:', error);
            toast.error('Failed to update career form.');
        } finally {
            setIsLoading(false);
        }
    };


    const addOrUpdateStatus = async () => {
        setEditStatusLoading(true);
        if (!newStatus.trim()) {
            setEditStatusLoading(false);
            return toast.error("Status cannot be empty.");
        }
        if (editingStatus) {
            const endpoint = `${API_BASE_URL}/statuses/updateStatus/${editingStatus._id}`
            const response = await axios.post(endpoint, { name: newStatus }, {
                headers: { 'Content-Type': 'application/json' }
            });
            toast.success("Status Edited successfully.");
            setFollowStatus(response.data.status.name);
            await fetchStatuses();
            closeStatusForm();
        } else {
            if (customStatuses.some(status => status.name.toLowerCase() === newStatus.toLowerCase())) {
                setEditStatusLoading(false);
                toast.error("Status already exists.");
                return;
            }
            const response = await axios.post(`${API_BASE_URL}/statuses/addStatus`, { name: newStatus });
            toast.success("Status added successfully.");
            setFollowStatus(response.data.status.name);
            await fetchStatuses();
            closeStatusForm();
        }
    };

    const deleteStatus = async (id) => {
        if (window.confirm('Are you sure you want to delete this Status?')) {
            try {
                setEditStatusLoading(true);
                await axios.delete(`${API_BASE_URL}/statuses/deleteStatus/${id}`);
                toast.success('status deleted successfully!');
                setFollowStatus("Pending");
                await fetchStatuses();
                closeStatusForm();
            } catch (error) {
                console.error('Error deleting status:', error);
                toast.error('Failed to delete status.');
                setEditStatusLoading(false);
            }
        }
    };

    const openStatusForm = (status = null) => {
        setEditingStatus(status);
        setNewStatus(status ? status.name : "");
        setIsStatusFormOpen(true);
        setIsFormOpen(false); // Close other forms
        setIsAddEditFormOpen(false);
        if (window.innerWidth < 1024) {
            setIsTableDataOpen(false);
        }
    }

    const closeStatusForm = () => {
        setIsStatusFormOpen(false);
        setIsFormOpen(true); // Re-open the follow-up form
        setEditingStatus(null);
        setNewStatus("");
    }

    const handleAddFollowUp = async () => {
        setIsFollowUpLoading(true);

        if (!followupMessage) {
            setIsFollowUpLoading(false);
            return toast.warn('Please fill out Follow Up Message');
        }

        const data = {
            ...selectedCareerForm,
            followups: [
                ...(selectedCareerForm.followups || []), // Ensure followups is an array
                { followStatus, followupMessage, updatedDate: new Date() },
            ]
        };

        try {
            const endpoint = `${API_BASE_URL}/${selectCountry}/careerForms/updateCareerForm/${selectedCareerForm._id}`;

            const response = await axios.post(endpoint, data, {
                headers: { 'Content-Type': 'application/json' },
            });

            toast.success('Follow-up added successfully!');

            await fetchData(currentPage);
            setSelectedCareerForm(response.data.careerForm);
            setFollowStatus("Pending");
            setFollowupMessage("");
            setIsFollowUpLoading(false);

        } catch (error) {
            console.error('Error uploading Follow-up:', error);
            toast.error('Failed to upload Follow-up.');
            setIsFollowUpLoading(false);
        }
    }

    return (
        <>
            {isLoading || isStatusLoading ? (
                <div className='w-full flex-1 flex justify-center items-center bg-cardBg dark:bg-[#141414] dark:text-[#e6e6e6] duration-200'>
                    <i className="loader" />
                </div>) :
                <div className="flex-1 h-full w-full flex overflow-hidden">
                    {isTableDataOpen && (
                        <div className={`mx-auto w-full h-full flex flex-col duration-200 ${isFormOpen || isAddEditFormOpen || isStatusFormOpen ? "flex-1" : "flex-1"} bg-cardBg dark:bg-[#141414] dark:text-[#e6e6e6] p-5 gap-6 overflow-y-auto`}>
                            <div className={`w-full ${isFormOpen && "lg:flex-col lg:items-start xl:flex-row xl:items-center"} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
                                <h3 className="text-xl font-bold text-accent dark:text-[#e6e6e6]">All Career Forms</h3>
                                <div className={`flex-1 sm:max-w-fit ${isFormOpen && "lg:flex-1 lg:max-w-none"} flex items-center dark:bg-[#1a1a1a] focus-visible:border-[#f05f23] dark:focus-within:border-[#7b3517] border-2 dark:border-[#2b2b2b] px-3 py-2 rounded-lg`}>
                                    <label htmlFor="search-careers"><SearchIcon width={18} height={18} fill={"none"} /></label>
                                    <input id='search-careers' value={searchQuery} onChange={(e) => { fetchSearchData(e.target.value) }} className={`ms-2 w-full ${isFormOpen ? "sm:w-full xl:w-60" : "sm:w-60"} bg-transparent text-sm p-0 focus:outline-0`} type="text" placeholder="Search by Name or Email etc." />
                                </div>
                            </div>
                            <div className="w-full flex border-b border-gray-200 dark:border-[#2b2b2b]">
                                <button
                                    className={`w-full px-4 py-2 font-medium text-sm border-b-2  ${activeTab === 'pending' ? 'text-accent dark:text-[#e6e6e6] border-[#f05f23]' : 'text-gray-500 border-transparent dark:border-[#2b2b2b]'}`}
                                    onClick={() => setActiveTab('pending')}
                                >
                                    Career Pending ({filteredCareersList.filter(c => !c.isCareerClose).length})
                                </button>
                                <button
                                    className={`w-full px-4 py-2 font-medium text-sm border-b-2  ${activeTab === 'closed' ? 'text-accent dark:text-[#e6e6e6] border-[#f05f23]' : 'text-gray-500 border-transparent dark:border-[#2b2b2b]'} `}
                                    onClick={() => setActiveTab('closed')}
                                >
                                    Career Closed ({filteredCareersList.filter(c => c.isCareerClose).length})
                                </button>
                            </div>
                            {isSearchLoading &&
                                <>
                                    {filteredCareersList.filter(career => activeTab === 'pending' ? !career.isCareerClose : career.isCareerClose) < 1 ?
                                        <div className="flex-1 w-full flex flex-col gap-5 items-center justify-center">
                                            <NoDataIcon className={'w-6/12 lg:w-3/12'} />
                                            <h3 className="font-bold text-lg xl:text-xl text-[#e6e6e6]">No Data Found</h3>
                                        </div>
                                        :
                                        <div className={`w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ${isFormOpen || isAddEditFormOpen || isStatusFormOpen ? "lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3" : "lg:grid-cols-3 2xl:grid-cols-4"} gap-4 overflow-y-auto`}>
                                            {filteredCareersList.filter(career =>
                                                activeTab === 'pending' ? !career.isCareerClose : career.isCareerClose
                                            )
                                                .map((career) => (
                                                    <div key={career._id} className="h-fit rounded-lg relative flex flex-col gap-3 p-3 dark:bg-[#1a1a1a] border-2 dark:border-[#2b2b2b]">
                                                        <div className="flex items-center gap-1">
                                                            <span className="font-semibold text-sm">Name</span>
                                                            <span className="text-sm">{career.name}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <span className="font-semibold text-sm">Email</span>
                                                            <span className="text-sm">{career.email}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <span className="font-semibold text-sm">Phone No:</span>
                                                            <span className="text-sm">{career.phone}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <span className="font-semibold text-sm">City</span>
                                                            <span className="text-sm">{career.city}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <span className="font-semibold text-sm">Position</span>
                                                            <span className="text-sm">{career.career.position}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <span className="font-semibold text-sm">Experience</span>
                                                            <span className="text-sm">{career.career.experience}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <span className="font-semibold text-sm">Job Type</span>
                                                            <span className="text-sm">{career.career.jobType}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <span className="font-semibold text-sm">Ready to Relocate</span>
                                                            <span className="text-sm">{career.readytoRelocate ? "Yes" : "No"}</span>
                                                        </div>

                                                        <div className="flex items-center gap-1">
                                                            <input
                                                                type="checkbox"
                                                                checked={career.isCareerClose}
                                                                className="w-3.5 h-3.5 text-blue-600 bg-gray-100 border-gray-300 dark:bg-black dark:hover:bg-[#101010] rounded focus:ring-blue-500"
                                                                onChange={() => handleCareerCloseToggle(career)}
                                                            />
                                                            <span className="font-semibold text-sm">Career Close</span>
                                                        </div>

                                                        <div className="flex flex-col gap-1">
                                                            <button
                                                                className="bg-accent hover:bg-accent/70 dark:bg-black dark:hover:bg-[#101010] duration-300 px-3 py-2 h-full text-sm text-nowrap font-semibold text-cardBg rounded-lg"
                                                                onClick={() => openFollowUpForm(career)}
                                                            >
                                                                Follow-Up
                                                            </button>
                                                        </div>
                                                        <div className="flex absolute top-2.5 right-2 gap-2">
                                                            <button onClick={() => openAddEditForm(career)}>
                                                                <EditIcon width={16} height={16} fill={"currentColor"} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    }
                                </>
                            }

                            {totalPages > 1 && (
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
                            )}
                        </div>
                    )}

                    {isAddEditFormOpen && (
                        <div className="bg-cardBg dark:bg-[#141414] dark:text-[#e6e6e6] border-l-2 dark:border-[#2b2b2b] p-4 lg:max-w-100 flex flex-col gap-4 overflow-y-auto flex-1">
                            <div className="flex items-center justify-between w-full">
                                <h2 className="text-xl font-bold text-accent dark:text-[#e6e6e6]">
                                    View/Edit Career Form
                                </h2>
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={closeAddEditForm} className="icon-xl flex items-center justify-center rounded-lg bg-dangerRed hover:bg-dangerRed/75 dark:bg-[#4d1a19] duration-300">
                                        <FaPlus className="rotate-45" size={18} fill={"#ffffff"} />
                                    </button>
                                    <button
                                        onClick={handleUpdateCareerForm}
                                        className='icon-xl flex items-center justify-center rounded-lg duration-300 bg-blue-600 hover:bg-blue-700 dark:bg-blue-950'
                                    >
                                        <FaCheck size={14} fill={"#ffffff"} />
                                    </button>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label htmlFor="name" className="block text-sm font-semibold required">Name</label>
                                <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="bg-mainBg placeholder:text-secondaryText focus:outline-none dark:bg-[#000] border-2 border-[#c5c5c5] dark:border-[#2b2b2b] focus-visible:border-[#f05f23] dark:focus-visible:border-[#7b3517] focus-visible:outline-none text-sm rounded-lg px-3 py-2 block w-full" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label htmlFor="email" className="block text-sm font-semibold required">Email</label>
                                <input id="email" type="text" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-mainBg placeholder:text-secondaryText focus:outline-none dark:bg-[#000] border-2 border-[#c5c5c5] dark:border-[#2b2b2b] focus-visible:border-[#f05f23] dark:focus-visible:border-[#7b3517] focus-visible:outline-none text-sm rounded-lg px-3 py-2 block w-full" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label htmlFor="phone" className="block text-sm font-semibold required">Phone No:</label>
                                <input id="phone" type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-mainBg placeholder:text-secondaryText focus:outline-none dark:bg-[#000] border-2 border-[#c5c5c5] dark:border-[#2b2b2b] focus-visible:border-[#f05f23] dark:focus-visible:border-[#7b3517] focus-visible:outline-none text-sm rounded-lg px-3 py-2 block w-full" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label htmlFor="city" className="block text-sm font-semibold required">City</label>
                                <input id="city" type="text" value={city} onChange={(e) => setCity(e.target.value)} className="bg-mainBg placeholder:text-secondaryText focus:outline-none dark:bg-[#000] border-2 border-[#c5c5c5] dark:border-[#2b2b2b] focus-visible:border-[#f05f23] dark:focus-visible:border-[#7b3517] focus-visible:outline-none text-sm rounded-lg px-3 py-2 block w-full" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="block text-sm font-semibold">Ready to Relocate</label>
                                <input type="checkbox" checked={readyToRelocate} onChange={(e) => setReadyToRelocate(e.target.checked)} className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="block text-sm font-semibold">Resume</label>
                                <a href={API_BASE_URL + "/" + resume} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all">{resume.split('/').pop()}</a>
                            </div>
                        </div>
                    )}

                    {isFormOpen && (
                        <div className="bg-cardBg dark:bg-[#141414] dark:text-[#e6e6e6] border-l-2 dark:border-[#2b2b2b] p-4 lg:max-w-100 flex flex-col gap-4 overflow-y-auto flex-1">
                            <div className="flex items-center justify-between w-full">
                                <h3 className="text-xl font-bold text-accent dark:text-[#e6e6e6]">Follow-Ups</h3>
                                <button onClick={closeFollowUpForm} className="icon-xl flex items-center justify-center rounded-lg bg-dangerRed hover:bg-dangerRed/75 dark:bg-[#4d1a19] duration-300">
                                    <FaPlus className="rotate-45" size={18} fill={"#ffffff"} />
                                </button>
                            </div>
                            {isFollowUpLoading ?
                                <div className='w-full flex-1 flex justify-center items-center bg-cardBg dark:bg-[#141414] dark:text-[#e6e6e6] card-shadow rounded-lg'>
                                    <i className="loader" />
                                </div>
                                :
                                <>
                                    {selectedCareerForm.isCareerClose ? <div className="flex flex-col gap-2 mt-2"> <p>This Career Is Closed.</p></div> :
                                        <>
                                            <div className="flex flex-col gap-2 mt-2">
                                                {editStatusLoading ?
                                                    <div className="col-span-12 sm:col-span-6 flex flex-col gap-1">
                                                        <Skeleton className="w-full min-h-8 object-cover rounded-lg" />
                                                    </div>
                                                    :
                                                    <div className="flex flex-col gap-2">
                                                        <label className="text-sm font-semibold" htmlFor="followStatus">Status</label>
                                                        <div className="flex items-center gap-2 relative w-full overflow-visible">
                                                            <Listbox className="w-full" value={followStatus} onChange={setFollowStatus}>
                                                                <div className="relative ">
                                                                    <ListboxButton
                                                                        id="followStatus"
                                                                        className="relative w-full h-8 cursor-default font-input-style text-sm rounded-lg px-3 py-2 bg-mainBg placeholder:text-secondaryText dark:bg-[#000] dark:text-[#e6e6e6] border-2 border-[#c5c5c5] dark:border-[#2b2b2b] focus-visible:border-[#f05f23] dark:focus-visible:border-[#7b3517] focus-visible:outline-none"
                                                                        aria-expanded="true"
                                                                    >
                                                                        <span className="flex items-center">
                                                                            {followStatus}
                                                                        </span>
                                                                    </ListboxButton>

                                                                    <ListboxOptions className="absolute z-50 left-0 mt-1 w-full max-h-56 overflow-auto rounded-lg bg-white dark:bg-[#000] py-2 px-2 text-base shadow-lg ring-1 ring-black dark:border-2 dark:border-[#2b2b2b] ring-opacity-5 focus:outline-none">

                                                                        {customStatuses?.map((status) => (
                                                                            <ListboxOption
                                                                                key={status._id}
                                                                                value={status.name}
                                                                                className="group relative cursor-default select-none text-sm rounded-md py-2 px-2 text-gray-900 dark:text-[#e6e6e6] data-[focus]:bg-lightRed data-[focus]:text-white"
                                                                            >

                                                                                <div className="flex items-center justify-between">
                                                                                    {status.name}
                                                                                    {(status.name === "Pending" || status.name === "Cancelled") ? null :
                                                                                        <div className="flex items-center gap-1">
                                                                                            <button onClick={() => openStatusForm(status)}>
                                                                                                <EditIcon width={15} height={15} fill={"currentColor"} />
                                                                                            </button>
                                                                                            <button onClick={() => deleteStatus(status._id)}>
                                                                                                <MdOutlineDelete size={17} fill="currentColor" />
                                                                                            </button>
                                                                                        </div>}
                                                                                </div>
                                                                            </ListboxOption>
                                                                        ))}
                                                                    </ListboxOptions>
                                                                </div>
                                                            </Listbox>
                                                            <button onClick={() => openStatusForm()} className="flex items-center justify-center p-2 rounded-lg bg-mainBg hover:bg-lightGray dark:bg-accent dark:hover:bg-accent/70 duration-300">
                                                                <FaPlus size={18} fill="currentColor" />
                                                            </button>
                                                        </div>
                                                    </div>}
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-sm font-semibold required" htmlFor="followupMessage">Follow Up Message</label>
                                                    <input
                                                        id="followupMessage"
                                                        type="text"
                                                        value={followupMessage}
                                                        placeholder="Enter Follow Up Message"
                                                        onChange={(e) => setFollowupMessage(e.target.value)}
                                                        className="bg-mainBg placeholder:text-secondaryText dark:bg-[#000] dark:text-[#e6e6e6] border-2 border-[#c5c5c5] dark:border-[#2b2b2b] focus-visible:border-[#f05f23] dark:focus-visible:border-[#7b3517] focus-visible:outline-none text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
                                                    />
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleAddFollowUp()}
                                                className="w-full text-cardBg bg-accent hover:bg-accent/70 dark:text-[#e6e6e6] border-l-2 dark:border-[#2b2b2b] px-3 py-2.5 text-sm font-semibold rounded-lg duration-300"
                                            >
                                                Add Follow Up
                                            </button>
                                        </>
                                    }

                                    <div className="mt-4">
                                        <h3 className="font-bold text-md mb-2">Previous Follow-Ups</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-1 gap-2">
                                            {selectedCareerForm.followups && selectedCareerForm.followups.length > 0 ? (
                                                selectedCareerForm.followups.slice().reverse().map((followup, index) => (
                                                    <div key={index} className="border-2 rounded-lg dark:border-[#2b2b2b] dark:bg-[#1a1a1a] flex flex-col gap-1 px-3 py-4 text-sm">
                                                        <p className="flex flex-wrap justify-between sm:text-nowrap"><span className="font-semibold">Updated At :</span> {new Date(followup.updatedDate).toLocaleString()}</p>
                                                        <p className="flex flex-wrap justify-between sm:text-nowrap"><span className="font-semibold">Status :</span> <span className="text-[#f05f23]">{followup.followStatus}</span></p>
                                                        <p className="flex flex-wrap justify-between sm:text-nowrap"><span className="font-semibold">Message :</span> {followup.followupMessage}</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="flex flex-col items-center gap-2 px-3 py-4 text-sm font-semibold border-2 border-dashed rounded-lg border-[#2b2b2b] dark:border-[#2b2b2b]">
                                                    <p>No follow-ups available.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>}
                        </div>
                    )}

                    {isStatusFormOpen && (
                        <div className="bg-cardBg dark:bg-[#141414] dark:text-[#e6e6e6] border-l-2 dark:border-[#2b2b2b] p-4 lg:max-w-100 flex flex-col gap-4 overflow-y-auto flex-1">
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-bold">{editingStatus ? "Update Status" : "Add Status"}</h2>
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={closeStatusForm} className="icon-xl flex items-center justify-center rounded-lg bg-dangerRed hover:bg-dangerRed/75 dark:bg-[#4d1a19] duration-300">
                                        <FaPlus className="rotate-45" size={18} fill={"#ffffff"} />
                                    </button>
                                    <button
                                        onClick={addOrUpdateStatus}
                                        className={`icon-xl flex items-center justify-center rounded-lg duration-300 ${editingStatus ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-950' : 'bg-green-600 hover:bg-green-700 dark:bg-[#005239]'}`}
                                    >
                                        <FaCheck size={14} fill={"#ffffff"} />
                                    </button>
                                </div>
                            </div>
                            {editStatusLoading ?
                                <div className="col-span-12 sm:col-span-6 flex flex-col gap-1">
                                    <Skeleton className="w-full min-h-8 object-cover rounded-lg" />
                                </div>
                                :
                                <div className="flex flex-col gap-3">
                                    <div className="w-full flex-1">
                                        <input
                                            type="text"
                                            placeholder="Enter status"
                                            value={newStatus}
                                            onChange={(e) => setNewStatus(e.target.value)}
                                            className="w-full font-input-style text-md rounded-lg px-3 py-2 bg-mainBg placeholder:text-secondaryText dark:bg-[#000] border-2 border-[#c5c5c5] dark:border-[#2b2b2b] focus-visible:border-[#f05f23] dark:focus-visible:border-[#7b3517] focus-visible:outline-none"
                                        />
                                    </div>
                                </div>}
                        </div>
                    )}
                </div >
            }
            <ToastContainer />
        </>
    );
};

export default CareerForms;
