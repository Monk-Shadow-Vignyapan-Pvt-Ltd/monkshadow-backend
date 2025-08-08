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
import AddState from './AddState.jsx';
import AddCity from './AddCity.jsx';

Modal.setAppElement("#root"); // Required for accessibility

const EditPatient = ({ isModalOpen, setIsModalOpen, patientDetail,setPatientDetail, doctors, isEditPatient, setIsEditPatient,currentAppointment,setCurrentAppointment }) => {
    //  const [isModalOpen, setIsModalOpen] = useState(false);
    // const [isEditing, setIsEditing] = useState(true);
    const [selectedState, setSelectedState] = useState(null);
    const [selectedCity, setSelectedCity] = useState(null);
    const [currentPatientId, setCurrentPatientId] = useState(null);
    const [formData, setFormData] = useState({
        patientName: '',
        gender: 'Male',
        phoneNo: '',
        age: '',
        address: '',
        reference: '',
        state: '',
        city: '',
        patientType: 'OPD',
        caseId: '',
        centerId: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [doctorsList, setDoctorsList] = useState([]);
    const [isDoctorLoading, setIsDoctorLoading] = useState(true);
    const [selectedReference, setSelectedReference] = useState(null);
    const { centerId } = useRoles();
    const [selectedCaseId, setSelectedCaseId] = useState("");
    const { userRole } = useRoles();
    const [isStateLoading, setIsStateLoading] = useState(true);
    const [statesList, setStatesList] = useState([]);
    const [citiesList, setCitiesList] = useState([]);
    const [isCityLoading, setIsCityLoading] = useState(true);
    const [centersList, setCentersList] = useState({});
    const [isCenterLoading, setIsCenterLoading] = useState(true);
    const [patientsLength, setPatientsLength] = useState(0);
    const [outsidePatientsList, setOutsidePatientsList] = useState([]);
    const [outsideCaseId, setOutsideCaseId] = useState("");
    const [editingCaseId,setEditingCaseId] = useState("");
    const [editingPatientType,setEditingPatientType] = useState("");


    useEffect(() => {
        //openModal();
        getPatientbyId();
        //getDoctors();
        getStates();
        getCities();
        getCenterByID();
        getPatients();
    }, []);

    const getPatients = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/patients/getPatients`);
            setOutsidePatientsList(response.data.patients.filter(patient => patient.patientType === "Outside"))
            setIsLoading(false);
        } catch (error) {
            toast.error('Error fetching patients:', error);
            console.error('Error fetching patients:', error)
        }
    };


    const getPatientbyId = async () => {
        try {
            // const response = await axios.put(`${API_BASE_URL}/patients/getPatientById/${patientId}`);
            // setPatientDetail(patientDetail);
            setFormData(patientDetail);
            setDoctorsList(doctors.filter(doctor => doctor.isPartner));
            setCurrentPatientId(patientDetail._id);
            setSelectedState(patientDetail.state);
            setSelectedCity(patientDetail.city);
            setSelectedReference(patientDetail.reference);
            setSelectedCaseId(patientDetail.caseId);
            setEditingCaseId(patientDetail.caseId);
            setEditingPatientType(patientDetail.patientType);
            setIsLoading(false);
        } catch (error) {
            toast.error('Error fetching patient:', error);
            console.error('Error fetching patient:', error)
        }
    };

    const getCities = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/cities/getCities`);
            setCitiesList(response.data.cities);
            setIsCityLoading(false);
        } catch (error) {
            toast.error('Error fetching cities:', error);
            console.error('Error fetching cities:', error)
        }
    };

    const getStates = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/states/getStates`);
            setStatesList(response.data.states);
            setIsStateLoading(false);
        } catch (error) {
            toast.error('Error fetching states:', error);
            console.error('Error fetching states:', error)
        }
    };

    const cities = selectedState ? citiesList.filter(city => city.stateId === statesList.find(state => state.stateName === selectedState)._id) : [];

    const getCenterByID = async () => {
        if (centerId) {
            try {
                const response = await axios.put(`${API_BASE_URL}/centers/getCenterById/${centerId}`);
                setCentersList(response.data.center);

                const response1 = await axios.get(`${API_BASE_URL}/patients/getPatientsByCenterId/${centerId}`);
                setPatientsLength(response1.data.patients.map((p) => parseInt(p.caseId.slice(-7), 10))
                .reduce((max, curr) => Math.max(max, curr), 0));

                setIsCenterLoading(false);
            } catch (error) {
                toast.error('Error fetching center');
                console.error('Error fetching center:', error);
            }
        } else {
            toast.warn('Please assign this user to a specific center first.', { autoClose: 20000 });
        }

    };

    function generateCaseId(center, sequenceNumber) {
        // Extract necessary fields
        const { stateCode, cityCode, centerCode } = center;

        // Get the current date
        const currentDate = new Date();

        // Format date as DDMMYYYY
        const formattedDate = currentDate
            .toLocaleDateString('en-GB') // Formats date as DD/MM/YYYY
            .replace(/\//g, '');         // Removes the slashes

        // Format sequence number as 7-digit padded string
        const paddedSequence = sequenceNumber.toString().padStart(7, '0');

        // Concatenate parts to form the caseId
        return `${stateCode}-${cityCode}-${centerCode}-${formattedDate}-${paddedSequence}`;
    }

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
        if(name === "patientType"){
            if(value === editingPatientType){
                setSelectedCaseId(editingCaseId);
            }else{
                if(value === "OPD"){
                    setSelectedCaseId(generateCaseId(centersList, patientsLength + 1))
                }else if(selectedState && selectedCity){
                  generateOutsideCaseId(selectedCity);
              }
                
            }
        }
    };

    const generateOutsideCaseId = (e) => {

        const stateCode = statesList.find(state => state.stateName === selectedState).stateCode;
        const cityCode = citiesList.find(city => city.cityName === e).cityCode;
        const sequenceNumber = outsidePatientsList.map((p) => parseInt(p.caseId.slice(-7), 10))
        .reduce((max, curr) => Math.max(max, curr), 0) + 1;
        const currentDate = new Date();

        // Format date as DDMMYYYY
        const formattedDate = currentDate
            .toLocaleDateString('en-GB') // Formats date as DD/MM/YYYY
            .replace(/\//g, '');         // Removes the slashes

        // Format sequence number as 7-digit padded string
        const paddedSequence = sequenceNumber.toString().padStart(7, '0');
        setOutsideCaseId(`${stateCode}-${cityCode}-O-${formattedDate}-${paddedSequence}`);
        setSelectedCaseId(`${stateCode}-${cityCode}-O-${formattedDate}-${paddedSequence}`)


    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        let updatedFormData = { ...formData }; // Create a local copy of formData

        if (formData.patientType === "OPD") {

            const selectedState = statesList.find(state => state.stateCode === centersList.stateCode);
            const selectedCity = citiesList.find(city => city.cityCode === centersList.cityCode);

            updatedFormData = {
                ...updatedFormData,
                caseId: generateCaseId(centersList, patientsLength + 1),
                state: selectedState ? selectedState.stateName : '',
                city: selectedCity ? selectedCity.cityName : '',
                centerId: centerId
            };

        } else {
            updatedFormData = {
                ...updatedFormData,
                caseId: outsideCaseId,
                centerId: ''
            };
        }
        try {

            const response1 = await axios.post(`${API_BASE_URL}/patients/updatePatient/${currentPatientId}`, updatedFormData);
            setPatientDetail(response1.data.patient);
            const data= { ...currentAppointment, appointmentType: formData.patientType }
            const response =  await axios.post(`${API_BASE_URL}/appointments/updateAppointment/${currentAppointment._id}`, data);
            setCurrentAppointment(response.data.appointment);
            toast.success('Patient updated successfully!');
            setFormData({
                patientName: '',
                gender: 'Male',
                phoneNo: '',
                age: '',
                address: '',
                reference: '',
                state: '',
                city: '',
                patientType: 'OPD',
                caseId: '',
                centerId: ''
            });
            setIsEditPatient(true);
            closeModal();
        } catch (error) {
            console.error('Error saving patient:', error);
            toast.error('Error saving patient:', error)
        } finally {
            // setIsActive(1);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData({
            patientName: '',
            gender: 'Male',
            phoneNo: '',
            age: '',
            address: '',
            reference: '',
            state: '',
            city: '',
            patientType: 'OPD',
            caseId: '',
            centerId: ''
        });
        setSelectedReference("");
    };

    const [isStateModalOpen, setIsStateModalOpen] = useState(false);
        const [isAddNewState, setIsAddNewState] = useState(false);
    
        useEffect(() => {
            if (isAddNewState) {
                setIsStateLoading(true);
                getStates();
            }
    
        }, [isAddNewState])
        const openStateModal = (e) => {
            e.preventDefault();
            setIsStateModalOpen(true);
        };
    
    
        const [isCityModalOpen, setIsCityModalOpen] = useState(false);
        const [isAddNewCity, setIsAddNewCity] = useState(false);
        const [statesFromCitiesList, setStatesFromCitiesList] = useState([]);
        useEffect(() => {
            if (isAddNewCity) {
                setIsCityLoading(true);
                setStatesList(statesFromCitiesList);
                getCities();
            }
    
        }, [isAddNewCity])
        const openCityModal = (e) => {
            e.preventDefault();
            setIsCityModalOpen(true);
        };


    return (
        <>
            {userRole === "Super Admin" || userRole === "Admin" || userRole === "Doctor" ?
                isLoading || isCityLoading || isStateLoading || isCenterLoading ?
                    <div className='w-full h-100 flex justify-center items-center bg-cardBg card-shadow rounded-lg'>
                        <i className="loader" />
                    </div>
                    :
                    <>
                        <Modal
                            isOpen={isModalOpen}
                            onRequestClose={closeModal}
                            contentLabel="Add Patient Modal"
                            className="w-full max-w-[500px] max-h-[96vh] overflow-auto bg-cardBg z-50 m-4 p-6 rounded-2xl flex flex-col gap-4"
                            overlayClassName="overlay"
                        >
                            <form onSubmit={handleSubmit}>
                                <h2 className="text-xl font-bold text-accent">Edit Patient</h2>
                                <div className="flex flex-col gap-2">
                                    <div className="flex flex-col">
                                        <label className="mb-1 text-sm font-semibold required" htmlFor="type">Patient Type</label>
                                        <div className="flex space-x-2 rounded-lg bg-mainBg select-none">
                                            <label className="radio flex-1 flex flex-grow items-center justify-center rounded-lg cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="patientType"
                                                    defaultValue="OPD"
                                                    className="peer hidden flex-1"
                                                    checked={formData.patientType === 'OPD'}
                                                    onChange={handleInputChange}
                                                />
                                                <span className="text-sm flex-1 text-center peer-checked:bg-gradient-to-r peer-checked:bg-accent peer-checked:text-white peer-checked:font-semibold p-2 rounded-lg transition duration-150 ease-in-out">
                                                    OPD
                                                </span>
                                            </label>
                                            <label className="radio flex-1 flex flex-grow items-center justify-center rounded-lg cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="patientType"
                                                    defaultValue="Outside"
                                                    className="peer hidden flex-1"
                                                    checked={formData.patientType === 'Outside'}
                                                    onChange={handleInputChange}
                                                />
                                                <span className="text-sm flex-1 text-center peer-checked:bg-gradient-to-r peer-checked:bg-accent peer-checked:text-white peer-checked:font-semibold p-2 rounded-lg transition duration-150 ease-in-out">
                                                    Outside
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                    <label htmlFor="name" className="block text-sm font-semibold required">
                                        Patient Name
                                    </label>
                                    <input
                                        type="text"
                                        name="patientName"
                                        value={formData.patientName}
                                        onChange={handleInputChange}
                                        placeholder="Patient Name"
                                        className="bg-mainBg placeholder:text-secondaryText focus:outline-accent text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
                                        required
                                    />
                                    <div className="flex flex-col">
                                        <label className="mb-1 text-sm font-semibold required" htmlFor="gender">Gender</label>
                                        <div className="flex space-x-2 rounded-lg bg-mainBg select-none">
                                            <label className="radio flex-1 flex flex-grow items-center justify-center rounded-lg cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="gender"
                                                    defaultValue="Male"
                                                    className="peer hidden flex-1"
                                                    checked={formData.gender === 'Male'}
                                                    onChange={handleInputChange}
                                                />
                                                <span className="text-sm flex-1 text-center peer-checked:bg-gradient-to-r peer-checked:bg-accent peer-checked:text-white peer-checked:font-semibold p-2 rounded-lg transition duration-150 ease-in-out">
                                                    Male
                                                </span>
                                            </label>
                                            <label className="radio flex-1 flex flex-grow items-center justify-center rounded-lg cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="gender"
                                                    defaultValue="Female"
                                                    className="peer hidden flex-1"
                                                    checked={formData.gender === 'Female'}
                                                    onChange={handleInputChange}
                                                />
                                                <span className="text-sm flex-1 text-center peer-checked:bg-gradient-to-r peer-checked:bg-accent peer-checked:text-white peer-checked:font-semibold p-2 rounded-lg transition duration-150 ease-in-out">
                                                    Female
                                                </span>
                                            </label>
                                            <label className="radio flex-1 flex flex-grow items-center justify-center rounded-lg cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="gender"
                                                    defaultValue="Others"
                                                    className="peer hidden flex-1"
                                                    checked={formData.gender === 'Others'}
                                                    onChange={handleInputChange}
                                                />
                                                <span className="text-sm flex-1 text-center peer-checked:bg-gradient-to-r peer-checked:bg-accent peer-checked:text-white peer-checked:font-semibold p-2 rounded-lg transition duration-150 ease-in-out">
                                                    Others
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                    <label htmlFor="name" className="block text-sm font-semibold required">
                                        Phone No.
                                    </label>
                                    <input
                                        type="number"
                                        name="phoneNo"
                                        value={formData.phoneNo}
                                        onChange={handleInputChange}
                                        placeholder="Phone Number"
                                        className="bg-mainBg placeholder:text-secondaryText focus:outline-accent text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
                                        required
                                    />
                                    <label htmlFor="name" className="block text-sm font-semibold required">
                                        Age.
                                    </label>
                                    <input
                                        type="number"
                                        name="age"
                                        value={formData.age}
                                        onChange={handleInputChange}
                                        placeholder="Age"
                                        className="bg-mainBg placeholder:text-secondaryText focus:outline-accent text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
                                        required
                                    />
                                    <label htmlFor="name" className="block text-sm font-semibold required">
                                        Address
                                    </label>
                                    <textarea
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        placeholder="Address"
                                        className="bg-mainBg placeholder:text-secondaryText focus:outline-accent text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
                                        required
                                    />
                                    <label htmlFor="name" className="block text-sm font-semibold">
                                        Select Reference
                                    </label>
                                    <select
                                        name="reference"
                                        value={selectedReference}
                                        onChange={(e) => {
                                            handleInputChange(e);
                                            setSelectedReference(e.target.value);
                                        }}
                                        className="relative w-full cursor-default font-input-style text-sm rounded-lg px-3 py-1.5 bg-mainBg placeholder:text-secondaryText focus:ring-1 focus:outline-accent focus:ring-accent"
                                    >
                                        <option value="">Select Reference</option>
                                        {doctorsList.map((doctor) => (
                                            <option key={doctor._id} value={doctor.firstName + ' ' + doctor.lastName}>
                                                {doctor.firstName + ' ' + doctor.lastName}
                                            </option>
                                        ))}
                                    </select>

                                    {formData.patientType === "OPD" ? null :
                                        <>
                                            <label htmlFor="name" className="block text-sm font-semibold required">
                                                Select State
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <select
                                                    name="state"
                                                    value={selectedState}
                                                    onChange={(e) => {
                                                        handleInputChange(e);
                                                        setSelectedState(e.target.value);
                                                    }}
                                                    className="relative w-full cursor-default font-input-style text-sm rounded-lg px-3 py-1.5 bg-mainBg placeholder:text-secondaryText focus:ring-1 focus:outline-accent focus:ring-accent"
                                                    required
                                                >
                                                    <option value="">Select State</option>
                                                    {statesList.map((state) => (
                                                        <option key={state._id} value={state.stateName}>
                                                            {state.stateName}
                                                        </option>
                                                    ))}
                                                </select>
                                                <button onClick={(e) => openStateModal(e)} className="flex items-center justify-center p-2 rounded-lg bg-mainBg hover:bg-lightGray">
                                                    <FaPlus size={18} fill="#333333" />
                                                </button>
                                            </div>
                                            <label htmlFor="name" className="block text-sm font-semibold required">
                                                Select City
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <select
                                                    name="city"
                                                    value={selectedCity}
                                                    onChange={(e) => {
                                                        handleInputChange(e);
                                                        setSelectedCity(e.target.value);
                                                        generateOutsideCaseId(e.target.value)
                                                    }}
                                                    className="relative w-full cursor-default font-input-style text-sm rounded-lg px-3 py-1.5 bg-mainBg placeholder:text-secondaryText focus:ring-1 focus:outline-accent focus:ring-accent"
                                                    required
                                                >
                                                    <option value="">Select City</option>
                                                    {cities.map((city) => (
                                                        <option key={city._id} value={city.cityName}>
                                                            {city.cityName}
                                                        </option>
                                                    ))}
                                                </select>
                                                <button onClick={(e) => openCityModal(e)} className="flex items-center justify-center p-2 rounded-lg bg-mainBg hover:bg-lightGray">
                                                    <FaPlus size={18} fill="#333333" />
                                                </button>
                                            </div>
                                        </>}

                                    <label htmlFor="name" className="block text-sm font-semibold required">
                                        Case ID:
                                    </label>
                                    <input
                                        type="text"
                                        name="caseId"
                                        value={selectedCaseId}
                                        placeholder="Case ID"
                                        className="bg-mainBg placeholder:text-secondaryText focus:outline-accent text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
                                        required
                                        disabled
                                    />



                                    <div className="grid grid-cols-2 gap-3 m-x-4 w-full">
                                        <button
                                            type='submit'
                                            className={`px-6 py-2 rounded-lg text-cardBg text-md font-medium  bg-blue-600 hover:bg-blue-700`}
                                        >
                                            Update Patient
                                        </button>
                                        <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-lg font-medium text-md text-cardBg bg-dangerRed duration-300">
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </Modal>
                        {isStateModalOpen ? <AddState isModalOpen={isStateModalOpen} setIsModalOpen={setIsStateModalOpen} isAddNew={isAddNewState} setIsAddNew={setIsAddNewState} /> : null}
                    {isCityModalOpen ? <AddCity isModalOpen={isCityModalOpen} setIsModalOpen={setIsCityModalOpen} isAddNew={isAddNewCity} setIsAddNew={setIsAddNewCity} statesList={statesFromCitiesList} setStatesList={setStatesFromCitiesList} /> : null}

                    </> : <AccessDenied />}

            <ToastContainer />
        </>
    );
};

export default EditPatient;