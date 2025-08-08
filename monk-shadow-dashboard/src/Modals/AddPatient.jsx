import React, { useState, useEffect } from 'react';

import 'flatpickr/dist/flatpickr.min.css';
import 'flatpickr/dist/plugins/confirmDate/confirmDate.css';

import axios from 'axios';
import Modal from "react-modal";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { API_BASE_URL } from '../config/constant.js';
import { useRoles } from '../RolesContext';
import AccessDenied from '../components/AccessDenied.jsx';
import { FaCheck, FaPlus } from 'react-icons/fa6';
import AddState from './AddState.jsx';
import AddCity from './AddCity.jsx';

Modal.setAppElement("#root"); // Required for accessibility

const AddPatient = ({ isModalOpen, setIsModalOpen,appointmentType, isAddNew, setIsAddNew }) => {
    const [selectedState, setSelectedState] = useState(null);
    const [selectedCity, setSelectedCity] = useState(null);
    //const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        patientName: '',
        gender: 'Male',
        phoneNo: '',
        age: '',
        address: '',
        reference: '',
        state: '',
        city: '',
        patientType: appointmentType,
        caseId: '',
        centerId: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isStateLoading, setIsStateLoading] = useState(true);
    const [statesList, setStatesList] = useState([]);
    const [citiesList, setCitiesList] = useState([]);
    const [isCityLoading, setIsCityLoading] = useState(true);
    const [doctorsList, setDoctorsList] = useState([]);
    const [isDoctorLoading, setIsDoctorLoading] = useState(true);
    const [selectedReference, setSelectedReference] = useState(null);
    const { centerId } = useRoles();
    const [centersList, setCentersList] = useState({});
    const [isCenterLoading, setIsCenterLoading] = useState(true);
    const [patientsLength, setPatientsLength] = useState(0);
    const [selectedCaseId, setSelectedCaseId] = useState("");
    const [outsidePatientsList, setOutsidePatientsList] = useState([]);
    const [outsideCaseId, setOutsideCaseId] = useState("");
    const { userRole } = useRoles();

    useEffect(() => {
        openModal();
        getCities();
        getStates();
        getDoctors();
        getPatients();
        getCenterByID();
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

    const getDoctors = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/doctors/getDoctors`);
            setDoctorsList(response.data.doctors.filter(doctor => doctor.isPartner));
            setIsDoctorLoading(false);
        } catch (error) {
            toast.error('Error fetching doctors:', error);
            console.error('Error fetching doctors:', error)
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

            await axios.post(`${API_BASE_URL}/patients/addPatient`, updatedFormData);
            toast.success('Patient added successfully!');

            closeModal();
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
            setIsAddNew(true);
        } catch (error) {
            console.error('Error saving patient:', error);
            toast.error('Error saving patient:', error)
        } finally {
            setIsLoading(false);
        }
    };

    const openModal = () => {

        setFormData({
            patientName: '',
            gender: 'Male',
            phoneNo: '',
            age: '',
            address: '',
            reference: '',
            state: '',
            city: '',
            patientType: appointmentType,
            caseId: '',
            centerId: ''
        });
        setSelectedState("");
        setSelectedCity("");
        setSelectedReference("");
        setOutsideCaseId("");
        setIsModalOpen(true);
        setIsAddNew(false)
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
        setSelectedState("");
        setSelectedCity("");
        setOutsideCaseId("");
        setSelectedReference("");
    };
    const cities = selectedState ? citiesList.filter(city => city.stateId === statesList.find(state => state.stateName === selectedState)._id) : [];


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

                <>
                    <Modal
                        isOpen={isModalOpen}
                        onRequestClose={closeModal}
                        contentLabel="Add Patient Modal"
                        className="w-full max-w-[700px] max-h-[96vh] overflow-auto bg-cardBg z-50 m-4 p-6 rounded-2xl flex flex-col gap-4"
                        overlayClassName="overlay"
                    >
                        {isLoading || isCityLoading || isStateLoading || isCenterLoading || isDoctorLoading ?
                            <div className='w-full h-100 flex justify-center items-center bg-cardBg rounded-lg'>
                                <i className="loader" />
                            </div>
                            :
                            <form className="flex flex-col gap-4 max-h-[96vh] flex-1" onSubmit={handleSubmit}>
                                <div className="w-full flex items-center justify-between gap-3">
                                    <h2 className="text-xl font-bold text-accent">Add Patient</h2>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button onClick={closeModal} className="icon-xl flex items-center justify-center rounded-lg bg-dangerRed hover:bg-dangerRed/75 duration-300">
                                            <FaPlus className="rotate-45" size={18} fill={"#ffffff"} />
                                        </button>
                                        <button
                                            type='submit'
                                            className={`icon-xl flex items-center justify-center rounded-lg duration-300 bg-green-600 hover:bg-green-700`}
                                        >
                                            <FaCheck size={18} fill={"#ffffff"} />
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-12 gap-4 flex-1 overflow-y-auto">
                                    <div className="col-span-12 sm:col-span-6 md:col-span-4 flex flex-col gap-1">
                                        <label className="text-sm font-semibold " htmlFor="type">Patient Type: {formData.patientType}</label>
                                        {/* <div className="flex space-x-2 rounded-lg bg-mainBg select-none">
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
                                        </div> */}
                                    </div>
                                    <div className="col-span-12 sm:col-span-6 md:col-span-4 flex flex-col gap-1">
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
                                    </div>
                                    <div className="col-span-12 sm:col-span-6 md:col-span-4 flex flex-col gap-1">
                                        <label className="text-sm font-semibold required" htmlFor="gender">Gender</label>
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
                                    <div className="col-span-12 sm:col-span-6 flex flex-col gap-1">
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
                                    </div>
                                    <div className="col-span-12 sm:col-span-6 flex flex-col gap-1">
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
                                    </div>
                                    <div className="col-span-12 flex flex-col gap-1">
                                        <label htmlFor="name" className="block text-sm font-semibold required">
                                            Address
                                        </label>
                                        <textarea
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            placeholder="Address"
                                            className="bg-mainBg placeholder:text-secondaryText focus:outline-accent text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
                                            required
                                        />
                                    </div>
                                    <div className={`col-span-12 sm:col-span-6 flex flex-col gap-1`}>
                                        <label htmlFor="name" className="text-sm font-semibold flex-1 flex items-center">
                                            Select Reference
                                        </label>
                                        <select
                                            name="reference"
                                            value={selectedReference}
                                            onChange={(e) => {
                                                handleInputChange(e);
                                                setSelectedReference(e.target.value);
                                            }}
                                            className="relative w-full cursor-default font-input-style text-sm rounded-lg px-3 py-2 bg-mainBg placeholder:text-secondaryText focus:ring-1 focus:outline-accent focus:ring-accent"
                                        >
                                            <option value="">Select Reference</option>
                                            {doctorsList.map((doctor) => (
                                                <option key={doctor._id} value={doctor.firstName + ' ' + doctor.lastName}>
                                                    {doctor.firstName + ' ' + doctor.lastName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {formData.patientType === "OPD" ? null :
                                        <>
                                            <div className="col-span-12 sm:col-span-6 flex flex-col gap-1">
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
                                                        className="relative w-full cursor-default font-input-style text-sm rounded-lg px-3 py-2 bg-mainBg placeholder:text-secondaryText focus:ring-1 focus:outline-accent focus:ring-accent"
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
                                            </div>
                                            <div className="col-span-12 sm:col-span-6 flex flex-col gap-1">
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
                                                        className="relative w-full cursor-default font-input-style text-sm rounded-lg px-3 py-2 bg-mainBg placeholder:text-secondaryText focus:ring-1 focus:outline-accent focus:ring-accent"
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
                                            </div>
                                        </>}

                                    {formData.patientType === "OPD" ?
                                        <div className="col-span-12 sm:col-span-6 flex flex-col gap-1">
                                            <label htmlFor="name" className="block text-sm font-semibold required">
                                                Case ID:
                                            </label>
                                            <input
                                                type="text"
                                                name="caseId"
                                                value={generateCaseId(centersList, patientsLength + 1)}
                                                placeholder="Case ID"
                                                className="bg-mainBg placeholder:text-secondaryText focus:outline-accent text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
                                                required
                                                disabled
                                            />
                                        </div>
                                        :
                                        <div className="col-span-12 sm:col-span-6 flex flex-col gap-1">
                                            <label htmlFor="name" className="block text-sm font-semibold required">
                                                Case ID:
                                            </label>
                                            <input
                                                type="text"
                                                name="caseId"
                                                value={outsideCaseId}
                                                placeholder="Case ID"
                                                className="bg-mainBg placeholder:text-secondaryText focus:outline-accent text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
                                                required
                                                disabled
                                            />
                                        </div>
                                    }

                                </div>
                            </form>}
                    </Modal>


                    {isStateModalOpen ? <AddState isModalOpen={isStateModalOpen} setIsModalOpen={setIsStateModalOpen} isAddNew={isAddNewState} setIsAddNew={setIsAddNewState} /> : null}
                    {isCityModalOpen ? <AddCity isModalOpen={isCityModalOpen} setIsModalOpen={setIsCityModalOpen} isAddNew={isAddNewCity} setIsAddNew={setIsAddNewCity} statesList={statesFromCitiesList} setStatesList={setStatesFromCitiesList} /> : null}

                </> : <AccessDenied />}

            <ToastContainer />
        </>
    );
};

export default AddPatient;