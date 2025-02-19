import React, { useState, useEffect } from 'react';
// import { DataSvg } from '../components/Icons/DataSvg';
import 'flatpickr/dist/flatpickr.min.css';
import 'flatpickr/dist/plugins/confirmDate/confirmDate.css';
import axios from 'axios';
import Modal from "react-modal";
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { API_BASE_URL } from '../config/constant.js';
import { useRoles } from '../RolesContext';
import AccessDenied from '../components/AccessDenied.jsx';
import { FaCheck, FaPlus } from 'react-icons/fa6';
import AddState from './AddState.jsx';
import AddCity from './AddCity.jsx';

Modal.setAppElement("#root"); // Required for accessibility

const AddCenter = ({ isModalOpen, setIsModalOpen, isAddNew, setIsAddNew, statesList, setStatesList, citiesList, setCitiesList }) => {
    const [selectedState, setSelectedState] = useState(null);
    const [selectedCity, setSelectedCity] = useState(null);
    //const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        centerName: '',
        adminPhoneNo: '',
        accountPhoneNo: '',
        centerEmail: '',
        centerAddress: '',
        stateCode: '',
        cityCode: '',
        centerCode: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isStateLoading, setIsStateLoading] = useState(true);
    //const [statesList, setStatesList] = useState([]);
    //const [citiesList, setCitiesList] = useState([]);
    const [isCityLoading, setIsCityLoading] = useState(true);
    const { userRole } = useRoles();

    useEffect(() => {
        openModal();
        getCities();
        getStates();
    }, []);

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

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const { centerCode } = formData;
        if (!centerCode || centerCode.trim() === "") {
            setIsLoading(false)
            return toast.warn("Center code is required.");
        } else if (centerCode.length < 2 || centerCode.length > 3) {
            setIsLoading(false)
            return toast.warn("The center code must be at least 2 characters and no more than 3 characters in length.");
        } else if (!/^[A-Za-z]+$/.test(centerCode)) {
            setIsLoading(false)
            return toast.warn("Center code can only contain alphabets.");
        }
        try {

            await axios.post(`${API_BASE_URL}/centers/addCenter`, formData);
            toast.success('Center added successfully!');

            closeModal();
            setIsAddNew(true);
        } catch (error) {
            console.error('Error saving center:', error);
            toast.error('Error saving center:Center Name or Code Already Exist', error)
        } finally {
            setIsLoading(false);
        }
    };

    const openModal = () => {

        setFormData({
            centerName: '',
            adminPhoneNo: '',
            accountPhoneNo: '',
            centerEmail: '',
            centerAddress: '',
            stateCode: '',
            cityCode: '',
            centerCode: ''
        });
        setSelectedState("");
        setSelectedCity("");
        setIsModalOpen(true);
        setIsAddNew(false);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData({
            centerName: '',
            adminPhoneNo: '',
            accountPhoneNo: '',
            centerEmail: '',
            centerAddress: '',
            stateCode: '',
            cityCode: '',
            centerCode: ''
        });
        setSelectedState("");
        setSelectedCity("");
    };

    const cities = selectedState ? citiesList.filter(city => city.stateId === statesList.find(state => state.stateCode === selectedState)._id) : [];


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
            {
                userRole === "Super Admin" || userRole === "Admin" ?

                    <>
                        <Modal
                            isOpen={isModalOpen}
                            onRequestClose={closeModal}
                            contentLabel="Add Center Modal"
                            className="w-full max-w-[700px] max-h-[96vh] overflow-auto bg-cardBg z-50 m-4 p-6 rounded-2xl flex flex-col gap-4"
                            overlayClassName="overlay"
                        >
                            {isLoading || isStateLoading || isCityLoading ?
                                <div className='w-full h-100 flex justify-center items-center bg-cardBg rounded-lg'>
                                    <i className="loader" />
                                </div>
                                :
                                <form className="flex flex-col gap-4 max-h-[96vh] flex-1" onSubmit={handleSubmit}>
                                    <div className="w-full flex items-center justify-between gap-3">
                                        <h2 className="text-xl font-bold text-accent">Add center</h2>
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
                                        <div className="col-span-12 sm:col-span-6 flex flex-col gap-1">
                                            <label htmlFor="centerName" className="block text-sm font-semibold required">
                                                Center Name
                                            </label>
                                            <input
                                                type="text"
                                                id='centerName'
                                                name="centerName"
                                                value={formData.centerName}
                                                onChange={handleInputChange}
                                                placeholder="Center Name"
                                                className="bg-mainBg placeholder:text-secondaryText focus:outline-accent text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
                                                required
                                            />
                                        </div>
                                        <div className="col-span-12 sm:col-span-6 flex flex-col gap-1">
                                            <label htmlFor="centerEmail" className="block text-sm font-semibold required">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                id='centerEmail'
                                                name="centerEmail"
                                                value={formData.centerEmail}
                                                onChange={handleInputChange}
                                                placeholder="Center Email"
                                                className="bg-mainBg placeholder:text-secondaryText focus:outline-accent text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
                                                required
                                            />
                                        </div>
                                        <div className="col-span-12 sm:col-span-6 flex flex-col gap-1">
                                            <label htmlFor="adminPhoneNo" className="block text-sm font-semibold required">
                                                Admin Phone No.
                                            </label>
                                            <input
                                                type="number"
                                                id='adminPhoneNo'
                                                name="adminPhoneNo"
                                                value={formData.adminPhoneNo}
                                                onChange={handleInputChange}
                                                placeholder="Admin Phone Number"
                                                className="bg-mainBg placeholder:text-secondaryText focus:outline-accent text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
                                                required
                                            />
                                        </div>
                                        <div className="col-span-12 sm:col-span-6 flex flex-col gap-1">
                                            <label htmlFor="accountPhoneNo" className="block text-sm font-semibold required">
                                                Account Phone No.
                                            </label>
                                            <input
                                                type="number"
                                                id='accountPhoneNo'
                                                name="accountPhoneNo"
                                                value={formData.accountPhoneNo}
                                                onChange={handleInputChange}
                                                placeholder="Account Phone No."
                                                className="bg-mainBg placeholder:text-secondaryText focus:outline-accent text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
                                                required
                                            />
                                        </div>
                                        <div className="col-span-12 flex flex-col gap-1">
                                            <label htmlFor="centerAddress" className="block text-sm font-semibold required">
                                                Address
                                            </label>
                                            <textarea
                                                id='centerAddress'
                                                name="centerAddress"
                                                value={formData.centerAddress}
                                                onChange={handleInputChange}
                                                placeholder="Center Address"
                                                className="bg-mainBg placeholder:text-secondaryText focus:outline-accent text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
                                                required
                                            />
                                        </div>
                                        <div className="col-span-12 sm:col-span-6 md:col-span-4 flex flex-col gap-1">
                                            <label htmlFor="name" className="block text-sm font-semibold required">
                                                Select State
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <select
                                                    name="stateCode"
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
                                                        <option key={state._id} value={state.stateCode}>
                                                            {state.stateName}
                                                        </option>
                                                    ))}
                                                </select>
                                                <button onClick={(e) => openStateModal(e)} className="flex items-center justify-center p-2 rounded-lg bg-mainBg hover:bg-lightGray">
                                                    <FaPlus size={18} fill="#F05F23" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="col-span-12 sm:col-span-6 md:col-span-4 flex flex-col gap-1">
                                            <label htmlFor="name" className="block text-sm font-semibold required">
                                                Select City
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <select
                                                    name="cityCode"
                                                    value={selectedCity}
                                                    onChange={(e) => {
                                                        handleInputChange(e);
                                                        setSelectedCity(e.target.value);
                                                    }}
                                                    className="relative w-full cursor-default font-input-style text-sm rounded-lg px-3 py-2 bg-mainBg placeholder:text-secondaryText focus:ring-1 focus:outline-accent focus:ring-accent"
                                                    required
                                                >
                                                    <option value="">Select City</option>
                                                    {cities.map((city) => (
                                                        <option key={city._id} value={city.cityCode}>
                                                            {city.cityName}
                                                        </option>
                                                    ))}
                                                </select>
                                                <button onClick={(e) => openCityModal(e)} className="flex items-center justify-center p-2 rounded-lg bg-mainBg hover:bg-lightGray">
                                                    <FaPlus size={18} fill="#F05F23" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="col-span-12 md:col-span-4 flex flex-col gap-1">
                                            <label htmlFor="centerCode" className="block text-sm font-semibold required">
                                                Center Code
                                            </label>
                                            <input
                                                type="text"
                                                id='centerCode'
                                                name="centerCode"
                                                value={formData.centerCode}
                                                onChange={handleInputChange}
                                                placeholder="Center Code"
                                                className="bg-mainBg placeholder:text-secondaryText focus:outline-accent text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
                                                required
                                            />
                                        </div>
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

export default AddCenter;