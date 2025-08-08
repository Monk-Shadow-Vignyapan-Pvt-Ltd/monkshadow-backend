import React, { useState, useEffect } from 'react';
import { HeroSection } from '../section/HeroSection';

import { Datepicker } from "flowbite-react";
// import { DataSvg } from '../components/Icons/DataSvg';
import { ShowPasswordIcon } from '../components/Icons/ShowPasswordIcon';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import 'flatpickr/dist/plugins/confirmDate/confirmDate.css';
import confirmDate from 'flatpickr/dist/plugins/confirmDate/confirmDate';

import { Label, Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'
import { CloseIcon } from '../components/Icons/CloseIcon';
import axios from 'axios';
import Modal from "react-modal";
import DataTable from 'react-data-table-component';
import { SearchIcon } from '../components/Icons/SearchIcon.jsx';
import { EditIcon } from '../components/Icons/EditIcon.jsx';
import { MdOutlineDelete } from 'react-icons/md';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { IoIosInformationCircleOutline } from "react-icons/io";
import { FaLessThanEqual } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { API_BASE_URL } from '../config/constant.js';
import Select from 'react-select';
import { useRoles } from '../RolesContext';
import AccessDenied from '../components/AccessDenied.jsx';
import { FaPlus } from 'react-icons/fa6';
import { FaCheck } from 'react-icons/fa6';
import { Link, useLocation } from 'react-router-dom'
import Editor from '../components/Editor.jsx';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import AddProcedure from './AddProcedure.jsx';
import EditPatient from './EditPatient.jsx';
import CreateInvoice from '../components/CreateInvoice.jsx';
import moment from "moment";
import Calendar from 'react-calendar';

Modal.setAppElement("#root"); // Required for accessibility

const UpdatePatient = ({ isModalOpen, setIsModalOpen, patientId, currentAppointment, setCurrentAppointment, isUpdatePatient, setIsUpdatePatient }) => {
    //const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [doctors, setDoctors] = useState([]);
    //const [doctorsList, setDoctorsList] = useState([]);
    const [isDoctorLoading, setIsDoctorLoading] = useState(true);
    const { centerId } = useRoles();
    const { userRole } = useRoles();
    const [patientDetail, setPatientDetail] = useState({});
    const [uploading, setUploading] = useState(false);
    const [isActive, setIsActive] = useState(1);
    const [appointments, setAppointments] = useState([]);
    const [isAppointmentLoading, setIsAppointmentLoading] = useState(true);
    const [reportsList, setReportsList] = useState([]);
    const [selectedReport, setSelectedReport] = useState("");
    const [isReportLoading, setIsReportLoading] = useState(true);
    const [description, setDescription] = useState("");
    const [impression, setImpression] = useState("");
    const [advice, setAdvice] = useState("");
    const [procedures, setProcedures] = useState([]);
    const [proceduresList, setProceduresList] = useState([]);
    const [selectedProcedure, setSelectedProcedure] = useState("");
    const [isProcedureLoading, setIsProcedureLoading] = useState(true);
    const [sections, setSections] = useState([]);
    const [isEditPatientModalOpen, setIsEditPatientModalOpen] = useState(false);
    const [invoicePlan, setInvoicePlan] = useState([]);
    const [invoiceId, setInvoiceId] = useState(null);
    const [isEditingReport, setIsEditingReport] = useState(false);
    const [currentReportIndex, setCurrentReportIndex] = useState(0);
    const [isEditingInvoice, setIsEditingInvoice] = useState(false);
    const [editingInvoiceId, setEditingInvoiceId] = useState('');
    const [editingAppointment, setEditingAppointment] = useState({});
    const [isEditingProcedure, setIsEditingProcedure] = useState(false);
    const [isEditingCurrentAppointmentInvoice,setIsEditingCurrentAppointmentInvoice] = useState(false);

    const [timesList, setTimesList] = useState([]);
        const [selectedDate, setSelectedDate] = useState(null);
        const [isCalendarOpen, setIsCalendarOpen] = useState(false);
        const [selectedTime, setSelectedTime] = useState(null);

    useEffect(() => {
        openModal();
        getPatientbyId();
        getAppointmentsByPatientId();
        // getReports();
        getDoctors();
        fetchProcedures();
        getAvailableTime();
    }, []);

    const getPatientbyId = async () => {
        try {
            const response = await axios.put(`${API_BASE_URL}/patients/getPatientById/${patientId}`);
            setPatientDetail(response.data.patient)
            setIsLoading(false);
        } catch (error) {
            toast.error('Error fetching patient:', error);
            console.error('Error fetching patient:', error)
        }
    };

    const getDoctors = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/doctors/getDoctors`);
            // setDoctorsList(response.data.doctors.filter(doctor => doctor.isPartner));
            setDoctors(response.data.doctors);
            setIsDoctorLoading(false);
        } catch (error) {
            toast.error('Error fetching doctors:', error);
            console.error('Error fetching doctors:', error)
        }
    };

    const getAppointmentsByPatientId = async () => {
        try {
            const response = await axios.put(`${API_BASE_URL}/appointments/getAppointmentsByPatientId/${patientId}`);
            setAppointments(response.data.appointments.reverse());
            // setSections(currentAppointment?.procedurePlan && currentAppointment?.procedurePlan.length > 0 ? currentAppointment?.procedurePlan : []);
            setIsAppointmentLoading(false);
        } catch (error) {
            toast.error('Error fetching patient:', error);
            console.error('Error fetching patient:', error)
        }
    };

    const getReports = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/reports/getReports`);
            setReportsList(response.data.reports);
            setIsReportLoading(false);
        } catch (error) {
            toast.error('Error fetching reports:', error);
            console.error('Error fetching reports:', error)
        }
    };

    const fetchProcedures = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/procedures/getProcedures`);
            setProceduresList(response.data.procedures);
            setProcedures(response.data?.procedures
                .map(procedure => ({ value: procedure._id, label: procedure.procedureName })));
            setIsProcedureLoading(false);
        } catch (error) {
            console.error('Error fetching procedures:', error);
            toast.error('Failed to fetch procedures.');
        }
    };


    const handleReportChange = (e) => {
        setSelectedReport(e.target.value);
        setDescription(reportsList.find(report => report._id === e.target.value).description)
        setImpression(reportsList.find(report => report._id === e.target.value).impression)
        setAdvice(reportsList.find(report => report._id === e.target.value).advice)
    };

    // const handleEdit = (patient) => {
    //     // getDoctors();
    //     setIsActive(0);
    //     setIsEditPatientModalOpen(true);

    // };


     const [isEditPatientNameModalOpen, setIsEditPatientNameModalOpen] = useState(false);
        const [isEditPatient,setIsEditPatient] = useState(false);
    
        useEffect(() => {
            if (isEditPatient) {
                setIsLoading(true);
            getPatientbyId();
            handlePatientHistory();
            setIsUpdatePatient(true);
            }
    
        }, [isEditPatient])

    const handleAppointmentSubmit = async (e) => {
        e.preventDefault();
        setIsReportLoading(true);
        setIsProcedureLoading(true);
        if (isActive === 4 && invoicePlan.length > 0) {
            for (const procedure of invoicePlan || []) {
                for (const inventory of procedure.usedInventories || []) {
                    for (const selectedStockItem of inventory.selectedStock || []) {
                        let stockoutData = {
                            vendorId: selectedStockItem.stock.vendorId,
                            inventoryId: selectedStockItem.stock.inventoryId,
                            totalStock: selectedStockItem.stockOut.length,
                            others: selectedStockItem.stockOut,
                            centerId: centerId
                        };
            
                        try {
                            let stockoutResponse;
                            let checkstockResponse;
                            if (!isEditingInvoice && !isEditingCurrentAppointmentInvoice) {
                                stockoutResponse = await axios.post(`${API_BASE_URL}/stockouts/addStockout`, stockoutData);
                            } else {
                                if(selectedStockItem.stockOutId ){
                                    // checkstockResponse  = await axios.put(
                                    //     `${API_BASE_URL}/stockouts/getStockoutById/${selectedStockItem.stockOutId}`
                                    // );
                                    stockoutResponse = await axios.post(
                                        `${API_BASE_URL}/stockouts/updateStockout/${selectedStockItem.stockOutId}`,
                                        stockoutData
                                    );
                                }else{
                                    stockoutResponse = await axios.post(`${API_BASE_URL}/stockouts/addStockout`, stockoutData); 
                                }
                                
                            }
            
                            selectedStockItem.stockOutId = stockoutResponse?.data?.stockout?._id;
            
                            // Ensure stockOutId is mapped correctly
                            if (!selectedStockItem.stockOutId) {
                                console.error("StockOut ID is null!", stockoutResponse.data);
                            }
            
                           

                            let updatedStock = false;
                            let filteredOthers = selectedStockItem.stock?.others || [];
                            

                            // Process stockOutItem logic
                            for (const stockOutItem of selectedStockItem.stockOut || []) {
                                
                                if (selectedStockItem.stock?.others) {
                                    
                                    filteredOthers = filteredOthers.filter(
                                        other => !stockOutItem.stock.id || other.id !== stockOutItem.stock.id
                                    );
                                    updatedStock = true;
                                }
                            }
                           
                            // Add new stock items **only once** after filtering
                            // if (
                            //     checkstockResponse?.data?.stockout?.others?.length > stockoutResponse?.data?.stockout?.others?.length
                            // ) {
                            //     const newStockItems = checkstockResponse?.data?.stockout?.others
                            //         ?.filter(item =>
                            //             !stockoutResponse?.data?.stockout?.others?.some(stockItem => stockItem.value === item.value) 
                            //         )
                            //         ?.map(item => ( item.stock ));

                            //     filteredOthers = [...filteredOthers, ...newStockItems];
                            //     updatedStock = true;
                            // }

                            // Update stock **only once** if modified
                            updatedStock = true;
                            if (updatedStock) {
                                selectedStockItem.stock.others = filteredOthers;
                                selectedStockItem.stock.totalStock = filteredOthers.length;

                                await axios.post(
                                    `${API_BASE_URL}/stockins/updateStockin/${selectedStockItem.stock._id}`,
                                    selectedStockItem.stock
                                );
                            }


                        } catch (error) {
                            console.error("Error processing stockout:", error);
                        }
                    }
                }
            }
            

            const response1 = isEditingInvoice ? await axios.post(`${API_BASE_URL}/invoices/updateInvoice/${editingInvoiceId}`, { invoicePlan: invoicePlan }) : 
            isEditingCurrentAppointmentInvoice ? await axios.post(`${API_BASE_URL}/invoices/updateInvoice/${currentAppointment.invoiceId}`, { invoicePlan: invoicePlan }) :
            await axios.post(`${API_BASE_URL}/invoices/addInvoice`, { invoicePlan: invoicePlan });

            setInvoiceId(response1.data.invoice._id);
            const data = isEditingInvoice ? { ...editingAppointment, invoiceId: response1.data.invoice._id } : { ...currentAppointment, invoiceId: response1.data.invoice._id };
            try {

                const response = isEditingInvoice ? await axios.post(`${API_BASE_URL}/appointments/updateAppointment/${editingAppointment._id}`, data) : await axios.post(`${API_BASE_URL}/appointments/updateAppointment/${currentAppointment._id}`, data);
                toast.success('Appointment updated successfully!');
                isEditingInvoice ? setEditingAppointment(response.data.appointment) : setCurrentAppointment(response.data.appointment)
                handlePatientHistory();
                setIsReportLoading(false);
                setIsProcedureLoading(false);
                setIsEditingReport(false);
                setCurrentReportIndex(0);
                setIsUpdatePatient(true);

            } catch (error) {
                console.error('Error saving appointment:', error);
                toast.error('Error saving appointment:')
            }
        } else if (isActive === 2) {
            const data = isEditingReport ? {
                ...editingAppointment, reports: (editingAppointment.reports || []).map((report, index) =>
                    index === currentReportIndex
                        ? { description, impression, advice } // Update the specific report
                        : report // Keep other reports unchanged
                )
            } : {
                ...currentAppointment, reports: [
                    ...(currentAppointment.reports || []), // Ensure reports is an array
                    { description, impression, advice },
                ]
            };
            try {

                const response = isEditingReport ? await axios.post(`${API_BASE_URL}/appointments/updateAppointment/${editingAppointment._id}`, data) : await axios.post(`${API_BASE_URL}/appointments/updateAppointment/${currentAppointment._id}`, data);
                toast.success('Appointment updated successfully!');
                isEditingReport ? setEditingAppointment(response.data.appointment) : setCurrentAppointment(response.data.appointment)
                handlePatientHistory();
                setIsReportLoading(false);
                setIsProcedureLoading(false);
                setIsEditingReport(false);
                setCurrentReportIndex(0);
                setIsUpdatePatient(true);
            } catch (error) {
                console.error('Error saving appointment:', error);
                toast.error('Error saving appointment:')
            }

        } else {
            const data = isEditingProcedure ? { ...editingAppointment, procedurePlan: sections } : { ...currentAppointment, procedurePlan: sections }
            try {

                const response = isEditingProcedure ? await axios.post(`${API_BASE_URL}/appointments/updateAppointment/${editingAppointment._id}`, data) : await axios.post(`${API_BASE_URL}/appointments/updateAppointment/${currentAppointment._id}`, data);
                toast.success('Appointment updated successfully!');
                isEditingProcedure ? setEditingAppointment(response.data.appointment) : setCurrentAppointment(response.data.appointment)
                handlePatientHistory();
                setIsReportLoading(false);
                setIsProcedureLoading(false);
                setIsEditingReport(false);
                setCurrentReportIndex(0);
                setIsUpdatePatient(true);
            } catch (error) {
                console.error('Error saving appointment:', error);
                toast.error('Error saving appointment:')
            }
        }



    }

    const openModal = () => {

        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        
    };

    const handlePatientHistory = () => {
        setIsActive(1);
        getAppointmentsByPatientId();
    }

    const handlePatientReport = () => {
        setIsActive(2);
        setDescription("");
        setImpression("");
        setAdvice("");
        setSelectedReport('');
        getReports();
    }

    const handleEditPatientReport = (report, index, appointment) => {
        setIsActive(2);
        setDescription(report.description);
        setImpression(report.impression);
        setAdvice(report.advice);
        setSelectedReport('');
        setEditingAppointment(appointment);
        setIsEditingReport(true);
        setCurrentReportIndex(index);
        getReports();
    }

    const handleEditInvoice = (id, appointment, invoicePlan) => {
        setInvoicePlan(invoicePlan);
        setEditingInvoiceId(id);
        setIsEditingInvoice(true);
        setEditingAppointment(appointment);
        setIsActive(4);

    }

    const handlePatientInvoice = async () => {


        if (currentAppointment.invoiceId) {
            try {
                const response = await axios.put(`${API_BASE_URL}/invoices/getInvoiceById/${currentAppointment.invoiceId}`);
                setInvoicePlan(response.data.invoice.invoicePlan)
                setIsEditingInvoice(false);
                setIsEditingCurrentAppointmentInvoice(true);
                setEditingAppointment(currentAppointment);
                setEditingInvoiceId(response.data.invoice._id);
                setIsActive(4);
            } catch (error) {
                toast.error('Error fetching patient:', error);
                console.error('Error fetching patient:', error)
            }
        } else {
            setInvoicePlan([]);
            setIsEditingInvoice(false);
            setIsActive(4);
            setIsEditingCurrentAppointmentInvoice(false);

        }



    }

    const handlePatientProcedure = () => {
        setIsActive(3);
        setIsEditingProcedure(false);
        setSections(currentAppointment.procedurePlan || []);
        const procedures1 = proceduresList || [];
        const procedurePlan1 = currentAppointment?.procedurePlan || [];

        const selectedProcedures1 = procedurePlan1.length > 0
            ? procedures1
                .filter(procedure => procedurePlan1.some(pro => pro.value === procedure._id))
                .map(procedure => ({ value: procedure._id, label: procedure.procedureName }))
            : [];

        setSelectedProcedure(selectedProcedures1);
    }

    const handleEditPatientProcedure = (appointment, procedurePlan) => {
        setIsActive(3);
        setSections(procedurePlan);
        setEditingAppointment(appointment);
        setIsEditingProcedure(true);
        const procedures1 = proceduresList || [];
        const procedurePlan1 = procedurePlan || [];

        const selectedProcedures1 = procedurePlan1.length > 0
            ? procedures1
                .filter(procedure => procedurePlan1.some(pro => pro.value === procedure._id))
                .map(procedure => ({ value: procedure._id, label: procedure.procedureName }))
            : [];

        setSelectedProcedure(selectedProcedures1);
    }

    const handleSelectedProcedure = (selected) => {
        setSelectedProcedure(selected);

        setSections(prevSections => {
            // Map through the selected procedures
            return selected.map((sel, index) => {
                // Find procedure details from proceduresList
                const procedure = proceduresList.find(procedure => procedure._id === sel.value);

                // Check if the procedure already exists in the sections
                const existingSection = prevSections.find(section => section.value === sel.value);

                // If the procedure exists, keep the existing edited values, else use the new procedure details
                return {
                    ...sel,
                    id: index + 1,
                    procedureName: procedure.procedureName,
                    qty: existingSection ? existingSection.qty : 1,
                    cost: existingSection ? existingSection.cost : procedure.cost,
                    discount: existingSection ? existingSection.discount : 0,
                    discountType: existingSection ? existingSection.discountType : 'INR',
                    gst: existingSection ? existingSection.gst : procedure.gst,
                    notes: existingSection ? existingSection.notes : procedure.notes,
                    instructions: existingSection ? existingSection.instructions : procedure.instructions
                };
            });
        });
    };

    const [isNotesModalOpen, setNotesModalOpen] = useState(false);
    const [isInstructionsModalOpen, setInstructionsModalOpen] = useState(false);
    const [isDateTimeModalOpen, setDateTimeModalOpen] = useState(false);
    const [currentSection, setCurrentSection] = useState(null);
    const [notes, setNotes] = useState("");
    const [instructions, setInstructions] = useState([{ id: 1, time: "", timeValue: "Hour(s)", visit: 'after', instruction: '' }]);
    const [times, setTimes] = useState(['Hour(s)', 'Day(s)', 'Week(s)', 'Year(s)'])
    const [dateTime, setDateTime] = useState("");
    const [isPickerOpen, setPickerOpen] = useState(false);

    const handleOpenModal = (type, section) => {
        setCurrentSection(section);
        if (type === "notes") {
            setNotesModalOpen(true);
            setNotes(section.notes ? section.notes : "");
        }
        else if (type === "instructions") {
            setInstructionsModalOpen(true);
            setInstructions(section.instructions ? section.instructions : [{ id: 1, time: "", timeValue: "Hour(s)", visit: 'after', instruction: '' }]);
        }
        else if (type === "datetime") {
            setDateTimeModalOpen(true);
            setDateTime(section.dateTime ? new Date(section.dateTime) : '');
        }
    };

    useEffect(() => {
        if (isDateTimeModalOpen) {
            setPickerOpen(true); // Ensure the picker opens when the modal opens
        } else {
            setPickerOpen(false); // Close the picker when the modal is closed
        }
    }, [isDateTimeModalOpen]);


    const handleCloseModal = () => {
        setNotesModalOpen(false);
        setNotes('');
        setInstructions([{ id: 1, time: "", timeValue: "Hour(s)", visit: 'after', instruction: '' }])
        setDateTime("");
        setInstructionsModalOpen(false);
        setDateTimeModalOpen(false);
    };

    const addNewModulepoint = () => {
        const maxId = Math.max(...instructions.map(item => item.id));
        setInstructions([...instructions, { id: maxId + 1, time: "", timeValue: "Hour(s)", visit: 'after', instruction: '' }]);
    };

    const removeModulepoint = (id) => {
        setInstructions((prevModulepoints) => prevModulepoints.filter((modulepoint) => modulepoint.id !== id));
    };

    const handletimeChange = (id, value) => {
        setInstructions((prevModulepoints) =>
            prevModulepoints.map((modulepoint) =>
                modulepoint.id === id ? { ...modulepoint, time: value } : modulepoint
            )
        );
    };

    const handletimeValueChange = (id, value) => {
        setInstructions((prevModulepoints) =>
            prevModulepoints.map((modulepoint) =>
                modulepoint.id === id ? { ...modulepoint, timeValue: value } : modulepoint
            )
        );
    };

    const handlevisitChange = (id, value) => {
        setInstructions((prevModulepoints) =>
            prevModulepoints.map((modulepoint) =>
                modulepoint.id === id ? { ...modulepoint, visit: value } : modulepoint
            )
        );
    };

    const handleinstructionChange = (id, value) => {
        setInstructions((prevModulepoints) =>
            prevModulepoints.map((modulepoint) =>
                modulepoint.id === id ? { ...modulepoint, instruction: value } : modulepoint
            )
        );
    };

    const handleSave = (type) => {
        const updatedSections = [...sections];
        const index = updatedSections.findIndex((sec) => sec.id === currentSection.id);

        if (type === "notes") updatedSections[index].notes = notes;
        else if (type === "instructions") updatedSections[index].instructions = instructions;
        else if (type === "datetime") updatedSections[index].dateTime = dateTime;

        setSections(updatedSections);
        handleCloseModal();
    };

    const [isProcedureModalOpen, setIsProcedureModalOpen] = useState(false);
    const [isAddNewProcedure, setIsAddNewProcedure] = useState(false);
    useEffect(() => {
        if (isAddNewProcedure) {
            setIsProcedureLoading(true);
            fetchProcedures();
        }

    }, [isAddNewProcedure])

    const openProcedureModal = () => {
        setIsProcedureModalOpen(true);
    };

    const getAvailableTime = (selectedDate) => {
            const today = moment(selectedDate).startOf("day");
    
            const availableTimes = [];
            for (let minute = 0; minute < 24 * 60; minute += 15) {
                const timeISO = today.clone().add(minute, "minutes").toISOString();
                const timeLabel = today.clone().add(minute, "minutes").format("h:mm A");
    
                availableTimes.push({ iso: timeISO, label: timeLabel });
            }
    
            setTimesList(availableTimes);
        };

        const toggleCalendar = () => {
            setIsCalendarOpen(!isCalendarOpen);
        };
    
        const handleDateChange = (date) => {
            setSelectedDate(date);
            //getAvailableTime(date);
            setIsCalendarOpen(false); // Close the calendar after date selection
        };


    return (
        <>
            {userRole === "Super Admin" || userRole === "Admin" || userRole === "Doctor" ?

                <>

                    <Modal
                        isOpen={isModalOpen}
                        onRequestClose={closeModal}
                        contentLabel="Update Patient  Modal"
                        className="w-full  max-h-[96vh] overflow-auto bg-cardBg z-50 m-4 p-6 rounded-2xl flex flex-col gap-4"
                        overlayClassName="overlay"
                    >
                        {isLoading || isDoctorLoading ?
                            <div className='w-full h-100 flex justify-center items-center bg-cardBg rounded-lg'>
                                <i className="loader" />
                            </div>
                            :
                            <>
                                <div className="w-full flex items-center justify-between gap-3">
                                    <h2 className="text-xl font-bold text-accent">
                                        Patient
                                    </h2>

                                    <div className="grid  grid-cols-2 gap-3">
                                        <button onClick={() => setIsModalOpen(false)} className="icon-xl flex items-center justify-center rounded-lg bg-dangerRed hover:bg-dangerRed/75 duration-300">
                                            <FaPlus className="rotate-45" size={18} fill={"#ffffff"} />
                                        </button>
                                        {isActive === 1 ? null : <button
                                            onClick={handleAppointmentSubmit}
                                            disabled={uploading}
                                            className={`icon-xl flex items-center justify-center rounded-lg duration-300 bg-blue-600 hover:bg-blue-700 ${uploading
                                                ? 'bg-gray-400 cursor-not-allowed' : ''
                                                }`}
                                        >
                                            <FaCheck size={18} fill={"#ffffff"} />
                                        </button>}

                                    </div>
                                </div>
                                <div className="grid grid-cols-12 gap-4 flex-1 overflow-y-auto">
                                    {/* First Div */}

                                    <div className="col-span-4 flex flex-col">
                                        <div className='flex items-center justify-between gap-2'>
                                            <span> {patientDetail.patientName}</span>

                                            <button onClick={() => setIsEditPatientNameModalOpen(true)} className="text-sm text-accent">
                                                Edit
                                            </button>
                                        </div>
                                        <div className='flex items-center gap-2'>
                                            <span> {patientDetail.age}</span>
                                            <span> {patientDetail.gender}</span>
                                            <span> {patientDetail.phoneNo}</span>
                                        </div>
                                        <hr></hr>
                                        <div className="main-sidebar flex-1 overflow-y-auto" id="sidebar-scroll">
                                            {/* Start::nav */}
                                            <nav className="main-menu-container nav nav-pills flex-column sub-open">
                                                <ul className="main-menu flex flex-col">
                                                    <div className="mb-2">

                                                        <li className="mb-2 last:mb-0">
                                                            <Link onClick={() => handlePatientHistory()} className={`current-menu-section menu-section duration-100 ease-linear 
                                                px-3 py-2 flex items-center relative justify-between ${isActive === 1 && 'bg-menuActive'} hover:bg-menuActive rounded-lg`}  >
                                                                <div className="flex items-center flex-1">
                                                                    <div className={`active-menu-status ${isActive === 1 && 'bg-accent'} h-3 w-2 absolute left-[-4px] rounded-lg`}></div>

                                                                    <span className="text-md ms-2">Patient History</span>
                                                                </div>
                                                            </Link>
                                                        </li>

                                                        <li className="mb-2 last:mb-0">
                                                            <Link onClick={() => handlePatientReport()} className={`current-menu-section menu-section duration-100 ease-linear 
                                                px-3 py-2 flex items-center relative justify-between ${isActive === 2 && 'bg-menuActive'} hover:bg-menuActive rounded-lg`}  >
                                                                <div className="flex items-center flex-1">
                                                                    <div className={`active-menu-status ${isActive === 2 && 'bg-accent'} h-3 w-2 absolute left-[-4px] rounded-lg`}></div>

                                                                    <span className="text-md ms-2">Report</span>
                                                                </div>
                                                            </Link>
                                                        </li>

                                                        <li className="mb-2 last:mb-0">
                                                            <Link onClick={() => handlePatientProcedure()} className={`current-menu-section menu-section duration-100 ease-linear 
                                                           px-3 py-2 flex items-center relative justify-between ${isActive === 3 && 'bg-menuActive'} hover:bg-menuActive rounded-lg`}  >
                                                                <div className="flex items-center flex-1">
                                                                    <div className={`active-menu-status ${isActive === 3 && 'bg-accent'} h-3 w-2 absolute left-[-4px] rounded-lg`}></div>

                                                                    <span className="text-md ms-2">Procedure Plan</span>
                                                                </div>
                                                            </Link>
                                                        </li>

                                                        <li className="mb-2 last:mb-0">
                                                            <Link onClick={() => handlePatientInvoice()} className={`current-menu-section menu-section duration-100 ease-linear 
                                                           px-3 py-2 flex items-center relative justify-between ${isActive === 4 && 'bg-menuActive'} hover:bg-menuActive rounded-lg`}  >
                                                                <div className="flex items-center flex-1">
                                                                    <div className={`active-menu-status ${isActive === 4 && 'bg-accent'} h-3 w-2 absolute left-[-4px] rounded-lg`}></div>

                                                                    <span className="text-md ms-2">Create Invoice</span>
                                                                </div>
                                                            </Link>
                                                        </li>

                                                        <li className="mb-2 last:mb-0">
                                                            <Link onClick={() => setIsActive(5)} className={`current-menu-section menu-section duration-100 ease-linear 
                                                           px-3 py-2 flex items-center relative justify-between ${isActive === 5 && 'bg-menuActive'} hover:bg-menuActive rounded-lg`}  >
                                                                <div className="flex items-center flex-1">
                                                                    <div className={`active-menu-status ${isActive === 5 && 'bg-accent'} h-3 w-2 absolute left-[-4px] rounded-lg`}></div>

                                                                    <span className="text-md ms-2">Investigation Report</span>
                                                                </div>
                                                            </Link>
                                                        </li>

                                                    </div>

                                                </ul>
                                            </nav>
                                            {/* End::nav */}
                                        </div>

                                    </div>
                                    {/* Second Div */}
                                    <div className="col-span-8">
                                        {/* {isActive === 0 && <>
                                            <EditPatient isModalOpen={isEditPatientModalOpen} setIsModalOpen={setIsEditPatientModalOpen} doctors={doctors} patientDetail={patientDetail} isEditPatient={isEditPatient} setIsEditPatient={setIsEditPatient} />

                                        </>} */}

                                        {isActive === 1 && <>
                                            {isAppointmentLoading || isDoctorLoading ? <div className='w-full h-100 flex justify-center items-center bg-cardBg rounded-lg'>
                                                <i className="loader" />
                                            </div>
                                                :
                                                <div className="p-6 space-y-8 bg-gray-50">
                                                    {appointments.map((appointment, index) => (
                                                        <div
                                                            key={appointment._id}
                                                            className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
                                                        >

                                                            <h2 className="text-xl font-semibold text-gray-500">
                                                                {new Date(appointment.start).toLocaleDateString(undefined, {
                                                                    weekday: "long",
                                                                    year: "numeric",
                                                                    month: "long",
                                                                    day: "numeric",
                                                                })}
                                                            </h2>
                                                            {/* {appointment.invoiceId &&  <div className="flex items center justify-between">
                                                                            <h3 className="text-lg font-semibold text-gray-800">

                                                                                {appointment.invoiceId}
                                                                            </h3>
                                                                            <button onClick={() => handleEditInvoice(appointment.invoiceId)}>
                                                                                <EditIcon width={20} height={20} fill={"#444050"} />
                                                                            </button>
                                                                        </div>} */}

                                                            {appointment?.invoiceId && (
                                                                <div class="w-full bg-gray-200 mt-2">
                                                                    <div className="flex items center justify-between">
                                                                        <h3 className="text-lg font-semibold text-gray-800">
                                                                            Invoice Made by Dr. {doctors.find(doc => doc._id === appointment.doctorId)?.firstName || 'Unknown'} {doctors.find(doc => doc._id === appointment.doctorId)?.lastName || 'Unknown'}
                                                                        </h3>
                                                                        <button onClick={() => handleEditInvoice(appointment.invoiceId, appointment, appointment?.invoicePlan)}>
                                                                            <EditIcon width={20} height={20} fill={"#444050"} />
                                                                        </button>
                                                                    </div>
                                                                    <table class="table-auto w-full border border-gray-300">
                                                                        <thead class="bg-gray-100">
                                                                            <tr>
                                                                                <th class="px-2 py-1 border">#</th>
                                                                                <th class="px-2 py-1 border">Procedure</th>
                                                                                <th class="px-2 py-1 border">QTY</th>
                                                                                <th class="px-2 py-1 border">X</th>
                                                                                <th class="px-2 py-1 border">COST</th>
                                                                                <th class="px-2 py-1 border">DISCOUNT</th>
                                                                                <th class="px-2 py-1 border">GST</th>
                                                                                <th class="px-2 py-1 border">TOTAL</th>
                                                                                {/* <th class="px-2 py-1 border">&nbsp;</th> */}
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {appointment.invoicePlan.map((section, index) => {
                                                                                return (
                                                                                    <tr className="border-b" key={section.id}>
                                                                                        <td className="px-2 py-1">{section.id}</td>
                                                                                        <td className="px-2 py-1">
                                                                                            <span className="font-bold">{section.procedureName}</span>
                                                                                            {/* Add notes, instructions, or other details if required */}
                                                                                        </td>
                                                                                        <td className="px-2 py-1">
                                                                                            {section.qty}
                                                                                        </td>
                                                                                        <td className="px-2 py-1">X</td>
                                                                                        <td className="px-2 py-1">
                                                                                            {section.cost}
                                                                                        </td>
                                                                                        <td className="px-2 py-1">
                                                                                            {section.discount} {section.discountType}


                                                                                        </td>
                                                                                        <td className="px-2 py-1">
                                                                                            {section.gst}%
                                                                                        </td>
                                                                                        <td className="px-2 py-1">
                                                                                            {section.procedureTotal.toFixed(2)}
                                                                                        </td>
                                                                                        {/* <td className="px-2 py-1">
                                                                                         <a
                                                                                             href="#"
                                                                                             className="text-red-500"
                                                                                             onClick={() => {
                                                                                                 const updatedSections = sections.filter((_, i) => i !== index);
                                                                                                 setSections(updatedSections);
                                                                                             }}
                                                                                         >
                                                                                             <i className="glyphicon glyphicon-remove"></i>
                                                                                         </a>
                                                                                     </td> */}
                                                                                    </tr>
                                                                                );
                                                                            })}
                                                                        </tbody>


                                                                        <tfoot>
                                                                            <tr>
                                                                                <td colSpan="2">&nbsp;</td>
                                                                                <td colSpan="2" className="text-right font-bold">Grand Total (INR)</td>
                                                                                <td>
                                                                                    {appointment.invoicePlan.reduce((total, section) => total + (section.qty * section.cost), 0).toFixed(2)}
                                                                                </td>
                                                                                {/* <td colSpan="2" className="text-right font-bold">Total Discount (INR)</td> */}
                                                                                <td>
                                                                                    {appointment.invoicePlan.reduce((total, section) => total + section.discountAmount, 0).toFixed(2)}
                                                                                </td>
                                                                                {/* <td colSpan="2" className="text-right font-bold">Total GST</td> */}
                                                                                <td>
                                                                                    {appointment.invoicePlan.reduce((total, section) => total + section.gstAmount, 0).toFixed(2)}
                                                                                </td>
                                                                                <td className="text-success">
                                                                                    {appointment.invoicePlan.reduce((total, section) => total + section.procedureTotal, 0).toFixed(2)}
                                                                                </td>
                                                                                <td>&nbsp;</td>
                                                                            </tr>
                                                                        </tfoot>
                                                                    </table>

                                                                </div>
                                                            )}

                                                            {/* Report Card */}
                                                            {appointment?.reports?.length > 0 && <>
                                                                {appointment?.reports?.map((report, index) => (
                                                                    <div key={index}>
                                                                        {(report?.description?.replace(/<[^>]*>/g, '').trim().length > 0 ||
                                                                            report?.impression?.replace(/<[^>]*>/g, '').trim().length > 0 ||
                                                                            report?.advice?.replace(/<[^>]*>/g, '').trim().length > 0) && (
                                                                                <>
                                                                                    <div className="flex items center justify-between">
                                                                                        <h3 className="text-lg font-semibold text-gray-800">

                                                                                            Report written by Dr. {doctors.find(doc => doc._id === appointment.doctorId)?.firstName || 'Unknown'} {doctors.find(doc => doc._id === appointment.doctorId)?.lastName || 'Unknown'}
                                                                                        </h3>
                                                                                        <button onClick={() => handleEditPatientReport(report, index, appointment)}>
                                                                                            <EditIcon width={20} height={20} fill={"#444050"} />
                                                                                        </button>
                                                                                    </div>
                                                                                    {/* <h2 className="text-lg font-bold text-gray-800">
                                                                        {appointment.title}
                                                                    </h2> */}
                                                                                    <div className="mt-2 bg-gray-100 p-4 rounded-md text-sm text-gray-700">
                                                                                        {report?.description?.replace(/<[^>]*>/g, '').trim().length > 0 && (<>
                                                                                            <h3 className="text-lg font-semibold text-gray-800">

                                                                                                Report
                                                                                            </h3>
                                                                                            <div dangerouslySetInnerHTML={{ __html: report.description }} /></>)}
                                                                                        {report?.impression?.replace(/<[^>]*>/g, '').trim().length > 0 && (<>
                                                                                            <h3 className="text-lg font-semibold text-gray-800">

                                                                                                Impressions
                                                                                            </h3>
                                                                                            <div dangerouslySetInnerHTML={{ __html: report.impression }} /></>)}
                                                                                        {report?.advice?.replace(/<[^>]*>/g, '').trim().length > 0 && (<>
                                                                                            <h3 className="text-lg font-semibold text-gray-800">

                                                                                                Advice
                                                                                            </h3>
                                                                                            <div dangerouslySetInnerHTML={{ __html: report.advice }} /></>)}
                                                                                    </div>
                                                                                </>
                                                                            )}
                                                                    </div>
                                                                ))}
                                                            </>}

                                                            {/* Appointment Card */}
                                                            {appointment?.procedurePlan?.length > 0 && (
                                                                <div class="w-full bg-gray-200 mt-2">
                                                                    <div className="flex items center justify-between">
                                                                        <h3 className="text-lg font-semibold text-gray-800">
                                                                            Procedure Plan by Dr. {doctors.find(doc => doc._id === appointment.doctorId)?.firstName || 'Unknown'} {doctors.find(doc => doc._id === appointment.doctorId)?.lastName || 'Unknown'}
                                                                        </h3>
                                                                        <button onClick={() => handleEditPatientProcedure(appointment, appointment?.procedurePlan)}>
                                                                            <EditIcon width={20} height={20} fill={"#444050"} />
                                                                        </button>
                                                                    </div>
                                                                    <table class="table-auto w-full border border-gray-300">
                                                                        <thead class="bg-gray-100">
                                                                            <tr>
                                                                                <th class="px-2 py-1 border">#</th>
                                                                                <th class="px-2 py-1 border">Procedure</th>
                                                                                <th class="px-2 py-1 border">QTY</th>
                                                                                <th class="px-2 py-1 border">X</th>
                                                                                <th class="px-2 py-1 border">COST</th>
                                                                                <th class="px-2 py-1 border">DISCOUNT</th>
                                                                                <th class="px-2 py-1 border">GST</th>
                                                                                <th class="px-2 py-1 border">TOTAL</th>
                                                                                {/* <th class="px-2 py-1 border">&nbsp;</th> */}
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {appointment.procedurePlan.map((section, index) => {
                                                                                return (
                                                                                    <tr className="border-b" key={section.id}>
                                                                                        <td className="px-2 py-1">{section.id}</td>
                                                                                        <td className="px-2 py-1">
                                                                                            <span className="font-bold">{section.procedureName}</span>
                                                                                            {/* Add notes, instructions, or other details if required */}
                                                                                        </td>
                                                                                        <td className="px-2 py-1">
                                                                                            {section.qty}
                                                                                        </td>
                                                                                        <td className="px-2 py-1">X</td>
                                                                                        <td className="px-2 py-1">
                                                                                            {section.cost}
                                                                                        </td>
                                                                                        <td className="px-2 py-1">
                                                                                            {section.discount} {section.discountType}


                                                                                        </td>
                                                                                        <td className="px-2 py-1">
                                                                                            {section.gst}%
                                                                                        </td>
                                                                                        <td className="px-2 py-1">
                                                                                            {section.procedureTotal.toFixed(2)}
                                                                                        </td>
                                                                                        {/* <td className="px-2 py-1">
                                                                                         <a
                                                                                             href="#"
                                                                                             className="text-red-500"
                                                                                             onClick={() => {
                                                                                                 const updatedSections = sections.filter((_, i) => i !== index);
                                                                                                 setSections(updatedSections);
                                                                                             }}
                                                                                         >
                                                                                             <i className="glyphicon glyphicon-remove"></i>
                                                                                         </a>
                                                                                     </td> */}
                                                                                    </tr>
                                                                                );
                                                                            })}
                                                                        </tbody>


                                                                        <tfoot>
                                                                            <tr>
                                                                                <td colSpan="2">&nbsp;</td>
                                                                                <td colSpan="2" className="text-right font-bold">Grand Total (INR)</td>
                                                                                <td>
                                                                                    {appointment.procedurePlan.reduce((total, section) => total + (section.qty * section.cost), 0).toFixed(2)}
                                                                                </td>
                                                                                {/* <td colSpan="2" className="text-right font-bold">Total Discount (INR)</td> */}
                                                                                <td>
                                                                                    {appointment.procedurePlan.reduce((total, section) => total + section.discountAmount, 0).toFixed(2)}
                                                                                </td>
                                                                                {/* <td colSpan="2" className="text-right font-bold">Total GST</td> */}
                                                                                <td>
                                                                                    {appointment.procedurePlan.reduce((total, section) => total + section.gstAmount, 0).toFixed(2)}
                                                                                </td>
                                                                                <td className="text-success">
                                                                                    {appointment.procedurePlan.reduce((total, section) => total + section.procedureTotal, 0).toFixed(2)}
                                                                                </td>
                                                                                <td>&nbsp;</td>
                                                                            </tr>
                                                                        </tfoot>
                                                                    </table>

                                                                </div>
                                                            )}
                                                            {appointment.start && (
                                                                <>

                                                                    <h3 className="text-lg font-bold text-gray-800">
                                                                        Appointment with Dr. {doctors.find(doc => doc._id === appointment.doctorId)?.firstName || 'Unknown'} {doctors.find(doc => doc._id === appointment.doctorId)?.lastName || 'Unknown'} at {" "}
                                                                        {new Date(appointment.start).toLocaleTimeString(undefined, {
                                                                            hour: "2-digit",
                                                                            minute: "2-digit",
                                                                        })}
                                                                    </h3>
                                                                    <div className="mt-2 text-sm text-gray-600">
                                                                        <p>
                                                                            <span className="font-semibold">Checked in:</span>{" "}
                                                                            {new Date(appointment.checkedIn).toLocaleTimeString(undefined, {
                                                                                hour: "2-digit",
                                                                                minute: "2-digit",
                                                                            })}
                                                                        </p>
                                                                        <p>
                                                                            <span className="font-semibold">Checked out:</span>{" "}
                                                                            {new Date(appointment.checkedOut).toLocaleTimeString(undefined, {
                                                                                hour: "2-digit",
                                                                                minute: "2-digit",
                                                                            })}
                                                                        </p>
                                                                        <p>
                                                                            <span className="font-semibold">Case Completed At:</span>{" "}
                                                                            {new Date(appointment.checkedOut).toLocaleTimeString(
                                                                                undefined,
                                                                                { hour: "2-digit", minute: "2-digit" }
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                </>
                                                            )}


                                                        </div>
                                                    ))}
                                                </div>
                                            }
                                        </>}

                                        {isActive === 2 && <>
                                            {isReportLoading ? <div className='w-full h-100 flex justify-center items-center bg-cardBg rounded-lg'>
                                                <i className="loader" />
                                            </div>
                                                :
                                                <>
                                                    <div className="flex flex-col gap-1">
                                                        <label htmlFor="name" className="block text-sm font-semibold required">
                                                            Select Report
                                                        </label>
                                                        <div className="flex items-center gap-2">
                                                            <select
                                                                name="reportId"
                                                                value={selectedReport}
                                                                onChange={(e) => { handleReportChange(e) }}
                                                                className="relative w-full cursor-default font-input-style text-sm rounded-lg px-3 py-1.5 bg-mainBg placeholder:text-secondaryText focus:ring-1 focus:outline-accent focus:ring-accent"
                                                                required
                                                            >
                                                                <option disabled value="">Select Report</option>
                                                                {reportsList.map((report) => (
                                                                    <option key={report._id} value={report._id}>
                                                                        {report.reportTitle}
                                                                    </option>
                                                                ))}
                                                            </select>

                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <label htmlFor="name" className="block text-sm font-semibold">
                                                            Reports
                                                        </label>
                                                        <Editor content={description} setContent={setDescription} />
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <label htmlFor="name" className="block text-sm font-semibold">
                                                            Impression
                                                        </label>
                                                        <Editor content={impression} setContent={setImpression} />
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <label htmlFor="name" className="block text-sm font-semibold">
                                                            Advice
                                                        </label>
                                                        <Editor content={advice} setContent={setAdvice} />
                                                    </div>
                                                </>
                                            }
                                        </>}

                                        {isActive === 3 && <>
                                            {isProcedureLoading ? <div className='w-full h-100 flex justify-center items-center bg-cardBg rounded-lg'>
                                                <i className="loader" />
                                            </div>
                                                :
                                                <>

                                                    <div className="flex flex-col gap-1">
                                                        <label htmlFor="mainProcedureId" className="block text-sm font-semibold required">
                                                            Select Procedures
                                                        </label>
                                                        <div className="flex items-center gap-2">
                                                            <Select
                                                                isMulti
                                                                name="procedures"
                                                                placeholder="Select Procedures"
                                                                options={procedures}
                                                                value={selectedProcedure}
                                                                onChange={handleSelectedProcedure}
                                                                className="basic-multi-select text-md w-full"
                                                                classNamePrefix="select"
                                                                menuPortalTarget={document.body} // Render dropdown outside modal
                                                                styles={{
                                                                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                                                    menu: (provided) => ({
                                                                        ...provided,
                                                                        maxHeight: "300px", // Limit dropdown height
                                                                        overflowY: "auto", // Enable scrolling
                                                                    }),
                                                                }}
                                                            />
                                                            <button onClick={() => openProcedureModal()} className="flex items-center justify-center p-2 rounded-lg bg-mainBg hover:bg-lightGray">
                                                                <FaPlus size={18} fill="#333333" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    {isProcedureModalOpen ? <AddProcedure isModalOpen={isProcedureModalOpen} setIsModalOpen={setIsProcedureModalOpen} isAddNew={isAddNewProcedure} setIsAddNew={setIsAddNewProcedure} /> : null}
                                                    <div class="w-full bg-gray-200 mt-2">

                                                        <table class="table-auto w-full border border-gray-300">
                                                            <thead class="bg-gray-100">
                                                                <tr>
                                                                    <th class="px-2 py-1 border">#</th>
                                                                    <th class="px-2 py-1 border">Procedure</th>
                                                                    <th class="px-2 py-1 border">QTY</th>
                                                                    <th class="px-2 py-1 border">X</th>
                                                                    <th class="px-2 py-1 border">COST</th>
                                                                    <th class="px-2 py-1 border">DISCOUNT</th>
                                                                    <th class="px-2 py-1 border">GST</th>
                                                                    <th class="px-2 py-1 border">TOTAL</th>
                                                                    {/* <th class="px-2 py-1 border">&nbsp;</th> */}
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {sections.map((section, index) => {
                                                                    const totalCost = section.qty * section.cost;
                                                                    let procedureTotal = totalCost;
                                                                    let discountAmount = 0;
                                                                    let gstAmount = 0;


                                                                    if (section.discountType === 'INR') {
                                                                        discountAmount = section.discount;
                                                                        procedureTotal = totalCost - section.discount; // Subtract flat INR discount
                                                                    } else if (section.discountType === '%') {
                                                                        discountAmount = totalCost * section.discount / 100; // Apply percentage discount
                                                                        procedureTotal = totalCost - discountAmount;
                                                                    }

                                                                    if (section.gst > 0) {
                                                                        gstAmount = procedureTotal * section.gst / 100;
                                                                        procedureTotal = procedureTotal + gstAmount;
                                                                    }


                                                                    section.procedureTotal = procedureTotal;
                                                                    section.discountAmount = discountAmount;
                                                                    section.gstAmount = gstAmount;

                                                                    return (
                                                                        <>
                                                                            <tr className="border-b" key={section.id}>
                                                                                <td className="px-2 py-1">{section.id}</td>
                                                                                <td className="px-2 py-1">
                                                                                    <span className="font-bold">{section.procedureName}</span>
                                                                                </td>
                                                                                <td className="px-2 py-1">
                                                                                    <input
                                                                                        type="number"
                                                                                        min="1"
                                                                                        className="w-16 border border-gray-300 p-1"
                                                                                        value={section.qty}
                                                                                        onChange={(e) => {
                                                                                            const updatedSections = [...sections];
                                                                                            updatedSections[index].qty = parseInt(e.target.value, 10) || 1;
                                                                                            setSections(updatedSections);
                                                                                        }}
                                                                                    />
                                                                                </td>
                                                                                <td className="px-2 py-1">X</td>
                                                                                <td className="px-2 py-1">
                                                                                    <input
                                                                                        type="number"
                                                                                        min="0"
                                                                                        className="w-25 border border-gray-300 p-1"
                                                                                        value={section.cost}
                                                                                        onChange={(e) => {
                                                                                            const updatedSections = [...sections];
                                                                                            updatedSections[index].cost = parseFloat(e.target.value) || 0;
                                                                                            setSections(updatedSections);
                                                                                        }}
                                                                                    />
                                                                                </td>
                                                                                <td className="px-2 py-1">
                                                                                    <input
                                                                                        type="number"
                                                                                        min="0"
                                                                                        className="w-16 border border-gray-300 p-1"
                                                                                        value={section.discount}
                                                                                        onChange={(e) => {
                                                                                            const updatedSections = [...sections];
                                                                                            updatedSections[index].discount = parseFloat(e.target.value) || 0;
                                                                                            setSections(updatedSections);
                                                                                        }}
                                                                                    />
                                                                                    <select
                                                                                        className="w-16 border border-gray-300 p-1"
                                                                                        value={section.discountType}
                                                                                        onChange={(e) => {
                                                                                            const updatedSections = [...sections];
                                                                                            updatedSections[index].discountType = e.target.value;
                                                                                            setSections(updatedSections);
                                                                                        }}
                                                                                    >
                                                                                        <option value="INR">INR</option>
                                                                                        <option value="%">%</option>
                                                                                    </select>
                                                                                </td>
                                                                                <td className="px-2 py-1">
                                                                                    <input

                                                                                        className="w-16 border border-gray-300 p-1"
                                                                                        value={section.gst}
                                                                                        type="number"
                                                                                        min="0"
                                                                                        max="100"
                                                                                        onChange={(e) => {
                                                                                            const updatedSections = [...sections];
                                                                                            updatedSections[index].gst = parseFloat(e.target.value) || 0;
                                                                                            setSections(updatedSections);
                                                                                        }}
                                                                                    />%
                                                                                </td>
                                                                                <td className="px-2 py-1">
                                                                                    {procedureTotal.toFixed(2)}
                                                                                </td>
                                                                                {/* <td className="px-2 py-1">
                                                                                <a
                                                                                    href="#"
                                                                                    className="text-red-500"
                                                                                    onClick={() => {
                                                                                        const updatedSections = sections.filter((_, i) => i !== index);
                                                                                        setSections(updatedSections);
                                                                                    }}
                                                                                >
                                                                                    <i className="glyphicon glyphicon-remove"></i>
                                                                                </a>
                                                                            </td> */}
                                                                            </tr>
                                                                            <tr >
                                                                                <td colSpan="8">
                                                                                    <div className='flex items-center px-8 gap-2'>
                                                                                        <button
                                                                                            onClick={() => handleOpenModal("notes", section)}
                                                                                            className="text-blue-500 underline"
                                                                                        >
                                                                                            Notes
                                                                                        </button>
                                                                                        <button
                                                                                            onClick={() => handleOpenModal("instructions", section)}
                                                                                            className="text-blue-500 underline ml-2"
                                                                                        >
                                                                                            Instructions
                                                                                        </button>
                                                                                        <button
                                                                                            onClick={() => handleOpenModal("datetime", section)}
                                                                                            className="text-blue-500 underline ml-2"
                                                                                        >
                                                                                            Date & Time
                                                                                        </button>
                                                                                    </div>
                                                                                </td>
                                                                            </tr>
                                                                        </>
                                                                    );
                                                                })}
                                                            </tbody>


                                                            <tfoot>
                                                                <tr>
                                                                    <td colSpan="2">&nbsp;</td>
                                                                    <td colSpan="2" className="text-right font-bold">Grand Total (INR)</td>
                                                                    <td>
                                                                        {sections.reduce((total, section) => total + (section.qty * section.cost), 0).toFixed(2)}
                                                                    </td>
                                                                    {/* <td colSpan="2" className="text-right font-bold">Total Discount (INR)</td> */}
                                                                    <td>
                                                                        {sections.reduce((total, section) => total + section.discountAmount, 0).toFixed(2)}
                                                                    </td>
                                                                    {/* <td colSpan="2" className="text-right font-bold">Total GST</td> */}
                                                                    <td>
                                                                        {sections.reduce((total, section) => total + section.gstAmount, 0).toFixed(2)}
                                                                    </td>
                                                                    <td className="text-success">
                                                                        {sections.reduce((total, section) => total + section.procedureTotal, 0).toFixed(2)}
                                                                    </td>
                                                                    <td>&nbsp;</td>
                                                                </tr>
                                                            </tfoot>
                                                        </table>
                                                        <Modal
                                                            isOpen={isNotesModalOpen}
                                                            onRequestClose={handleCloseModal}
                                                            contentLabel="Notes Modal"
                                                            className="w-full max-w-[500px]  max-h-[96vh] overflow-auto bg-cardBg z-50 m-4 p-6 rounded-2xl flex flex-col gap-4"
                                                            overlayClassName="overlay"
                                                        >
                                                            <div className='w-full flex items-center justify-between'>
                                                                <h2>Notes</h2>
                                                                <div className="grid  grid-cols-2 gap-3">
                                                                    <button onClick={() => handleCloseModal()} className="icon-xl flex items-center justify-center rounded-lg bg-dangerRed hover:bg-dangerRed/75 duration-300">
                                                                        <FaPlus className="rotate-45" size={18} fill={"#ffffff"} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleSave("notes")}
                                                                        className={`icon-xl flex items-center justify-center rounded-lg duration-300 bg-green-600 hover:bg-green-700 `}
                                                                    >
                                                                        <FaCheck size={18} fill={"#ffffff"} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <textarea
                                                                value={notes}
                                                                onChange={(e) => setNotes(e.target.value)}
                                                                className="w-full min-h-[250px]  border p-2"
                                                            ></textarea>

                                                        </Modal>

                                                        {/* Instructions Modal */}
                                                        <Modal
                                                            isOpen={isInstructionsModalOpen}
                                                            onRequestClose={handleCloseModal}
                                                            contentLabel="Instructions Modal"
                                                            className="w-full max-w-[1000px]  max-h-[96vh] overflow-auto bg-cardBg z-50 m-4 p-6 rounded-2xl flex flex-col gap-4"
                                                            overlayClassName="overlay"
                                                        >
                                                            <div className='w-full flex items-center justify-between'>
                                                                <h2>Instructions</h2>
                                                                <div className="grid  grid-cols-2 gap-3">
                                                                    <button onClick={() => handleCloseModal()} className="icon-xl flex items-center justify-center rounded-lg bg-dangerRed hover:bg-dangerRed/75 duration-300">
                                                                        <FaPlus className="rotate-45" size={18} fill={"#ffffff"} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleSave("instructions")}
                                                                        className={`icon-xl flex items-center justify-center rounded-lg duration-300 bg-green-600 hover:bg-green-700 `}
                                                                    >
                                                                        <FaCheck size={18} fill={"#ffffff"} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div className="col-span-12 flex flex-col gap-1">


                                                                <div className="transition-all duration-300 overflow-hidden flex flex-col items-center justify-between gap-x-3 gap-y-4 mt-1">
                                                                    <div className="point-list-style w-full gap-2 grid grid-cols-2 sm:grid-cols-3 ">
                                                                        {instructions.map((modulepoint) => (
                                                                            <div key={modulepoint.id} className="flex flex-col relative gap-3 p-3 border-2 rounded-lg">
                                                                                <button onClick={() => removeModulepoint(modulepoint.id)} className="absolute top-2  right-2">
                                                                                    <FaPlus className="rotate-45" size={18} fill={"#333333"} />
                                                                                </button>
                                                                                <div className="w-full flex mt-4  gap-1.5">

                                                                                    <input
                                                                                        id={`PointTitle-${modulepoint.id}`}
                                                                                        className="font-input-style text-sm min-w-0 rounded-lg px-3 py-2 focus:outline-accent bg-mainBg placeholder:text-secondaryText"
                                                                                        type="number"
                                                                                        placeholder="Enter Time"
                                                                                        value={modulepoint.time}
                                                                                        onChange={(e) => handletimeChange(modulepoint.id, e.target.value)}
                                                                                    />
                                                                                    <select
                                                                                        name={`timeValue-${modulepoint.id}`}
                                                                                        value={modulepoint.timeValue}
                                                                                        onChange={(e) => handletimeValueChange(modulepoint.id, e.target.value)} // Ensure selectedTime is not re-triggering renders unnecessarily
                                                                                        className="relative w-full cursor-default font-input-style text-sm rounded-lg px-3 py-1.5 bg-mainBg placeholder:text-secondaryText focus:ring-1 focus:outline-accent focus:ring-accent"
                                                                                        required
                                                                                    >
                                                                                        {times.map((time, index) => (
                                                                                            <option key={index} value={time}>
                                                                                                {time}
                                                                                            </option>
                                                                                        ))}
                                                                                    </select>
                                                                                </div>
                                                                                <div className="w-full flex flex-col gap-1.5">
                                                                                    <div className="flex space-x-2 rounded-lg bg-mainBg select-none">
                                                                                        <label className="radio flex-1 flex flex-grow items-center justify-center rounded-lg cursor-pointer">
                                                                                            <input
                                                                                                type="radio"
                                                                                                name={`visit-${modulepoint.id}`}
                                                                                                className="peer hidden flex-1"
                                                                                                defaultChecked={modulepoint.visit === "before"}
                                                                                                onChange={() => handlevisitChange(modulepoint.id, "before")}
                                                                                            />
                                                                                            <span className="text-sm flex-1 text-center peer-checked:bg-gradient-to-r peer-checked:bg-accent peer-checked:text-white peer-checked:font-semibold p-2 rounded-lg transition duration-150 ease-in-out">
                                                                                                Before Visit
                                                                                            </span>
                                                                                        </label>
                                                                                        <label className="radio flex-1 flex flex-grow items-center justify-center rounded-lg cursor-pointer">
                                                                                            <input
                                                                                                type="radio"
                                                                                                name={`visit-${modulepoint.id}`}
                                                                                                className="peer hidden flex-1"
                                                                                                defaultChecked={modulepoint.visit === "after"}
                                                                                                onChange={() =>
                                                                                                    handlevisitChange(modulepoint.id, "after")
                                                                                                }
                                                                                            />
                                                                                            <span className="text-sm flex-1 text-center peer-checked:bg-gradient-to-r peer-checked:bg-accent peer-checked:text-white peer-checked:font-semibold p-2 rounded-lg transition duration-150 ease-in-out">
                                                                                                After Visit
                                                                                            </span>
                                                                                        </label>

                                                                                    </div>
                                                                                </div>
                                                                                <div className="w-full flex flex-col gap-1.5">
                                                                                    <label className="gap-2 text-md font-semibold" htmlFor={`Instruction-${modulepoint.id}`}>
                                                                                        instruction
                                                                                    </label>
                                                                                    <textarea
                                                                                        id={`Instruction-${modulepoint.id}`}
                                                                                        className="font-input-style text-sm min-w-0 rounded-lg px-3 py-2 focus:outline-accent bg-mainBg placeholder:text-secondaryText"
                                                                                        type="text"
                                                                                        placeholder="Enter Instruction"
                                                                                        value={modulepoint.instruction}
                                                                                        onChange={(e) => handleinstructionChange(modulepoint.id, e.target.value)}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                        <div onClick={addNewModulepoint} className="flex relative gap-2 items-center justify-center p-3 border-2 border-dashed rounded-lg cursor-pointer">
                                                                            <FaPlus size={18} fill={"#333333"} />
                                                                            <span className="text-accent font-semibold">Add New Instruction</span>
                                                                        </div>
                                                                    </div>

                                                                </div>
                                                            </div>

                                                        </Modal>

                                                        {/* Date & Time Modal */}
                                                        <Modal
                                                            isOpen={isDateTimeModalOpen}
                                                            onRequestClose={handleCloseModal}
                                                            contentLabel="Date & Time Modal"
                                                            className="w-full max-w-[500px]  min-h-[400px] overflow-auto bg-cardBg z-50 m-4 p-6 rounded-2xl flex flex-col gap-4"
                                                            overlayClassName="overlay"
                                                        >
                                                            <div className='w-full flex items-center justify-between'>
                                                                <h2>Date & Time</h2>
                                                                <div className="grid  grid-cols-2 gap-3">
                                                                    <button onClick={() => handleCloseModal()} className="icon-xl flex items-center justify-center rounded-lg bg-dangerRed hover:bg-dangerRed/75 duration-300">
                                                                        <FaPlus className="rotate-45" size={18} fill={"#ffffff"} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleSave("datetime")}
                                                                        className={`icon-xl flex items-center justify-center rounded-lg duration-300 bg-green-600 hover:bg-green-700 `}
                                                                    >
                                                                        <FaCheck size={18} fill={"#ffffff"} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <DatePicker
                                                                selected={dateTime}
                                                                onChange={(date) => setDateTime(date)}
                                                                showTimeSelect
                                                                //dateFormat="Pp" // Display date with AM/PM format
                                                                dateFormat="dd/MM/yyyy, h:mm aa"
                                                                className="w-full border p-2"
                                                                timeIntervals={15} // Time selection intervals in minutes
                                                                popperPlacement="bottom" // Ensure the dropdown opens below the input
                                                                open={isPickerOpen} // Control picker visibility
                                                                onClickOutside={() => setPickerOpen(true)} // Keep the picker open when clicking outside
                                                                onFocus={() => setPickerOpen(true)} // Reopen when focused
                                                                onBlur={() => setPickerOpen(true)} // Prevent closing on blur
                                                            />

                                                            {/* <button onClick={() => handleSave("datetime")} className="mt-2 bg-blue-500 text-white px-4 py-2">
                                                                Save
                                                            </button> */}
                                                        </Modal>

                                                    </div>

                                                </>
                                            }
                                        </>}

                                        {isActive === 4 && <>
                                            <CreateInvoice currentAppointment={currentAppointment} sections={invoicePlan} setSections={setInvoicePlan} />
                                        </>}

                                        {isActive === 5 &&
                                            <>  
                                            <div className='flex items-center'> 
                                             <div className="flex flex-col gap-2">
                                                        <label className="block text-sm font-semibold required" htmlFor="nextBatchStartDate">
                                                            Select Date
                                                        </label>
                                                        <div
                                                            className="border rounded-md p-2 cursor-pointer bg-white text-gray-700"
                                                            onClick={toggleCalendar}
                                                        >
                                                            {selectedDate ? selectedDate.toDateString() : 'Select a date'}
                                                        </div>
                                                        {isCalendarOpen && (
                                                            <Calendar
                                                                onChange={handleDateChange}
                                                                // tileDisabled={({ date }) => {
                                                                //     const today = new Date();
                                                                //     today.setHours(0, 0, 0, 0); // Set today's time to midnight
                                                                //     return date < today;
                                                                // }}
                                                                value={selectedDate}
                                                                className="react-calendar mt-2"
                                                            />
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <label htmlFor="patientId" className="block text-sm font-semibold required">
                                                            Select Time
                                                        </label>
                                                        <select
                                                            name="patientId"
                                                            value={selectedTime}
                                                            onChange={(e) => setSelectedTime(e.target.value)}
                                                            className="relative w-full cursor-default font-input-style text-sm rounded-lg px-3 py-1.5 bg-mainBg placeholder:text-secondaryText focus:ring-1 focus:outline-accent focus:ring-accent"
                                                        >
                                                            <option value="">Select Time</option>
                                                            {timesList.map(({ iso, label }, index) => (
                                                                <option key={index} value={iso}>
                                                                    {label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div> 
                                                    </div>        
                                            
                                        </>
                                        }


                                    </div>
                                </div>

                            </>}
                    </Modal>

                    {isEditPatientNameModalOpen ? <EditPatient isModalOpen={isEditPatientNameModalOpen} setIsModalOpen={setIsEditPatientNameModalOpen} doctors={doctors} patientDetail={patientDetail} setPatientDetail={setPatientDetail} isEditPatient={isEditPatient} setIsEditPatient={setIsEditPatient} currentAppointment={currentAppointment} setCurrentAppointment={setCurrentAppointment} /> : null}

                </> : <AccessDenied />}

            <ToastContainer />
        </>
    );
};

export default UpdatePatient;