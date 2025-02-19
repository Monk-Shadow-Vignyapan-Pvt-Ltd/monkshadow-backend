import React, { useState, useEffect } from 'react';
// import { DataSvg } from '../components/Icons/DataSvg';
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


Modal.setAppElement("#root"); // Required for accessibility

const AddCity = ({ isModalOpen, setIsModalOpen, isAddNew, setIsAddNew, statesList, setStatesList }) => {
    //const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedState, setSelectedState] = useState(null);
    const [formData, setFormData] = useState({
        cityName: '',
        stateId: '',
        cityCode: ""
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isStateLoading, setIsStateLoading] = useState(true);
    //const [statesList, setStatesList] = useState([]);
    const { userRole } = useRoles();

    useEffect(() => {
        getStates();
        openModal();
    }, []);

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
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const { cityName, stateId, cityCode } = formData;

        if (!cityName || cityName.trim() === "") {
            setIsLoading(false)
            return toast.warn("City name is required.");
        }

        if (!stateId || stateId.trim() === "") {
            setIsLoading(false)
            return toast.warn("State name is required.");
        }

        if (!cityCode || cityCode.trim() === "") {
            setIsLoading(false)
            return toast.warn("City code is required.");
        } else if (cityCode.length < 2 || cityCode.length > 3) {
            setIsLoading(false)
            return toast.warn("The city code must be at least 2 characters and no more than 3 characters in length.");
        } else if (!/^[A-Za-z]+$/.test(cityCode)) {
            setIsLoading(false)
            return toast.warn("City code can only contain alphabets.");
        }
        try {

            await axios.post(`${API_BASE_URL}/cities/addCity`, formData);
            toast.success('City added successfully!');

            closeModal();
            setIsAddNew(true);
        } catch (error) {
            console.error('Error saving city:', error);
            toast.error('Error saving city: : City Name or Code Already Exist')
        } finally {
            setIsLoading(false);
        }
    };

    const openModal = () => {

        setFormData({
            cityName: '',
            stateId: '',
            cityCode: ""
        });
        setSelectedState("");
        setIsModalOpen(true);
        setIsAddNew(false);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData({
            cityName: '',
            stateId: '',
            cityCode: ""
        });
        setSelectedState("");
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


    return (
        <>
            {
                userRole === "Super Admin" || userRole === "Admin" ?

                    <>
                        <Modal
                            isOpen={isModalOpen}
                            onRequestClose={closeModal}
                            contentLabel="Add City Modal"
                            className="w-full max-w-[500px] max-h-[96vh] overflow-auto bg-cardBg z-50 m-4 p-6 rounded-2xl flex flex-col gap-4"
                            overlayClassName="overlay"
                        >
                            {isLoading || isStateLoading ?
                                <div className='w-full h-100 flex justify-center items-center bg-cardBg rounded-lg'>
                                    <i className="loader" />
                                </div>
                                :
                                <form className="flex flex-col gap-4 max-h-[96vh] flex-1" onSubmit={handleSubmit}>
                                    <div className="w-full flex items-center justify-between gap-3">
                                        <h2 className="text-xl font-bold text-accent">Add City</h2>
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
                                        <div className="col-span-12 flex flex-col gap-1">
                                            <label htmlFor="cityName" className="block text-sm font-semibold required">
                                                City Name
                                            </label>
                                            <input
                                                type="text"
                                                id='cityName'
                                                name="cityName"
                                                value={formData.cityName}
                                                onChange={handleInputChange}
                                                placeholder="City Name"
                                                className="bg-mainBg placeholder:text-secondaryText focus:outline-accent text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
                                                required
                                            />
                                        </div>

                                        <div className="col-span-12 flex flex-col gap-1">
                                            <label htmlFor="name" className="block text-sm font-semibold required">
                                                Select State
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <select
                                                    name="stateId"
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
                                                        <option key={state._id} value={state._id}>
                                                            {state.stateName}
                                                        </option>
                                                    ))}
                                                </select>
                                                <button onClick={(e) => openStateModal(e)} className="flex items-center justify-center p-2 rounded-lg bg-mainBg hover:bg-lightGray">
                                                    <FaPlus size={18} fill="#F05F23" />
                                                </button>
                                            </div>
                                        </div>


                                        <div className="col-span-12 flex flex-col gap-1">
                                            <label htmlFor="cityCode" className="block text-sm font-semibold required">
                                                City Code
                                            </label>
                                            <input
                                                type="text"
                                                id='cityCode'
                                                name="cityCode"
                                                value={formData.cityCode}
                                                onChange={handleInputChange}
                                                placeholder="City Code"
                                                className="bg-mainBg placeholder:text-secondaryText focus:outline-accent text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
                                                required
                                            />
                                        </div>

                                    </div>
                                </form>}
                        </Modal>
                        {isStateModalOpen ? <AddState isModalOpen={isStateModalOpen} setIsModalOpen={setIsStateModalOpen} isAddNew={isAddNewState} setIsAddNew={setIsAddNewState} /> : null}

                    </> : <AccessDenied />}
            <ToastContainer />
        </>
    );
};

export default AddCity;