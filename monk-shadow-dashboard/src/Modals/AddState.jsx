import React, { useState, useEffect } from 'react';

import 'flatpickr/dist/flatpickr.min.css';
import 'flatpickr/dist/plugins/confirmDate/confirmDate.css';

import axios from 'axios';
import Modal from "react-modal";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { API_BASE_URL } from '../config/constant.js';
import AccessDenied from '../components/AccessDenied.jsx';
import { useRoles } from '../RolesContext';
import { FaCheck, FaPlus } from 'react-icons/fa6';


Modal.setAppElement("#root"); // Required for accessibility

const AddState = ({ isModalOpen, setIsModalOpen, isAddNew, setIsAddNew }) => {
    // const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        stateName: '',
        stateCode: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const { userRole } = useRoles();

    useEffect(() => {
        openModal();
    }, []);


    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const { stateName, stateCode } = formData;

        if (!stateName || stateName.trim() === "") {
            setIsLoading(false)
            return toast.warn("State name is required.");
        }

        if (!stateCode || stateCode.trim() === "") {
            setIsLoading(false)
            return toast.warn("State code is required.");
        } else if (stateCode.length !== 2) {
            setIsLoading(false)
            return toast.warn("State code must be exactly 2 characters long.");
        } else if (!/^[A-Za-z]+$/.test(stateCode)) {
            setIsLoading(false)
            return toast.warn("State code can only contain alphabets.");
        }

        try {

            await axios.post(`${API_BASE_URL}/states/addState`, formData);
            toast.success('State added successfully!');

            closeModal();
            setIsAddNew(true);
        } catch (error) {
            console.error('Error saving state:', error);
            toast.error('Error saving state : State Name or Code Already Exist')
        } finally {
            setIsLoading(false);
        }
    };

    const openModal = () => {

        setFormData({
            stateName: '',
            stateCode: ''
        });
        setIsModalOpen(true);
        setIsAddNew(false);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData({
            stateName: '',
            stateCode: ''
        });
    };


    return (
        <>
            {userRole === "Super Admin" || userRole === "Admin" ?
                isLoading ?
                    <div className='w-full h-100 flex justify-center items-center rounded-lg'>
                        <i className="loader" />
                    </div>
                    :
                    <>
                        <Modal
                            isOpen={isModalOpen}
                            onRequestClose={closeModal}
                            contentLabel="Add State Modal"
                            className="w-full max-w-[500px] max-h-[96vh] overflow-auto bg-cardBg z-50 m-4 p-6 rounded-2xl flex flex-col gap-4"
                            overlayClassName="overlay"
                        >
                            <form className="flex flex-col gap-4 max-h-[96vh] flex-1" onSubmit={handleSubmit}>
                                <div className="w-full flex items-center justify-between gap-3">
                                    <h2 className="text-xl font-bold text-accent">Add State</h2>
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
                                        <label htmlFor="name" className="block text-sm font-semibold required">
                                            State Name
                                        </label>
                                        <input
                                            type="text"
                                            name="stateName"
                                            value={formData.stateName}
                                            onChange={handleInputChange}
                                            placeholder="State Name"
                                            className="bg-mainBg placeholder:text-secondaryText focus:outline-accent text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
                                            required
                                        />
                                    </div>
                                    <div className="col-span-12 flex flex-col gap-1">
                                        <label htmlFor="name" className="block text-sm font-semibold required">
                                            State Code
                                        </label>
                                        <input
                                            type="text"
                                            name="stateCode"
                                            value={formData.stateCode}
                                            onChange={handleInputChange}
                                            placeholder="State Code"
                                            className="bg-mainBg placeholder:text-secondaryText focus:outline-accent text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
                                            required
                                        />
                                    </div>
                                </div>
                            </form>
                        </Modal>
                    </> : <AccessDenied />}

            <ToastContainer />
        </>
    );
};

export default AddState;