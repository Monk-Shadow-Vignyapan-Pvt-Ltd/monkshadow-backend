import React, { useState, useEffect } from "react";
import "flatpickr/dist/flatpickr.min.css";
import "flatpickr/dist/plugins/confirmDate/confirmDate.css";
import axios from "axios";
import Modal from "react-modal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_BASE_URL } from "../config/constant.js";
import Select from "react-select";
import AccessDenied from "../components/AccessDenied.jsx";
import { useRoles } from "../RolesContext.jsx";
import { FaCheck, FaPlus } from 'react-icons/fa6';
import AddCity from "./AddCity.jsx";
import AddState from "./AddState.jsx";
import AddCenter from "./AddCenter.jsx";

const specialities = [
	{ value: "Allergy and Immunology", label: "Allergy and Immunology" },
	{ value: "Anesthesiology", label: "Anesthesiology" },
	{ value: "Cardiology", label: "Cardiology" },
	{ value: "Dermatology", label: "Dermatology" },
	{ value: "Emergency Medicine", label: "Emergency Medicine" },
	{ value: "Endocrinology", label: "Endocrinology" },
	{ value: "Family Medicine", label: "Family Medicine" },
	{ value: "Gastroenterology", label: "Gastroenterology" },
	{ value: "Geriatrics", label: "Geriatrics" },
	{ value: "Hematology", label: "Hematology" },
	{ value: "Infectious Disease", label: "Infectious Disease" },
	{ value: "Internal Medicine", label: "Internal Medicine" },
	{ value: "Nephrology", label: "Nephrology" },
	{ value: "Neurology", label: "Neurology" },
	{ value: "Obstetrics and Gynecology", label: "Obstetrics and Gynecology" },
	{ value: "Oncology", label: "Oncology" },
	{ value: "Ophthalmology", label: "Ophthalmology" },
	{ value: "Orthopedics", label: "Orthopedics" },
	{ value: "Otolaryngology (ENT)", label: "Otolaryngology (ENT)" },
	{ value: "Pediatrics", label: "Pediatrics" },
	{
		value: "Physical Medicine and Rehabilitation",
		label: "Physical Medicine and Rehabilitation",
	},
	{ value: "Psychiatry", label: "Psychiatry" },
	{ value: "Pulmonology", label: "Pulmonology" },
	{ value: "Radiology", label: "Radiology" },
	{ value: "Rheumatology", label: "Rheumatology" },
	{ value: "Surgery", label: "Surgery" },
	{ value: "Urology", label: "Urology" },
];

Modal.setAppElement("#root"); // Required for accessibility

const AddDoctor = ({ isModalOpen, setIsModalOpen, isAddNew, setIsAddNew }) => {
	const [selectedState, setSelectedState] = useState(null);
	const [selectedCity, setSelectedCity] = useState(null);
	const [selectedSpeciality, setSelectedSpeciality] = useState([]);
	//const [isModalOpen, setIsModalOpen] = useState(false);
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		gender: "Male",
		phoneNo: "",
		email: "",
		company: "",
		state: "",
		city: "",
		speciality: [],
		isPartner: false,
		centerId: "",
	});
	const [isLoading, setIsLoading] = useState(false);
	const [isStateLoading, setIsStateLoading] = useState(true);
	const [statesList, setStatesList] = useState([]);
	const [citiesList, setCitiesList] = useState([]);
	const [isCityLoading, setIsCityLoading] = useState(true);
	const [centersList, setCentersList] = useState([]);
	const [selectedCenter, setSelectedCenter] = useState("");
	const [isCenterLoading, setIsCenterLoading] = useState(true);
	const { userRole } = useRoles();

	useEffect(() => {
		getCities();
		getStates();
		getCenters();
		openModal();
	}, []);

	const getCities = async () => {
		try {
			const response = await axios.get(`${API_BASE_URL}/cities/getCities`);
			setCitiesList(response.data.cities);
			setIsCityLoading(false);

		} catch (error) {
			toast.error("Error fetching cities:", error);
			console.error("Error fetching cities:", error);
		}
	};

	const getStates = async () => {
		try {
			const response = await axios.get(`${API_BASE_URL}/states/getStates`);
			setStatesList(response.data.states);
			setIsStateLoading(false);
		} catch (error) {
			toast.error("Error fetching states:", error);
			console.error("Error fetching states:", error);
		}
	};

	const getCenters = async () => {
		try {
			const response = await axios.get(`${API_BASE_URL}/centers/getCenters`);
			setCentersList(response.data.centers);
			setIsCenterLoading(false);
		} catch (error) {
			toast.error("Error fetching centers:", error);
			console.error("Error fetching centers:", error);
		}
	};

	const handleInputChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData({
			...formData,
			[name]: type === "checkbox" ? checked : value,
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		let updatedFormData = { ...formData }; // Create a local copy of formData

		if (!formData.isPartner) {
			if (formData.centerId === "") {
				setIsLoading(false);
				return toast.warn("Please Select Center");
			} else {
				const selectedCenter = centersList.find(
					(center) => center._id === formData.centerId
				);
				if (selectedCenter) {
					const selectedState = statesList.find(
						(state) => state.stateCode === selectedCenter.stateCode
					);
					const selectedCity = citiesList.find(
						(city) => city.cityCode === selectedCenter.cityCode
					);

					updatedFormData = {
						...updatedFormData,
						state: selectedState ? selectedState.stateName : "",
						city: selectedCity ? selectedCity.cityName : "",
					};
				}
			}
		}
		try {

			await axios.post(`${API_BASE_URL}/doctors/addDoctor`, updatedFormData);
			toast.success("Doctor added successfully!");

			closeModal();
			setSelectedSpeciality([]);
			setFormData({
				firstName: "",
				lastName: "",
				gender: "Male",
				phoneNo: "",
				email: "",
				company: "",
				state: "",
				city: "",
				speciality: [],
				isPartner: false,
				centerId: "",
			});
			setIsAddNew(true)
		} catch (error) {
			console.error("Error saving doctor:", error);
			toast.error("Error saving doctor:", error);
		} finally {
			setIsLoading(false);
		}
	};


	const openModal = () => {
		setFormData({
			firstName: "",
			lastName: "",
			gender: "Male",
			phoneNo: "",
			email: "",
			company: "",
			state: "",
			city: "",
			speciality: [],
			isPartner: false,
			centerId: "",
		});
		setSelectedState("");
		setSelectedCity("");
		setSelectedCenter("");
		setSelectedSpeciality([]);
		setIsModalOpen(true);
		setIsAddNew(false);
	};

	const closeModal = () => {
		setIsModalOpen(false);
		setFormData({
			firstName: "",
			lastName: "",
			gender: "Male",
			phoneNo: "",
			email: "",
			company: "",
			state: "",
			city: "",
			speciality: [],
			isPartner: false,
			centerId: "",
		});
		setSelectedState("");
		setSelectedCity("");
		setSelectedCenter("");
		setSelectedSpeciality([]);
	};
	const cities = selectedState
		? citiesList.filter(
			(city) =>
				city.stateId ===
				statesList.find((state) => state.stateName === selectedState)._id
		)
		: [];

	const [isCenterModalOpen, setIsCenterModalOpen] = useState(false);
	const [isAddNewCenter, setIsAddNewCenter] = useState(false);
	const [statesFromCentersList, setStatesFromCentersList] = useState([]);
	const [citiesFromCentersList, setCitiesFromCentersList] = useState([]);
	useEffect(() => {
		if (isAddNewCenter) {
			setIsCenterLoading(true);
			setStatesList(statesFromCentersList);
			setCitiesList(citiesFromCentersList);
			getCenters();
		}

	}, [isAddNewCenter])
	const openCenterModal = (e) => {
		e.preventDefault();
		setIsCenterModalOpen(true);
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
			{userRole === "Super Admin" || userRole === "Admin" ? (

				<div className="p-6 bg-cardBg card-shadow modalbox rounded-lg">
					<Modal
						isOpen={isModalOpen}
						onRequestClose={closeModal}
						contentLabel="Add Doctor Modal"
						className="w-full max-w-[700px] max-h-[96vh] overflow-auto bg-cardBg z-50 m-4 p-6 rounded-2xl flex flex-col gap-4"
						overlayClassName="overlay"
					>
						{isLoading || isCityLoading || isStateLoading || isCenterLoading ? (

							<div className="w-full h-100 flex justify-center items-center bg-cardBg rounded-lg">
								<i className="loader" />
							</div>

						) : (
							<form className="flex flex-col gap-4 max-h-[96vh] flex-1" onSubmit={handleSubmit}>
								<div className="w-full flex items-center justify-between gap-3">
									<h2 className="text-xl font-bold text-accent">
										Add Doctor
									</h2>
									<div className="grid grid-cols-2 gap-3">
										<button
											onClick={closeModal}
											className="icon-xl flex items-center justify-center rounded-lg bg-dangerRed hover:bg-dangerRed/75 duration-300"
										>
											<FaPlus className="rotate-45" size={18} fill={"#ffffff"} />
										</button>
										<button
											type="submit"
											className={`icon-xl flex items-center justify-center rounded-lg duration-300 bg-green-600 hover:bg-green-700`}
										>
											<FaCheck size={18} fill={"#ffffff"} />
										</button>
									</div>
								</div>
								<div className="grid grid-cols-12 gap-4 flex-1 overflow-y-auto">
									<div className="col-span-12 sm:col-span-6 md:col-span-4 flex flex-col gap-1">
										<label
											htmlFor="firstName"
											className="block text-sm font-semibold required"
										>
											First Name
										</label>
										<input
											type="text"
											id="firstName"
											name="firstName"
											value={formData.firstName}
											onChange={handleInputChange}
											placeholder="First Name"
											className="bg-mainBg placeholder:text-secondaryText focus:outline-accent text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
											required
										/>
									</div>
									<div className="col-span-12 sm:col-span-6 md:col-span-4 flex flex-col gap-1">
										<label
											htmlFor="lastName"
											className="block text-sm font-semibold required"
										>
											Last Name
										</label>
										<input
											type="text"
											id="lastName"
											name="lastName"
											value={formData.lastName}
											onChange={handleInputChange}
											placeholder="Last Name"
											className="bg-mainBg placeholder:text-secondaryText focus:outline-accent text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
											required
										/>
									</div>
									<div className="col-span-12 sm:col-span-6 md:col-span-4 flex flex-col gap-1">
										<label
											className="text-sm font-semibold required"
											htmlFor="gender"
										>
											Gender
										</label>
										<div className="flex space-x-2 rounded-lg bg-mainBg select-none">
											<label className="radio flex-1 flex flex-grow items-center justify-center rounded-lg cursor-pointer">
												<input
													type="radio"
													name="gender"
													defaultValue="Male"
													className="peer hidden flex-1"
													checked={formData.gender === "Male"}
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
													checked={formData.gender === "Female"}
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
													checked={formData.gender === "Others"}
													onChange={handleInputChange}
												/>
												<span className="text-sm flex-1 text-center peer-checked:bg-gradient-to-r peer-checked:bg-accent peer-checked:text-white peer-checked:font-semibold p-2 rounded-lg transition duration-150 ease-in-out">
													Others
												</span>
											</label>
										</div>
									</div>
									<div className="col-span-12 sm:col-span-6 md:col-span-4 flex flex-col gap-1">
										<label
											htmlFor="name"
											className="block text-sm font-semibold required"
										>
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
									<div className="col-span-12 sm:col-span-6 md:col-span-4 flex flex-col gap-1">
										<label
											htmlFor="name"
											className="block text-sm font-semibold required"
										>
											Email
										</label>
										<input
											type="email"
											name="email"
											value={formData.email}
											onChange={handleInputChange}
											placeholder="Email"
											className="bg-mainBg placeholder:text-secondaryText focus:outline-accent text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
											required
										/>
									</div>
									<div className="col-span-12 sm:col-span-6 md:col-span-4 flex flex-col gap-1">
										<label
											htmlFor="name"
											className="block text-sm font-semibold required"
										>
											Company
										</label>
										<input
											type="text"
											name="company"
											value={formData.company}
											onChange={handleInputChange}
											placeholder="Company"
											className="bg-mainBg placeholder:text-secondaryText focus:outline-accent text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
											required
										/>
									</div>

									{/* <div>
                  <label htmlFor="name" className="block text-sm font-semibold required">
                      Select Speciality
                  </label>
                  <select
                      name="speciality"
                      value={selectedSpeciality}
                      onChange={(e) => {
                          handleInputChange(e);
                          setSelectedSpeciality(e.target.value);
                      }}
                      className="relative w-full cursor-default font-input-style text-sm rounded-lg px-3 py-1.5 bg-mainBg placeholder:text-secondaryText focus:ring-1 focus:outline-accent focus:ring-accent"
                      required
                  >
                      <option value="">Select Speciality</option>
                      {specialities.map((speciality) => (
                          <option key={speciality} value={speciality}>
                              {speciality}
                          </option>
                      ))}
                  </select>
                </div> */}
									<div className="col-span-12 flex flex-col gap-1">
										<label
											htmlFor="mainserviceId"
											className="block text-sm font-semibold"
										>
											Select Specialities
										</label>
										<Select
											isMulti
											name="speciality"
											placeholder="Select Specialities"
											options={specialities}
											value={selectedSpeciality}
											onChange={(selected) => {
												setSelectedSpeciality(selected);
												handleInputChange({
													target: { value: selected, name: "speciality" },
												});
											}}
											className="basic-multi-select text-sm"
											classNamePrefix="select"
										/>
									</div>
									<div className="col-span-12">
										<label className="text-sm font-semibold flex items-center space-x-2">
											<input
												type="checkbox"
												name="isPartner"
												checked={formData.isPartner}
												onChange={handleInputChange}
												className="w-3.5 h-3.5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
											/>
											<span className="text-primaryText text-sm">
												Is Partner ?
											</span>
										</label>
									</div>

									{!formData.isPartner ? (
										<div className="col-span-12 sm:col-span-6 flex flex-col gap-1">
											<label
												htmlFor="name"
												className="block text-sm font-semibold"
											>
												Select Center
											</label>
											<div className="flex items-center gap-2">
												<select
													name="centerId"
													value={selectedCenter}
													onChange={(e) => {
														handleInputChange(e);
														setSelectedCenter(e.target.value);
													}}
													className="relative w-full cursor-default font-input-style text-sm rounded-lg px-3 py-2 bg-mainBg placeholder:text-secondaryText focus:ring-1 focus:outline-accent focus:ring-accent"
												>
													<option value="">Select Center</option>
													{centersList.map((center) => (
														<option key={center._id} value={center._id}>
															{center.centerName}
														</option>
													))}
												</select>
												<button onClick={(e) => openCenterModal(e)} className="flex items-center justify-center p-2 rounded-lg bg-mainBg hover:bg-lightGray">
													<FaPlus size={18} fill="#F05F23" />
												</button>
											</div>

										</div>
									) : null}
									{formData.isPartner ? (
										<>
											<div className="col-span-12 sm:col-span-6 flex flex-col gap-1">
												<label
													htmlFor="name"
													className="block text-sm font-semibold required"
												>
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
														<FaPlus size={18} fill="#F05F23" />
													</button>
												</div>
											</div>
											<div className="col-span-12 sm:col-span-6 flex flex-col gap-1">
												<label
													htmlFor="name"
													className="block text-sm font-semibold required"
												>
													Select City
												</label>
												<div className="flex items-center gap-2">
													<select
														name="city"
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
															<option key={city._id} value={city.cityName}>
																{city.cityName}
															</option>
														))}
													</select>
													<button onClick={(e) => openCityModal(e)} className="flex items-center justify-center p-2 rounded-lg bg-mainBg hover:bg-lightGray">
														<FaPlus size={18} fill="#F05F23" />
													</button>
												</div>
											</div>
										</>
									) : null}

								</div>
							</form>)}
					</Modal>
					{isCenterModalOpen ? <AddCenter isModalOpen={isCenterModalOpen} setIsModalOpen={setIsCenterModalOpen} isAddNew={isAddNewCenter} setIsAddNew={setIsAddNewCenter} statesList={statesFromCentersList} setStatesList={setStatesFromCentersList} citiesList={citiesFromCentersList} setCitiesList={setCitiesFromCentersList} /> : null}
					{isStateModalOpen ? <AddState isModalOpen={isStateModalOpen} setIsModalOpen={setIsStateModalOpen} isAddNew={isAddNewState} setIsAddNew={setIsAddNewState} /> : null}
					{isCityModalOpen ? <AddCity isModalOpen={isCityModalOpen} setIsModalOpen={setIsCityModalOpen} isAddNew={isAddNewCity} setIsAddNew={setIsAddNewCity} statesList={statesFromCitiesList} setStatesList={setStatesFromCitiesList} /> : null}
				</div>

			) : (
				<AccessDenied />
			)}
			<ToastContainer />
		</>
	);
};

export default AddDoctor;
