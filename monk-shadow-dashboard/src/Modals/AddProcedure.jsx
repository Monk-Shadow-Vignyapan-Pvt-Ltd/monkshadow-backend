import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import Modal from 'react-modal';
import 'react-toastify/dist/ReactToastify.css';
import { API_BASE_URL } from '../config/constant.js';
import { useRoles } from '../RolesContext';
import AccessDenied from '../components/AccessDenied.jsx';
import { FaPlus } from 'react-icons/fa';
import { FaCheck } from 'react-icons/fa6';

const AddProcedure = ({ isModalOpen, setIsModalOpen, isAddNew, setIsAddNew }) => {
    const [procedureName, setProcedureName] = useState('');
    const [cost, setCost] = useState(null);
    const [gst, setGst] = useState(null);
    const [notes, setNotes] = useState('');
    const [uploading, setUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { userRole } = useRoles();
    const [isLoading, setIsLoading] = useState(false);
    const [modulepoints, setModulepoints] = useState([{ id: 1, time: "", timeValue: "Hour(s)", visit: 'after', instruction: '' }]);
    const [times, setTimes] = useState(['Hour(s)', 'Day(s)', 'Week(s)', 'Year(s)'])

    useEffect(() => { openModal() }, [])

    const openModal = (procedure = null) => {
        setProcedureName(procedure ? procedure.procedureName : '');
        setCost(procedure ? procedure.cost : null);
        setGst(procedure ? procedure.gst : null);
        setNotes(procedure ? procedure.notes : '')
        setModulepoints(procedure ? procedure.instructions : [{ id: 1, time: "", timeValue: "Hour(s)", visit: 'after', instruction: '' }])
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleUploadClick = async () => {
        setIsLoading(true);
        const filteredModulepoints = modulepoints.filter(item => item.time && item.visit && item.instruction);
        if (!procedureName) {
            setIsLoading(false);
            return toast.warn('Please fill out Procedure Name');
        }
        setUploading(true);
        const data = {
            procedureName,
            cost: cost ? cost : 0,
            gst: gst ? gst : 0,
            notes,
            instructions: filteredModulepoints,
        };
        try {
            const endpoint = `${API_BASE_URL}/procedures/addProcedure`;
            await axios.post(endpoint, data, {
                headers: { 'Content-Type': 'application/json' }
            });
            toast.success('Procedure added successfully!');
            setIsAddNew(true);
            closeModal();

        } catch (error) {
            console.error('Error uploading Procedure:', error);
            toast.error('Failed to upload Procedure.');
        } finally {
            setUploading(false);
            //  toast.success(editingCategory ? 'Category updated successfully!' : 'Category added successfully!');
            // setIsLoading(false);

        }

    };

    const addNewModulepoint = () => {
        const maxId = Math.max(...modulepoints.map(item => item.id));
        setModulepoints([...modulepoints, { id: maxId + 1, time: "", timeValue: "Hour(s)", visit: 'after', instruction: '' }]);
    };

    const removeModulepoint = (id) => {
        setModulepoints((prevModulepoints) => prevModulepoints.filter((modulepoint) => modulepoint.id !== id));
    };

    const handletimeChange = (id, value) => {
        setModulepoints((prevModulepoints) =>
            prevModulepoints.map((modulepoint) =>
                modulepoint.id === id ? { ...modulepoint, time: value } : modulepoint
            )
        );
    };

    const handletimeValueChange = (id, value) => {
        setModulepoints((prevModulepoints) =>
            prevModulepoints.map((modulepoint) =>
                modulepoint.id === id ? { ...modulepoint, timeValue: value } : modulepoint
            )
        );
    };

    const handlevisitChange = (id, value) => {
        setModulepoints((prevModulepoints) =>
            prevModulepoints.map((modulepoint) =>
                modulepoint.id === id ? { ...modulepoint, visit: value } : modulepoint
            )
        );
    };

    const handleinstructionChange = (id, value) => {
        setModulepoints((prevModulepoints) =>
            prevModulepoints.map((modulepoint) =>
                modulepoint.id === id ? { ...modulepoint, instruction: value } : modulepoint
            )
        );
    };


    return (
        <>
            {userRole === "Super Admin" || userRole === "Admin" ?
                isLoading ?
                    <div className='w-full h-100 flex justify-center items-center bg-cardBg card-shadow rounded-lg'>
                        <i className="loader" />
                    </div>
                    :
                    <Modal
                        isOpen={isModalOpen}
                        onRequestClose={closeModal}
                        contentLabel="Add Procedure Modal"
                        className="w-full max-w-[700px] max-h-[96vh] overflow-auto bg-cardBg z-50 m-4 p-6 rounded-2xl flex flex-col gap-4"
                        overlayClassName="overlay"
                    >
                        <div className="w-full flex items-center justify-between gap-3">
                            <h2 className="text-xl font-bold text-accent">
                                Add Procedure
                            </h2>
                            <div className="grid grid-cols-2 gap-3 m-x-4">
                                <button onClick={closeModal} className="icon-xl flex items-center justify-center rounded-lg bg-dangerRed hover:bg-dangerRed/75 duration-300">
                                    <FaPlus className="rotate-45" size={18} fill={"#ffffff"} />
                                </button>
                                <button
                                    onClick={handleUploadClick}
                                    disabled={uploading}
                                    className={`icon-xl flex items-center justify-center rounded-lg ${uploading
                                        ? 'bg-placeHolder text-secondaryText cursor-not-allowed'
                                        : 'bg-accent hover:bg-accent/75 duration-300'
                                        }`}
                                >

                                    <FaCheck size={18} fill={"#ffffff"} />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-4 flex-1 overflow-y-auto">
                            {/* Category Name Input */}
                            <div className="col-span-12 md:col-span-4 flex flex-col gap-1">
                                <label htmlFor="procedureName" className="block text-sm font-semibold required">
                                    Procedure Name
                                </label>
                                <input
                                    id="procedureName"
                                    type="text"
                                    value={procedureName}
                                    onChange={(e) => setProcedureName(e.target.value)}
                                    placeholder="Procedure Name"
                                    className="bg-mainBg placeholder:text-secondaryText focus:outline-accent text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
                                />
                            </div>

                            <div className="col-span-12 sm:col-span-6 md:sm:col-span-4 flex flex-col gap-1">
                                <label htmlFor="cost" className="block text-sm font-semibold required">
                                    Procedure Cost
                                </label>
                                <input
                                    id="cost"
                                    type="number"
                                    value={cost}
                                    placeholder="Product Price"
                                    onChange={(e) => setCost(e.target.value)}
                                    className="bg-mainBg placeholder:text-secondaryText focus:outline-accent text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
                                />
                            </div>

                            <div className="col-span-12 sm:col-span-6 md:sm:col-span-4 flex flex-col gap-1">
                                <label htmlFor="gst" className="text-sm font-semibold flex-1 flex items-end">
                                    GST(%)
                                </label>
                                <input
                                    id="gst"
                                    type="number"
                                    value={gst}
                                    placeholder="Enter GST Percentage"
                                    onChange={(e) => setGst(e.target.value)}
                                    className="bg-mainBg placeholder:text-secondaryText focus:outline-accent text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
                                />
                            </div>

                            <div className="col-span-12 md:flex-1 flex flex-col gap-1">
                                <label htmlFor="notes" className="block text-sm font-semibold">
                                    Notes
                                </label>
                                <textarea
                                    id="notes"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Notes"
                                    style={{ minHeight: "100px" }}
                                    className="md:h-full bg-mainBg placeholder:text-secondaryText focus:outline-accent text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
                                />
                            </div>

                            <div className="col-span-12 flex flex-col gap-1">
                                <div className="relative w-full flex items-center justify-between rounded-lg gap-2">
                                    <span className="text-lg font-bold text-accent">Instructions</span>
                                </div>

                                <div className="transition-all duration-300 overflow-hidden flex flex-col items-center justify-between gap-x-3 gap-y-4 mt-1">
                                    <div className="point-list-style w-full gap-2 grid grid-cols-1 sm:grid-cols-2">
                                        {modulepoints.map((modulepoint) => (
                                            <div key={modulepoint.id} className="flex flex-col relative gap-3 p-3 border-2 rounded-lg">
                                                <div className="flex justify-between items-center">
                                                    <h2 className="text-md font-bold text-accent">
                                                        What to do
                                                    </h2>
                                                    <button onClick={() => removeModulepoint(modulepoint.id)}>
                                                        <FaPlus className="rotate-45" size={18} fill={"#f05f23"} />
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <input
                                                        id={`PointTitle-${modulepoint.id}`}
                                                        className="col-span-1 font-input-style text-sm min-w-0 rounded-lg px-3 py-2 focus:outline-accent bg-mainBg placeholder:text-secondaryText"
                                                        type="number"
                                                        placeholder="Enter Time"
                                                        min={0}
                                                        value={modulepoint.time}
                                                        onChange={(e) => handletimeChange(modulepoint.id, e.target.value)}
                                                    />
                                                    <select
                                                        name={`timeValue-${modulepoint.id}`}
                                                        value={modulepoint.timeValue}
                                                        onChange={(e) => handletimeValueChange(modulepoint.id, e.target.value)} // Ensure selectedTime is not re-triggering renders unnecessarily
                                                        className="col-span-1 relative w-full cursor-default font-input-style text-sm rounded-lg px-3 py-1.5 bg-mainBg placeholder:text-secondaryText focus:ring-1 focus:outline-accent focus:ring-accent"
                                                        required
                                                    >
                                                        {times.map((time, index) => (
                                                            <option key={index} value={time}>
                                                                {time}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <div className="col-span-2 w-full flex flex-col gap-1.5">
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
                                                    <div className="col-span-2 w-full flex flex-col gap-1.5">
                                                        <label className="gap-2 text-sm font-semibold" htmlFor={`Instruction-${modulepoint.id}`}>
                                                            Instruction
                                                        </label>
                                                        <textarea
                                                            id={`Instruction-${modulepoint.id}`}
                                                            className="font-input-style h-20 text-sm min-w-0 rounded-lg px-3 py-2 focus:outline-accent bg-mainBg placeholder:text-secondaryText"
                                                            type="text"
                                                            placeholder="Enter Instruction"
                                                            value={modulepoint.instruction}
                                                            onChange={(e) => handleinstructionChange(modulepoint.id, e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <div onClick={addNewModulepoint} className="flex relative gap-2 items-center justify-center p-3 border-2 border-dashed rounded-lg cursor-pointer">
                                            <FaPlus size={18} fill={"#f05f23"} />
                                            <span className="text-md text-accent font-semibold">Add New Instruction</span>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </Modal>
                : <AccessDenied />}
            <ToastContainer />
        </>
    );
};

Modal.setAppElement('#root');
export default AddProcedure;
