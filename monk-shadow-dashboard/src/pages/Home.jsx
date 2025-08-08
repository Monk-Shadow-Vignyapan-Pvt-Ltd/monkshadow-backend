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
import { FaPlus } from 'react-icons/fa6';
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
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [message, setMessage] = useState("");
    const [pageName, setPageName] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [websiteUrl, setWebsiteUrl] = useState("");
    const [pages, setPages] = useState(["contactus", "home", "seo", "performancemarketing", "webdevelopment"])
    const [selectedContact, setSelectedContact] = useState({});
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
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
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const openModal = (contact = null) => {
        setEditingContact(contact);
        setName(contact ? contact.name : "");
        setEmail(contact ? contact.email : "");
        setPhone(contact ? contact.phone : "");
        setMessage(contact ? contact.message : "");
        setPageName(contact ? contact.pageName : "");
        setCompanyName(contact ? contact.companyName : "");
        setWebsiteUrl(contact ? contact.websiteUrl : "");
        setIsAddEditModalOpen(true);
    };



    const closeAddEditModal = () => {
        setIsAddEditModalOpen(false);
        setEditingContact(null);
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

            fetchData();
            setIsLoading(false);
            closeAddEditModal();
        } catch (error) {
            console.error('Error uploading contact:', error);
            toast.error('Failed to upload contact.');
        } finally {


        }
    };


    const handleDeleteClick = async (id) => {
        if (window.confirm('Are you sure you want to delete this contact?')) {
            try {
                setIsLoading(true);
                await axios.delete(`${API_BASE_URL}/${selectCountry}/contacts/deleteContact/${id}`);
                toast.success('contact deleted successfully!');
                fetchData()
                setIsLoading(false);
            } catch (error) {
                console.error('Error deleting contact:', error);
                toast.error('Failed to delete contact.');
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
                        onClick={() => openModal(row)}
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
        setIsLoading(false);
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
                fetchData();
            }
        } catch (error) {
            console.error('Error updating contact:', error);
            toast.error('Failed to update contact.');
        }
    };

    const handleShowForAllToggle = async (contact) => {
        setIsLoading(false);
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
                fetchData();
            }
        } catch (error) {
            console.error('Error updating contact:', error);
            toast.error('Failed to update contact.');
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
            closeStatusModal();
        } else {
            if (customStatuses.includes(newStatus)) {
                toast.error("Status already exists.");
                return;
            }
            const response = await axios.post(`${API_BASE_URL}/statuses/addStatus`, { name: newStatus });
            toast.success("Status added successfully.");
            setFollowStatus(response.data.status.name);
            fetchStatuses();
            closeStatusModal();

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
                setFollowStatus("");
                fetchStatuses();
                closeStatusModal();
            } catch (error) {
                console.error('Error deleting status:', error);
                toast.error('Failed to delete status.');
            }
        }
    };

    const openStatusModal = (status = null) => {
        setEditingStatus(status);
        setNewStatus(status ? status.name : "");
        setIsStatusModalOpen(true);
    }

    const closeStatusModal = () => {
        setIsStatusModalOpen(false);
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

            fetchData();
            setSelectedContact(response.data.contact);
            setFollowStatus("Pending");
            setFollowupMessage("");
            setIsFollowUpLoading(false);

        } catch (error) {
            console.error('Error uploading Follwup:', error);
            toast.error('Failed to upload Follwup.');
        } finally {


        }
    }

    return (
        <>
            {isLoading || isStatusLoading ? (
                <div className='w-full h-100 flex justify-center items-center bg-cardBg card-shadow rounded-lg'>
                    <i className="loader" />
                </div>) : <>

                <div className="mx-auto w-full flex flex-col col-span-12 md:col-span-8 justify-between bg-cardBg rounded-lg card-shadow p-5 gap-6">
                    <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <h3 className="text-xl font-bold text-accent">All Contacts</h3>
                        <div className="flex items-center border-2 px-3 py-2 rounded-lg">
                            <label htmlFor="search-FAQ"><SearchIcon width={18} height={18} fill={"none"} /></label>
                            <input id='search-FAQ' value={searchQuery} onChange={(e) => { fetchSearchData(e.target.value) }} className="ms-2 w-full sm:w-60 bg-transparent text-sm p-0 focus:outline-0" type="text" placeholder="Search by Name or Email etc." />
                        </div>
                        <button
                            onClick={() => openModal()}
                            className="bg-accent hover:bg-accent/70 px-3 py-2 h-full text-sm font-semibold text-cardBg rounded-lg"
                        >
                            Add Contact
                        </button>
                    </div>

                    <div className="flex border-b border-gray-200">
                        <button
                            className={`px-4 py-2 font-medium text-sm border-b-2  ${activeTab === 'pending' ? 'text-accent  border-accent'   : 'text-gray-500 border-transparent'}`}
                            onClick={() => setActiveTab('pending')}
                        >
                            Contact Pending
                        </button>
                        <button
                            className={`px-4 py-2 font-medium text-sm border-b-2  ${activeTab === 'closed' ? 'text-accent  border-accent' : 'text-gray-500 border-transparent'} `}
                            onClick={() => setActiveTab('closed')}
                        >
                            Contact Closed
                        </button>
                    </div>


                    {isSearchLoading &&
                        <div className={`flex-1 w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 2xl:grid-cols-4 gap-4 overflow-y-auto`}>
                            {filteredContactsList
                                .filter(contact =>
                                    activeTab === 'pending' ? !contact.isContactClose : contact.isContactClose
                                )
                                .map((contact) => (
                                    <div key={contact._id} className="border-2 h-fit rounded-lg relative flex flex-col gap-3 p-3">
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
                                                className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                                onChange={() => handleContactCloseToggle(contact)}
                                            />
                                            <span className="font-semibold text-sm">Contact Close</span>

                                        </div>

                                        {selectCountry === "canada" && role === "India" && <div className="flex items-center gap-1">
                                            <input
                                                type="checkbox"
                                                checked={contact.showForAll}
                                                className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                                onChange={() => handleShowForAllToggle(contact)}
                                            />
                                            <span className="font-semibold text-sm">Show For All</span>

                                        </div>}

                                        <div className="flex flex-col gap-1">
                                            <button
                                                className="bg-accent hover:bg-accent/70 px-3 py-2 h-full text-sm text-nowrap font-semibold text-cardBg rounded-lg"
                                                onClick={() => handleShowFollowups(contact)}
                                            >
                                                Follow-Up
                                            </button>
                                        </div>
                                        <div className="flex absolute top-2.5 right-2 gap-2">

                                            <button onClick={() => openModal(contact)}>
                                                <EditIcon width={16} height={16} fill={"#444050"} />
                                            </button>

                                            <button onClick={() => handleDeleteClick(contact._id)}>
                                                <MdOutlineDelete size={23} fill='#F05F23' />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    }
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
                    <Modal
                        isOpen={isAddEditModalOpen}
                        onRequestClose={closeAddEditModal}
                        contentLabel="Contact Modal"
                        className="w-full max-w-[500px] max-h-[96vh] overflow-auto bg-cardBg z-50 m-4 p-6 rounded-2xl flex flex-col gap-4"
                        overlayClassName="overlay"
                    >
                        <h2 className="text-xl font-bold text-accent">
                            {editingContact ? 'Edit Contact' : 'Add Contact'}
                        </h2>
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
                                className="bg-mainBg placeholder:text-secondaryText focus:outline-accent text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
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
                                className="bg-mainBg placeholder:text-secondaryText focus:outline-accent text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
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
                                className="bg-mainBg placeholder:text-secondaryText focus:outline-accent text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
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
                                className="bg-mainBg placeholder:text-secondaryText focus:outline-accent text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
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
                                    className="relative w-full cursor-default font-input-style text-sm rounded-lg px-3 py-2 bg-mainBg placeholder:text-secondaryText focus:ring-1 focus:outline-accent focus:ring-accent"
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
                                className="bg-mainBg placeholder:text-secondaryText focus:outline-accent text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
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
                                className="bg-mainBg placeholder:text-secondaryText focus:outline-accent text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
                            />
                        </div>}


                        <div className="grid grid-cols-2 gap-3 m-x-4 w-full">
                            <button
                                onClick={handleSubmit}
                                className={`px-6 py-2 rounded-lg text-cardBg text-md font-medium  ${editingContact
                                    ? 'bg-blue-600 hover:bg-blue-700'
                                    : 'bg-green-600 hover:bg-green-700'
                                    }`}
                            >
                                {editingContact ? 'Update Contact' : 'Add Contact'}
                            </button>
                            <button onClick={closeAddEditModal} className="px-6 py-2 rounded-lg font-medium text-md text-cardBg bg-dangerRed duration-300">
                                Cancel
                            </button>
                        </div>
                    </Modal>

                    <Modal
                        isOpen={isModalOpen}
                        onRequestClose={closeModal}
                        contentLabel="Follow-Ups Modal"
                        className="bg-white  p-6 rounded-lg shadow-lg max-w-lg w-full relative max-h-[95vh] overflow-y-auto"
                        overlayClassName="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50"
                    >
                        <div className="flex items-center justify-between w-full border-b-2 pb-4">
                            <h3 className="text-xl font-bold text-accent">Follow-Ups</h3>
                            <button onClick={closeModal} className="icon-lg flex items-center justify-center rounded-full bg-accent">
                                <FaPlus className="rotate-45 text-mainBg" size={22} />
                            </button>
                        </div>
                        {isFollowUpLoading ?
                            <div className='w-full h-100 flex justify-center items-center bg-cardBg card-shadow rounded-lg'>
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
                                                                    id="category"
                                                                    className="relative w-full h-8 cursor-default font-input-style text-sm rounded-lg px-3 py-2 bg-mainBg placeholder:text-secondaryText focus:ring-1 focus:outline-accent focus:ring-accent"
                                                                    aria-expanded="true"
                                                                >
                                                                    <span className="flex items-center">
                                                                        {followStatus}
                                                                    </span>
                                                                </ListboxButton>

                                                                <ListboxOptions className="absolute z-50 left-0 mt-1 w-full max-h-56 overflow-auto rounded-lg bg-white py-2 px-2 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">

                                                                    {customStatuses?.map((status) => (
                                                                        <ListboxOption
                                                                            key={status._id}
                                                                            value={status.name}
                                                                            className="group relative cursor-default select-none text-sm rounded-md py-2 px-2 text-gray-900 data-[focus]:bg-lightRed data-[focus]:text-white"
                                                                        >

                                                                            <div className="flex items-center justify-between">
                                                                                {status.name}
                                                                                {(status.name === "Pending" || status.name === "Cancelled") ? null :
                                                                                    <div className="flex items-center gap-1">
                                                                                        <button onClick={() => openStatusModal(status)}>
                                                                                            <EditIcon width={15} height={15} fill={"#000"} />
                                                                                        </button>
                                                                                        <button onClick={() => deleteStatus(status._id)}>
                                                                                            <MdOutlineDelete size={17} fill="#000" />
                                                                                        </button>
                                                                                    </div>}
                                                                            </div>
                                                                        </ListboxOption>
                                                                    ))}
                                                                </ListboxOptions>
                                                            </div>
                                                        </Listbox>
                                                        <button onClick={() => openStatusModal()} className="flex items-center justify-center p-2 rounded-lg bg-mainBg hover:bg-lightGray">
                                                            <FaPlus size={18} fill="#C03A03" />
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
                                                    className="bg-mainBg placeholder:text-secondaryText focus:outline-accent text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 mt-4 mb-2">
                                            <button
                                                onClick={() => handleAddFollowUp()}
                                                className="bg-accent hover:bg-accent/70 w-50 px-3 py-2 h-full text-sm font-semibold text-cardBg rounded-lg"
                                            >
                                                Add Follow Up
                                            </button>
                                        </div>
                                    </>
                                }


                                <div className=" mt-2">
                                    {selectedContact.followups && selectedContact.followups.length > 0 ? (
                                        selectedContact.followups.slice().reverse().map((followup, index) => (
                                            <div key={index} className="border-b-2 flex flex-col gap-2 py-4">
                                                <p><strong>Updated At:</strong> {new Date(followup.updatedDate).toLocaleString()}</p>
                                                <p><strong>Status:</strong> <span className="text-accent font-semibold">{followup.followStatus}</span></p>
                                                <p><strong>Message:</strong> {followup.followupMessage}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p>No follow-ups available.</p>
                                    )}

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
                    </Modal>

                    <Modal
                        isOpen={isStatusModalOpen}
                        onRequestClose={closeStatusModal}
                        className="flex flex-col gap-6 bg-white p-6 rounded-lg shadow-lg max-w-lg w-full relative"
                        overlayClassName="overlay"
                    >
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-bold">{editingStatus ? "Update Status" : "Add Status"}</h2>
                            <button onClick={closeStatusModal} className="icon-lg flex items-center justify-center rounded-full bg-accent">
                                <FaPlus className="rotate-45 text-mainBg" size={22} />
                            </button>
                        </div>
                        {editStatusLoading ?
                            <div className="col-span-12 sm:col-span-6 flex flex-col gap-1">
                                <Skeleton className="w-full min-h-8 object-cover rounded-lg" />
                            </div>
                            :
                            <div className="flex flex-col sm:flex-row items-center gap-3">
                                <div className="w-full sm:w-full flex-1">
                                    <input
                                        type="text"
                                        placeholder="Enter status"
                                        value={newStatus}
                                        onChange={(e) => setNewStatus(e.target.value)}
                                        className="w-full font-input-style text-md rounded-lg px-3 py-2 border border-border bg-mainBg placeholder:text-secondaryText focus:ring-1 focus:outline-accent focus:ring-accent"
                                    />
                                </div>
                                <div className="w-full sm:w-fit flex gap-2">
                                    <button
                                        onClick={addOrUpdateStatus}
                                        className="w-full sm:w-fit border-accent border bg-accent hover:bg-accent/70 duration-300 px-4 py-2 text-sm font-semibold text-white rounded-lg"
                                    >
                                        {editingStatus ? "Update Status" : "Add Status"}
                                    </button>
                                    <button
                                        onClick={closeStatusModal}
                                        className="w-full sm:w-fit border-secondaryText border bg-secondaryText hover:bg-secondaryText/80 duration-300 px-4 py-2 text-sm font-semibold text-white rounded-lg"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>}

                    </Modal>


                </div>
            </>}

            <ToastContainer />
        </>
    );
};

export default Home;
