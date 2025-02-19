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

const CareerForms = () => {
    const [careers, setCareers] = useState([]);
    const [followupsByCareer, setFollowupsByCareer] = useState({});
    const [selectedCareerFollowups, setSelectedCareerFollowups] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // Loading state
    const [searchQuery, setSearchQuery] = useState('');
    const {selectCountry} = useRoles();
    const [selectedCareer,setSelectedCareer] = useState({});
        const [isStatusModalOpen,setIsStatusModalOpen] = useState(false);
        const [editingStatus,setEditingStatus] = useState(null);
        const [newStatus, setNewStatus] = useState("");
        const [followStatus,setFollowStatus] = useState("Pending");
        const [followupMessage,setFollowupMessage] = useState("");
        const [customStatuses, setCustomStatuses] = useState([]);
        const [isStatusLoading,setIsStatusLoading] = useState(true);
        const [editStatusLoading,setEditStatusLoading] = useState(false);
        const [isFollowUpLoading,setIsFollowUpLoading] = useState(false);
        const [totalPages, setTotalPages] = useState(0);
        const [currentPage, setCurrentPage] = useState(1);
        const [filteredCareersList, setFilteredCareersList] = useState([]);
        const [originalTotalPages, setOriginalTotalPages] = useState(0);
        const [isSearchLoading, setIsSearchLoading] = useState(true);

    const fetchData = async (page) => {
        setIsLoading(true); // Start loading
        try {
            const careersResponse = await axios.get(`${API_BASE_URL}/${selectCountry}/careerForms/getCareerForms?page=${page}`);

            const careersData = careersResponse?.data?.careerForms || [];
            //const followupsData = followupsResponse?.data?.followups || [];

            setCareers(careersData);
            setFilteredCareersList(careersData);
            setOriginalTotalPages(careersResponse.data.pagination.totalPages)
            setTotalPages(careersResponse.data.pagination.totalPages);

            // const groupedFollowups = followupsData.reduce((acc, followup) => {
            //     const { careerFormId } = followup;
            //     if (!acc[careerFormId]) acc[careerFormId] = [];
            //     acc[careerFormId].push(followup);
            //     return acc;
            // }, {});

            // setFollowupsByCareer(groupedFollowups);
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
       // fetchData();
        fetchStatuses();
    }, []);

    useEffect(() => {
        fetchData(currentPage);
    }, [selectCountry,currentPage]);

    const handleShowFollowups = (careerFormId) => {
        const followups = followupsByCareer[careerFormId] || [];
        const sortedFollowups = [...followups].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        setSelectedCareerFollowups(sortedFollowups);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const careerColumns = [
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
            name: 'Position',
            // selector: row => row.message,
            selector: row => (
                <div id={`tooltip-${row.careerId}`} className="tooltip-wrapper">
                    {row.careerId}
                    <ReactTooltip
                        anchorId={`tooltip-${row.careerId}`}
                        place="top"
                        content={row.careerId}
                    />
                </div>
            ),
            sortable: true,
        },
        {
            name: 'Follow-Ups',
            cell: row => (
                <button
                    className="bg-accent hover:bg-accent/70 px-3 py-2 h-full text-sm text-nowrap font-semibold text-cardBg rounded-lg"
                    onClick={() => handleShowFollowups(row._id)}
                >
                    View Follow-Ups
                </button>
            ),
        },
        {
            name: 'Career Close',
            cell: row => (
                <div className="flex gap-4">
                    <input
                        type="checkbox"
                        checked={row.isCareerClose}
                        className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        onChange={() => handleCareerCloseToggle(row)}
                    />
                    <div id={`tooltip-${row._id}`} className="tooltip-wrapper">
                        <IoIosInformationCircleOutline size={22} fill={"#444050"} />
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
        },
    ];

    const handleCareerCloseToggle = async (career) => {
        setIsLoading(false);
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
                fetchData();
            }
        } catch (error) {
            console.error('Error updating career form:', error);
            toast.error('Failed to update career form.');
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

    const filteredCareers = careers.filter(career =>
        career.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        career.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        career.email.toLowerCase().includes(searchQuery.toLowerCase()) 
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

    const openStatusModal = (status = null ) =>{
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

        if (!followupMessage ) {
            setIsFollowUpLoading(false);
            return toast.warn('Please fill out Follow Up Message');
        }

        const data = {
            name:selectedCareer.name,
            phone:selectedCareer.phone,
            email:selectedCareer.email, // May be null if no file is provided
            resume:selectedCareer.resume,
            city:selectedCareer.city,
            readytoRelocate:selectedCareer.readytoRelocate,
            allowYoutoContact:selectedCareer.allowYoutoContact,
            careerId:selectedCareer.careerId,
            isCareerClose:selectedCareer.isCareerClose,
            followups: [
                ...(selectedCareer.followups || []), // Ensure followups is an array
                { followStatus, followupMessage ,updatedDate:new Date()},
            ]
        };

        try {
            const endpoint = `${API_BASE_URL}/${selectCountry}/careers/updateCareer/${selectedCareer._id}`;

            const response = await axios.post(endpoint, data, {
                headers: { 'Content-Type': 'application/json' },
            });

            toast.success('Follwup added successfully!');

            fetchData();
            setSelectedCareer(response.data.career);
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
                        <h3 className="text-xl font-bold text-accent">All Career Forms</h3>
                        <div className="flex items-center border-2 px-3 py-2 rounded-lg">
                            <label htmlFor="search-careers"><SearchIcon width={18} height={18} fill={"none"} /></label>
                            <input id='search-careers' value={searchQuery} onChange={(e) => { fetchSearchData(e.target.value) }} className="ms-2 w-full sm:w-60 bg-transparent text-sm p-0 focus:outline-0" type="text" placeholder="Search by Name or Email etc." />
                        </div>
                    </div>
                    
                        {isSearchLoading &&
                                            <div className={`flex-1 w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 2xl:grid-cols-4 gap-4 overflow-y-auto`}>
                                                {/* <DataTable
                                                    columns={contactColumns}
                                                    data={filteredContacts}
                                                    pagination
                                                    highlightOnHover
                                                    pointerOnHover
                                                    // striped
                                                    customStyles={customStyles}
                                                /> */}
                        
                                                {filteredCareersList.map((career) => (
                                                                                                        <div key={career._id} className="border-2 h-fit rounded-lg relative flex flex-col gap-3 p-3">
                                                                                                            {/* <div className="flex items-center gap-1">
                                                                                                                <span className="font-semibold text-sm">Id</span>
                                                                                                                <span className="text-sm">{contact._id.slice(-4)}</span>
                                                                                                            </div> */}
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
                                                                                                                    className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                                                                                                    onChange={() => handleCareerCloseToggle(career)}
                                                                                                                />
                                                                                                                <span className="font-semibold text-sm">Career Close</span>
                                                                                                                
                                                                                                            </div>
                        
                        
                                                                                                            <div className="flex flex-col gap-1">
                                                                                                            <button
                                                                                                                className="bg-accent hover:bg-accent/70 px-3 py-2 h-full text-sm text-nowrap font-semibold text-cardBg rounded-lg"
                                                                                                                onClick={() => handleShowFollowups(career)}
                                                                                                            >
                                                                                                                Follow-Up
                                                                                                            </button>
                                                                                                            </div>
                                                                                                            
                                                                                                        </div>
                                                                                                    ))}
                                                 
                                            </div> }
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
                                           {selectedCareer.isCareerClose ? <div className="flex flex-col gap-2 mt-2"> <p>This Career Is Closed.</p></div> :
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
                                                      </div> }
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
                                           {selectedCareer.followups && selectedCareer.followups.length > 0 ? (
                                                   selectedCareer.followups.slice().reverse().map((followup, index) => (
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
                                                               </div> }
                                                               
                                                           </Modal>

                    
                </div>
                </>}
                <ToastContainer />
        </>
    );
};

export default CareerForms;
