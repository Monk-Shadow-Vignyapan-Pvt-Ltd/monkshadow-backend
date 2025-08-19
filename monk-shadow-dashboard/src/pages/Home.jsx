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

const Home = () => {
    const [contacts, setContacts] = useState([]);
    const [followupsByContact, setFollowupsByContact] = useState({});
    const [selectedContactFollowups, setSelectedContactFollowups] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // Loading state
    const [searchQuery, setSearchQuery] = useState('');
    const { selectCountry } = useRoles();
    const { role } = useRoles();
    const [editingContact, setEditingContact] = useState(null);
    const [isAddEditFormOpen, setIsAddEditFormOpen] = useState(false); // Changed from isAddEditModalOpen
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [message, setMessage] = useState("");
    const [pageName, setPageName] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [websiteUrl, setWebsiteUrl] = useState("");
    const [pages, setPages] = useState(["contactus", "home", "seo", "performancemarketing", "webdevelopment"])
    const [selectedContact, setSelectedContact] = useState({});
    const [isStatusFormOpen, setIsStatusFormOpen] = useState(false); // Changed from isStatusModalOpen
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
    const [filteredContactsList, setFilteredContactsList] = useState([]);
    const [originalTotalPages, setOriginalTotalPages] = useState(0);
    const [isSearchLoading, setIsSearchLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'closed'

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isTableDataOpen, setIsTableDataOpen] = useState(true);


    const fetchData = async (page) => {
        setIsLoading(true); // Start loading
        try {
            const contactsResponse = await axios.get(`${API_BASE_URL}/${selectCountry}/contacts/getContacts?page=${page}`);

            const contactsData = role === "India" ? contactsResponse?.data?.contacts : contactsResponse?.data?.contacts.filter(contact => contact.showForAll) || [];
            //const followupsData = followupsResponse?.data?.followups || [];

            setContacts(contactsData);
            setFilteredContactsList(contactsData);
            setOriginalTotalPages(contactsResponse.data.pagination.totalPages)
            setTotalPages(contactsResponse.data.pagination.totalPages);
            // const groupedFollowups = followupsData.reduce((acc, followup) => {
            //     const { contactId } = followup;
            //     if (!acc[contactId]) acc[contactId] = [];
            //     acc[contactId].push(followup);
            //     return acc;
            // }, {});

            // setFollowupsByContact(groupedFollowups);
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
                const response = await axios.post(`${API_BASE_URL}/${selectCountry}/contacts/searchContacts/?search=${query}`);
                setFilteredContactsList(response.data.contacts)
                setCurrentPage(1);
                setTotalPages(1);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsSearchLoading(true);
            }
        } else {
            setSearchQuery('');
            setFilteredContactsList(contacts)
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
        // fetchData();
        fetchStatuses();
    }, []);

    useEffect(() => {
        fetchData(currentPage);
    }, [selectCountry, currentPage])

    const handleShowFollowups = (contact) => {
        // const followups = followupsByContact[contactId] || [];
        // const sortedFollowups = [...followups].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        // setSelectedContactFollowups(sortedFollowups);
        setSelectedContact(contact);
        // setIsModalOpen(true);
        setIsFormOpen(true);
        setIsAddEditFormOpen(false); // Close other forms
        setIsStatusFormOpen(false); // Close other forms

        // Check screen width and toggle states accordingly
        if (window.innerWidth < 1024) {
            setIsTableDataOpen(false); // Hide table for smaller screens
        }
    };


    useEffect(() => {
        const handleResize = () => {
            const anyFormOpen = isFormOpen || isAddEditFormOpen || isStatusFormOpen;
            if (window.innerWidth >= 1024) {
                // Always show the table on larger screens
                setIsTableDataOpen(true);
            } else {
                // On smaller screens, ensure only the active view (table/form) is visible
                if (anyFormOpen) {
                    setIsTableDataOpen(false);
                } else {
                    setIsTableDataOpen(true);
                }
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isFormOpen, isAddEditFormOpen, isStatusFormOpen]); // Dependency ensures this runs when any form state changes

    const closeFollowUpForm = () => {
        // setIsModalOpen(false);
        setIsFormOpen(false);

        if (window.innerWidth < 1024) {
            setIsTableDataOpen(true); // Show table for smaller screens
        }
    };

    const openAddEditForm = (contact = null) => {
        setEditingContact(contact);
        setName(contact ? contact.name : "");
        setEmail(contact ? contact.email : "");
        setPhone(contact ? contact.phone : "");
        setMessage(contact ? contact.message : "");
        setPageName(contact ? contact.pageName : "");
        setCompanyName(contact ? contact.companyName : "");
        setWebsiteUrl(contact ? contact.websiteUrl : "");
        setIsAddEditFormOpen(true);
        setIsFormOpen(false); // Close other forms
        setIsStatusFormOpen(false); // Close other forms

        if (window.innerWidth < 1024) {
            setIsTableDataOpen(false);
        }
    };



    const closeAddEditForm = () => {
        setIsAddEditFormOpen(false);
        setEditingContact(null);
        if (window.innerWidth < 1024) {
            setIsTableDataOpen(true);
        }
    };

    const handleSubmit = async () => {
        setIsLoading(true);

        if (!name || !phone || !email) {
            setIsLoading(false);
            return toast.warn('Please fill out all required fields.');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setIsLoading(false);
            return toast.warn('Please enter a valid email address.');

        }

        const data = {
            name,
            phone,
            email, // May be null if no file is provided
            message,
            companyName: selectCountry === "canada" ? companyName : null,
            websiteUrl: selectCountry === "canada" ? websiteUrl : null,
            pageName: selectCountry === "canada" ? pageName : null,
            isContactClose: editingContact ? editingContact.isContactClose : false,
            showForAll: editingContact ? editingContact.showForAll : role === "India" ? false : true,
        };

        try {
            const endpoint = editingContact
                ? `${API_BASE_URL}/${selectCountry}/contacts/updateContact/${editingContact._id}`
                : `${API_BASE_URL}/${selectCountry}/contacts/addContact`;

            await axios.post(endpoint, data, {
                headers: { 'Content-Type': 'application/json' },
            });

            toast.success(
                editingContact
                    ? 'Contact updated successfully!'
                    : 'Contact added successfully!'
            );

            fetchData(currentPage); // Refetch data for the current page
            setIsLoading(false);
            closeAddEditForm();
        } catch (error) {
            console.error('Error uploading contact:', error);
            toast.error('Failed to upload contact.');
            setIsLoading(false);
        }
    };


    const handleDeleteClick = async (id) => {
        if (window.confirm('Are you sure you want to delete this contact?')) {
            try {
                setIsLoading(true);
                await axios.delete(`${API_BASE_URL}/${selectCountry}/contacts/deleteContact/${id}`);
                toast.success('contact deleted successfully!');
                fetchData(currentPage); // Refetch data for the current page
                setIsLoading(false);
            } catch (error) {
                console.error('Error deleting contact:', error);
                toast.error('Failed to delete contact.');
                setIsLoading(false);
            }
        }
    };

    const contactColumns = [
        {
            name: 'Name',
            // selector: row => row.name,
            selector: row => (
                <div id={`tooltip-${row.name}`} className="tooltip-wrapper">
                    {row.name}
                    <ReactTooltip
                        anchorId={`tooltip-${row.name}`}
                        place="top"
                        content={row.name}
                    />
                </div>
            ),
            sortable: true,
        },
        {
            name: 'Phone',
            // selector: row => row.phone,
            selector: row => (
                <div id={`tooltip-${row.phone}`} className="tooltip-wrapper">
                    {row.phone}
                    <ReactTooltip
                        anchorId={`tooltip-${row.phone}`}
                        place="top"
                        content={row.phone}
                    />
                </div>
            ),
            sortable: true,
        },
        {
            name: 'Email',
            // selector: row => row.email,
            selector: row => (
                <div id={`tooltip-${row.email}`} className="tooltip-wrapper">
                    {row.email}
                    <ReactTooltip
                        anchorId={`tooltip-${row.email}`}
                        place="top"
                        content={row.email}
                    />
                </div>
            ),
            sortable: true,
        },
        {
            name: 'Message',
            // selector: row => row.message,
            selector: row => (
                <div id={`tooltip-${row.message}`} className="tooltip-wrapper">
                    {row.message}
                    <ReactTooltip
                        anchorId={`tooltip-${row.message}`}
                        place="top"
                        content={row.message}
                    />
                </div>
            ),
            sortable: true,
        },
        ...(selectCountry === "canada"
            ? [
                {
                    name: 'Inquiry About',
                    // selector: row => row.message,
                    selector: row => (
                        <div id={`tooltip-${row.pageName}`} className="tooltip-wrapper">
                            {row.pageName}
                            <ReactTooltip
                                anchorId={`tooltip-${row.pageName}`}
                                place="top"
                                content={row.pageName}
                            />
                        </div>
                    ),
                    sortable: true,
                },
            ]
            : []),
        ...(selectCountry === "canada"
            ? [
                {
                    name: 'Company Name',
                    // selector: row => row.message,
                    selector: row => (
                        <div id={`tooltip-${row.companyName ? row.companyName : row.websiteUrl}`} className="tooltip-wrapper">
                            {row.companyName ? row.companyName : row.websiteUrl}
                            <ReactTooltip
                                anchorId={`tooltip-${row.companyName ? row.companyName : row.websiteUrl}`}
                                place="top"
                                content={row.companyName ? row.companyName : row.websiteUrl}
                            />
                        </div>
                    ),
                    sortable: true,
                },
            ]
            : []),


        {
            name: 'Follow-Ups',
            cell: row => (
                <button
                    className="bg-accent hover:bg-accent/70 px-3 py-2 h-full text-sm text-nowrap font-semibold text-cardBg rounded-lg"
                    onClick={() => handleShowFollowups(row)}
                >
                    Follow-Up
                </button>
            ),
        },
        {
            name: 'Contact Close',
            cell: row => (
                <div className="flex justify-center items-center">
                    <input
                        type="checkbox"
                        checked={row.isContactClose}
                        className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        onChange={() => handleContactCloseToggle(row)}
                    />

                </div>
            ),
            center: true,
        },
        ...(selectCountry === "canada" && role === "India"
            ? [
                {
                    name: 'Show For All',
                    cell: row => (
                        <div className="flex gap-4">
                            <input
                                type="checkbox"
                                checked={row.showForAll}
                                className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                onChange={() => handleShowForAllToggle(row)}
                            />

                        </div>
                    ),
                    center: true,
                },
            ]
            : []),

        {
            name: 'Actions',

            cell: row => (
                <div className="flex gap-4">
                    <button
                        onClick={() => openAddEditForm(row)}
                    >
                        <EditIcon width={20} height={20} fill={"#444050"} />
                    </button>
                    <button
                        onClick={() => handleDeleteClick(row._id)}
                    >
                        <MdOutlineDelete size={26} fill='#ff2023' />
                    </button>
                    {/* <div id={`tooltip-${row._id}`} className="tooltip-wrapper">
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
                            /> */}
                </div>
            ),
        }
    ];

    const handleContactCloseToggle = async (contact) => {
        setIsLoading(true); // set loading true
        const data = {
            name: contact.name,
            phone: contact.phone,
            email: contact.email,
            message: contact.message,
            pageName: contact.pageName,
            companyName: contact.companyName,
            websiteUrl: contact.websiteUrl,
            isContactClose: !contact.isContactClose,
            showForAll: contact.showForAll
        };
        try {
            const response = await axios.post(
                `${API_BASE_URL}/${selectCountry}/contacts/updateContact/${contact._id}`,
                data,
                { headers: { 'Content-Type': 'application/json' } }
            );
            if (response.status === 200) {
                fetchData(currentPage);
            }
        } catch (error) {
            console.error('Error updating contact:', error);
            toast.error('Failed to update contact.');
        } finally {
            setIsLoading(false); // set loading false
        }
    };

    const handleShowForAllToggle = async (contact) => {
        setIsLoading(true); // set loading true
        const data = {
            name: contact.name,
            phone: contact.phone,
            email: contact.email,
            message: contact.message,
            pageName: contact.pageName,
            companyName: contact.companyName,
            websiteUrl: contact.websiteUrl,
            isContactClose: contact.isContactClose,
            showForAll: !contact.showForAll
        };
        try {
            const response = await axios.post(
                `${API_BASE_URL}/${selectCountry}/contacts/updateContact/${contact._id}`,
                data,
                { headers: { 'Content-Type': 'application/json' } }
            );
            if (response.status === 200) {
                fetchData(currentPage);
            }
        } catch (error) {
            console.error('Error updating contact:', error);
            toast.error('Failed to update contact.');
        } finally {
            setIsLoading(false); // set loading false
        }
    };

    const customStyles = {
        headCells: {
            style: {
                color: "var(--accent)",
                fontWeight: "700",
                fontSize: "14px",
            },
        },
        cells: {
            style: {
                paddingTop: '8px',
                paddingBottom: '8px',
            },
        },
    };

    const filteredContacts = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.websiteUrl?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.pageName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const addOrUpdateStatus = async () => {
        setEditStatusLoading(true);
        if (!newStatus.trim()) {
            setEditStatusLoading(false);
            return toast.error("Status cannot be empty.");
        }
        // const updatedStatuses = [...customStatuses];
        if (editingStatus) {
            const endpoint = `${API_BASE_URL}/statuses/updateStatus/${editingStatus._id}`
            const response = await axios.post(endpoint, { name: newStatus }, {
                headers: { 'Content-Type': 'application/json' }
            });
            toast.success("Status Edited successfully.");
            setFollowStatus(response.data.status.name);
            fetchStatuses();
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
            fetchStatuses();
            closeStatusForm();

        }
        // setCustomStatuses(updatedStatuses);
        // closeModal();
    };

    const deleteStatus = async (id) => {
        if (window.confirm('Are you sure you want to delete this Status?')) {
            try {
                setEditStatusLoading(true);
                await axios.delete(`${API_BASE_URL}/statuses/deleteStatus/${id}`);
                toast.success('status deleted successfully!');
                setFollowStatus("Pending");
                fetchStatuses();
                closeStatusForm();
            } catch (error) {
                console.error('Error deleting status:', error);
                toast.error('Failed to delete status.');
            }
        }
    };

    const openStatusForm = (status = null) => {
        setEditingStatus(status);
        setNewStatus(status ? status.name : "");
        setIsStatusFormOpen(true);
        setIsFormOpen(false); // Close other forms
        setIsAddEditFormOpen(false); // Close other forms
        if (window.innerWidth < 1024) {
            setIsTableDataOpen(false);
        }
    }

    const closeStatusForm = () => {
        setIsStatusFormOpen(false);
        setIsFormOpen(true); // Close other forms
        setEditingStatus(null);
        setNewStatus("");
        if (window.innerWidth < 1024) {
            setIsTableDataOpen(true);
        }
    }

    const handleAddFollowUp = async () => {
        setIsFollowUpLoading(true);

        if (!followupMessage) {
            setIsFollowUpLoading(false);
            return toast.warn('Please fill out Follow Up Message');
        }

        const data = {
            name: selectedContact.name,
            phone: selectedContact.phone,
            email: selectedContact.email, // May be null if no file is provided
            message: selectedContact.message,
            companyName: selectedContact.companyName,
            websiteUrl: selectedContact.websiteUrl,
            pageName: selectedContact.pageName,
            isContactClose: selectedContact.isContactClose,
            showForAll: selectedContact.showForAll,
            followups: [
                ...(selectedContact.followups || []), // Ensure followups is an array
                { followStatus, followupMessage, updatedDate: new Date() },
            ]
        };

        try {
            const endpoint = `${API_BASE_URL}/${selectCountry}/contacts/updateContact/${selectedContact._id}`;

            const response = await axios.post(endpoint, data, {
                headers: { 'Content-Type': 'application/json' },
            });

            toast.success('Follwup added successfully!');

            fetchData(currentPage);
            setSelectedContact(response.data.contact);
            setFollowStatus("Pending");
            setFollowupMessage("");
            setIsFollowUpLoading(false);

        } catch (error) {
            console.error('Error uploading Follwup:', error);
            toast.error('Failed to upload Follwup.');
            setIsFollowUpLoading(false);
        }
    }

    return (
        <>
            {isLoading || isStatusLoading ? (
                <div className='w-full flex-1 flex justify-center items-center bg-cardBg dark:bg-[#141414] dark:text-[#e6e6e6] duration-200'>
                    <i className="loader" />
                </div>) :
                <>
                    <div className="flex-1 h-full w-full flex overflow-hidden">
                        {isTableDataOpen && (
                            <div className={`mx-auto w-full h-full flex flex-col duration-200 ${isFormOpen || isAddEditFormOpen || isStatusFormOpen ? "flex-1" : "flex-1"} bg-cardBg dark:bg-[#141414] dark:text-[#e6e6e6] p-5 gap-6 overflow-y-auto`}>
                                <div className={`w-full ${(isFormOpen || isAddEditFormOpen || isStatusFormOpen) && "lg:flex-col lg:items-start xl:flex-row xl:items-center"} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
                                    <h3 className="text-xl font-bold text-accent dark:text-[#e6e6e6]">All Contacts</h3>
                                    <div className={`flex items-center gap-3 w-full sm:w-auto ${(isFormOpen || isAddEditFormOpen || isStatusFormOpen) && "lg:w-full xl:w-auto"}`}>
                                        <div className={`flex-1 sm:max-w-fit ${(isFormOpen || isAddEditFormOpen || isStatusFormOpen) && "lg:flex-1 lg:max-w-none"} flex items-center dark:bg-[#1a1a1a] focus-visible:border-[#f05f23] dark:focus-within:border-[#7b3517] border-2 dark:border-[#2b2b2b] px-3 py-2 rounded-lg`}>
                                            <label htmlFor="search-FAQ"><SearchIcon width={18} height={18} fill={"none"} /></label>
                                            <input id='search-FAQ' value={searchQuery} onChange={(e) => { fetchSearchData(e.target.value) }} className={`ms-2 w-full ${(isFormOpen || isAddEditFormOpen || isStatusFormOpen) ? "sm:w-full xl:w-60" : "sm:w-60"} bg-transparent text-sm p-0 focus:outline-0`} type="text" placeholder="Search by Name or Email etc." />
                                        </div>
                                        <button
                                            onClick={() => openAddEditForm()}
                                            className="bg-accent hover:bg-accent/70 w-8 h-8 flex aspect-square items-center justify-center text-sm font-semibold text-cardBg rounded-lg"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 48 48"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={5} d="m24.06 10l-.036 28M10 24h28"></path></svg>
                                        </button>
                                    </div>
                                </div>

                                <div className="w-full flex border-b border-gray-200 dark:border-[#2b2b2b]">
                                    <button
                                        className={`w-full px-4 py-2 font-medium text-sm border-b-2  ${activeTab === 'pending' ? 'text-accent dark:text-[#e6e6e6] border-[#f05f23]' : 'text-gray-500 border-transparent dark:border-[#2b2b2b]'}`}
                                        onClick={() => setActiveTab('pending')}
                                    >
                                        Contact Pending ({filteredContactsList.filter(c => !c.isContactClose).length})
                                    </button>
                                    <button
                                        className={`w-full px-4 py-2 font-medium text-sm border-b-2  ${activeTab === 'closed' ? 'text-accent dark:text-[#e6e6e6] border-[#f05f23]' : 'text-gray-500 border-transparent dark:border-[#2b2b2b]'} `}
                                        onClick={() => setActiveTab('closed')}
                                    >
                                        Contact Closed ({filteredContactsList.filter(c => c.isContactClose).length})
                                    </button>
                                </div>

                                {isSearchLoading &&
                                    <>
                                        {
                                            filteredContactsList.filter(contact =>
                                                activeTab === 'pending' ? !contact.isContactClose : contact.isContactClose
                                            ) < 1 ?
                                                <div className="flex-1 w-full flex flex-col gap-5 items-center justify-center">
                                                    <NoDataIcon className={'w-6/12 lg:w-3/12'} />
                                                    <h3 className="font-bold text-lg xl:text-xl text-[#e6e6e6]">No Data Found</h3>
                                                </div>
                                                :
                                                <div className={`w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ${(isFormOpen || isAddEditFormOpen || isStatusFormOpen) ? "lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3" : "lg:grid-cols-3 2xl:grid-cols-4"} gap-4 overflow-y-auto`}>
                                                    {filteredContactsList
                                                        .filter(contact =>
                                                            activeTab === 'pending' ? !contact.isContactClose : contact.isContactClose
                                                        )
                                                        .map((contact) => (
                                                            <div key={contact._id} className="h-fit rounded-lg relative flex flex-col gap-3 p-3 dark:bg-[#1a1a1a] border-2 dark:border-[#2b2b2b]">
                                                                <div className="flex items-center gap-1">
                                                                    <span className="font-semibold text-sm">Name</span>
                                                                    <span className="text-sm">{contact.name}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <span className="font-semibold text-sm">Email</span>
                                                                    <span className="text-sm">{contact.email}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <span className="font-semibold text-sm">Phone No:</span>
                                                                    <span className="text-sm">{contact.phone}</span>
                                                                </div>
                                                                <div className="flex flex-col gap-1">
                                                                    <span className="font-semibold text-sm">Message</span>
                                                                    <span className="text-sm">{contact.message}</span>
                                                                </div>
                                                                {selectCountry === "canada" && <div className="flex items-center gap-1">
                                                                    <span className="font-semibold text-sm">Inquiry About</span>
                                                                    <span className="text-sm">{contact.pageName}</span>
                                                                </div>}
                                                                {selectCountry === "canada" && <div className="flex items-center gap-1">
                                                                    <span className="font-semibold text-sm">Company Name</span>
                                                                    <span className="text-sm">{contact.companyName ? contact.companyName : contact.websiteUrl}</span>
                                                                </div>}

                                                                <div className="flex items-center gap-1">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={contact.isContactClose}
                                                                        className="w-3.5 h-3.5 text-blue-600 bg-gray-100 border-gray-300 dark:bg-black dark:hover:bg-[#101010] rounded focus:ring-blue-500"
                                                                        onChange={() => handleContactCloseToggle(contact)}
                                                                    />
                                                                    <span className="font-semibold text-sm">Contact Close</span>

                                                                </div>

                                                                {selectCountry === "canada" && role === "India" && <div className="flex items-center gap-1">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={contact.showForAll}
                                                                        className="w-3.5 h-3.5 text-blue-600 bg-gray-100 border-gray-300 dark:bg-black dark:hover:bg-[#101010] rounded focus:ring-blue-500"
                                                                        onChange={() => handleShowForAllToggle(contact)}
                                                                    />
                                                                    <span className="font-semibold text-sm">Show For All</span>

                                                                </div>}

                                                                <div className="flex flex-col gap-1">
                                                                    <button
                                                                        className="bg-accent hover:bg-accent/70 dark:bg-black dark:hover:bg-[#101010] duration-300 px-3 py-2 h-full text-sm text-nowrap font-semibold text-cardBg rounded-lg"
                                                                        onClick={() => handleShowFollowups(contact)}
                                                                    >
                                                                        Follow-Up
                                                                    </button>
                                                                </div>
                                                                <div className="flex absolute top-2.5 right-2 gap-2">

                                                                    <button onClick={() => openAddEditForm(contact)}>
                                                                        <EditIcon width={16} height={16} fill={"currentColor"} />
                                                                    </button>

                                                                    <button className="text-[#ff0000] dark:text-[#c41d1f]" onClick={() => handleDeleteClick(contact._id)}>
                                                                        <MdOutlineDelete size={23} fill='currentColor' />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))
                                                    }
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
                                        {editingContact ? 'Edit Contact' : 'Add Contact'}
                                    </h2>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button onClick={closeAddEditForm} className="icon-xl flex items-center justify-center rounded-lg bg-dangerRed hover:bg-dangerRed/75 dark:bg-[#4d1a19] duration-300">
                                            <FaPlus className="rotate-45" size={18} fill={"#ffffff"} />
                                        </button>
                                        <button
                                            onClick={handleSubmit}
                                            className={`icon-xl flex items-center justify-center rounded-lg duration-300 ${editingContact
                                                ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-950'
                                                : 'bg-green-600 hover:bg-green-700 dark:bg-[#005239]'
                                                }`}
                                        >
                                            {/* {editingContact ? 'Update Contact' : 'Add Contact'} */}
                                            <FaCheck size={14} fill={"#ffffff"} />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label htmlFor="name" className="block text-sm font-semibold required">
                                        Name
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        value={name}
                                        placeholder="Enter Name"
                                        onChange={(e) => setName(e.target.value)}
                                        className="bg-mainBg placeholder:text-secondaryText focus:outline-none dark:bg-[#000] border-2 border-[#c5c5c5] dark:border-[#2b2b2b] focus-visible:border-[#f05f23] dark:focus-visible:border-[#7b3517] focus-visible:outline-none text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label htmlFor="email" className="block text-sm font-semibold required">
                                        Email
                                    </label>
                                    <input
                                        id="email"
                                        type="text"
                                        value={email}
                                        placeholder="Enter Email"
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="bg-mainBg placeholder:text-secondaryText focus:outline-none dark:bg-[#000] border-2 border-[#c5c5c5] dark:border-[#2b2b2b] focus-visible:border-[#f05f23] dark:focus-visible:border-[#7b3517] focus-visible:outline-none text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
                                    />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label htmlFor="phone" className="block text-sm font-semibold required">
                                        Phone No:
                                    </label>
                                    <input
                                        id="phone"
                                        type="text"
                                        value={phone}
                                        placeholder="Enter Phone No:"
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="bg-mainBg placeholder:text-secondaryText focus:outline-none dark:bg-[#000] border-2 border-[#c5c5c5] dark:border-[#2b2b2b] focus-visible:border-[#f05f23] dark:focus-visible:border-[#7b3517] focus-visible:outline-none text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
                                    />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label htmlFor="message" className="block text-sm font-semibold ">
                                        Message
                                    </label>
                                    <textarea
                                        id="message"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Enter Message"
                                        style={{ minHeight: "100px" }}
                                        className="bg-mainBg placeholder:text-secondaryText focus:outline-none dark:bg-[#000] border-2 border-[#c5c5c5] dark:border-[#2b2b2b] focus-visible:border-[#f05f23] dark:focus-visible:border-[#7b3517] focus-visible:outline-none text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
                                    />
                                </div>

                                {selectCountry === "canada" && <div className="flex flex-col gap-1">
                                    <label htmlFor="pageName" className="block text-sm font-semibold">
                                        Select Lead
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <select
                                            name="pageName"
                                            value={pageName}
                                            onChange={(e) => {
                                                setPageName(e.target.value);
                                            }}
                                            className="relative w-full cursor-default font-input-style text-sm rounded-lg px-3 py-2 bg-mainBg placeholder:text-secondaryText dark:bg-[#000] border-2 border-[#c5c5c5] dark:border-[#2b2b2b] focus-visible:border-[#f05f23] dark:focus-visible:border-[#7b3517] focus-visible:outline-none"
                                            required
                                        >
                                            <option disabled value="">Select Lead</option>
                                            {pages.map((page, index) => (
                                                <option key={index} value={page}>
                                                    {page}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>}

                                {selectCountry === "canada" && pageName != "seo" && <div className="flex flex-col gap-1">
                                    <label htmlFor="companyName" className="block text-sm font-semibold ">
                                        Company Name
                                    </label>
                                    <input
                                        id="companyName"
                                        type="text"
                                        value={companyName}
                                        placeholder="Enter Company Name"
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        className="bg-mainBg placeholder:text-secondaryText dark:bg-[#000] border-2 border-[#c5c5c5] dark:border-[#2b2b2b] focus-visible:border-[#f05f23] dark:focus-visible:border-[#7b3517] focus-visible:outline-none text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
                                    />
                                </div>}

                                {selectCountry === "canada" && pageName === "seo" && <div className="flex flex-col gap-1">
                                    <label htmlFor="websiteUrl" className="block text-sm font-semibold ">
                                        Website Url
                                    </label>
                                    <input
                                        id="websiteUrl"
                                        type="text"
                                        value={websiteUrl}
                                        placeholder="Enter Website Url"
                                        onChange={(e) => setWebsiteUrl(e.target.value)}
                                        className="bg-mainBg placeholder:text-secondaryText dark:bg-[#000] border-2 border-[#c5c5c5] dark:border-[#2b2b2b] focus-visible:border-[#f05f23] dark:focus-visible:border-[#7b3517] focus-visible:outline-none text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
                                    />
                                </div>}

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
                                            className={`icon-xl flex items-center justify-center rounded-lg duration-300 ${editingStatus
                                                ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-950'
                                                : 'bg-green-600 hover:bg-green-700 dark:bg-[#005239]'
                                                }`}
                                        >
                                            {/* {editingStatus ? "Update Status" : "Add Status"} */}
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
                                        {selectedContact.isContactClose ? <div className="flex flex-col gap-2 mt-2"> <p>This Contact Is Closed.</p></div> :
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
                                                {selectedContact.followups && selectedContact.followups.length > 0 ? (
                                                    selectedContact.followups.slice().reverse().map((followup, index) => (
                                                        <div key={index} className="border-2 rounded-lg dark:border-[#2b2b2b] dark:bg-[#1a1a1a] flex flex-col gap-1 px-3 py-4 text-sm">
                                                            <p className="flex flex-wrap justify-between sm:text-nowrap"><span className="font-semibold">Updated At :</span> {new Date(followup.updatedDate).toLocaleString()}</p>
                                                            <p className="flex flex-wrap justify-between sm:text-nowrap"><span className="font-semibold">Status :</span> <span className="text-[#f05f23]">{followup.followStatus}</span></p>
                                                            <p className="flex flex-wrap justify-between sm:text-nowrap"><span className="font-semibold">Message :</span> {followup.followupMessage}</p>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="flex flex-col items-center gap-2 px-3 py-4 text-sm font-semibold border-2 border-[#c5c5c5] dark:border-[#2b2b2b] dark:border-[#2b2b2b] rounded-lg border-dashed">
                                                        <p>No follow-ups available.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </>}
                                {/* <button
                                    className="mt-4 bg-accent text-white px-4 py-2 rounded-lg"
                                    onClick={closeModal}
                                >
                                    Close
                                </button> */}
                                {/* <button onClick={closeModal} className="absolute top-4 right-4 icon-lg flex items-center justify-center rounded-full bg-accent">
                                    <FaPlus className="rotate-45 text-mainBg" size={22} />
                                </button> */}
                            </div>
                        )}
                    </div>
                </>
            }

            <ToastContainer />
        </>
    );
};

export default Home;