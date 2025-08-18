import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { API_BASE_URL } from "../config/constant.js";
import { SearchIcon } from "../components/Icons/SearchIcon.jsx";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { FaPlus } from "react-icons/fa6";
import { MdOutlineDelete } from "react-icons/md";
import {
  Label,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import Skeleton from "react-loading-skeleton";
import Modal from "react-modal";
import { EditIcon } from "../components/Icons/EditIcon.jsx";
import "react-loading-skeleton/dist/skeleton.css";
import { useRoles } from "../RolesContext.jsx";

Modal.setAppElement("#root");

const Service = () => {
  const [services, setServices] = useState([]);
  const [serviceName, setServiceName] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState("None -");
  const [servicePrice, setServicePrice] = useState();
  const [isAddOn, setIsAddOn] = useState(false);
  // const [addOnIs, setAddOnIs] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const { selectCountry } = useRoles();
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredserviceList, setFilteredServiceList] = useState([]);
  const [filteredSubServiceList, setFilteredSubServiceList] = useState([]);
  const [isSearchLoading, setIsSearchLoading] = useState(true);
  const [originalTotalPages, setOriginalTotalPages] = useState(0);
  const [subServiceModel, setsubService] = useState(false);

  const fetchData = async (page) => {
    setIsLoading(true); // Start loading
    try {
      const ServiceResponse = await axios.get(
        `${API_BASE_URL}/${selectCountry}/service/getServices?page=${page}`
      );

      const servicesData = ServiceResponse?.data?.services;

      console.log("Response", ServiceResponse);
      // console.log("Hi",ServiceResponse.data.service);

      setServices(servicesData);
      setFilteredServiceList(servicesData);
      setOriginalTotalPages(ServiceResponse.data.pagination.totalPages);
      setTotalPages(ServiceResponse.data.pagination.totalPages);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data.");
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  // console.log("parentId", parentId);

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

  const handleSubmit = async () => {
    setIsLoading(true);

    if (!serviceName || !description) {
      setIsLoading(false);
      return toast.warn("Please fill out all required fields.");
    }

    const data = {
      serviceName,
      parentId,
      description, // May be null if no file is provided
      isAddOn,
      servicePrice,
    };

    console.log(isAddOn);

    try {
      const endpoint = editingPackage
        ? `${API_BASE_URL}/${selectCountry}/service/updateService/${editingPackage._id}`
        : `${API_BASE_URL}/${selectCountry}/service/addService`;

      await axios.post(endpoint, data, {
        headers: { "Content-Type": "application/json" },
      });

      toast.success(
        editingPackage
          ? "Service updated successfully!"
          : "Service added successfully!"
      );

      fetchData();
      setIsLoading(false);
      closeAddEditModal();
    } catch (error) {
      console.error("Error uploading service:", error);
      toast.error("Failed to upload service.");
    } finally {
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openModal = (services = null) => {
    setEditingPackage(services);
    setServiceName(services ? services.serviceName : "");
    setDescription(services ? services.description : "");
    setParentId(services ? services.parentId : "");
    setIsAddOn(services ? services.isAddOn : false);
    setServicePrice(services ? services.servicePrice : "");
    setIsAddEditModalOpen(true);
  };

  const closeAddEditModal = () => {
    setIsAddEditModalOpen(false);
    setEditingPackage(null);
  };
  const closeSubServiceModel = () => {
    setsubService(null);
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
        paddingTop: "8px",
        paddingBottom: "8px",
      },
    },
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      try {
        setIsLoading(true);
        await axios.delete(
          `${API_BASE_URL}/${selectCountry}/service/deleteService/${id}`
        );
        toast.success("service deleted successfully!");
        fetchData();
        setIsLoading(false);
      } catch (error) {
        console.error("Error deleting service:", error);
        toast.error("Failed to delete service.");
      }
    }
  };

  const openSubServiceModal = useCallback(
    (parentId) => {
      setsubService(true);
      setFilteredSubServiceList(
        filteredserviceList.filter((service) => service.parentId === parentId)
      );
    },
    [filteredserviceList]
  ); // Only re-create the function when `filteredserviceList` changes

  console.log("service Name:", serviceName);


  return (
    <>
      {isLoading ? (
        <div className="w-full h-100 flex justify-center items-center bg-cardBg flex-1">
          <i className="loader" />
        </div>
      ) : (
        <>
          <div className="mx-auto w-full flex flex-col col-span-12 md:col-span-8 justify-between bg-cardBg flex-1 p-5 gap-6">
            <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-xl font-bold text-accent">All Services</h3>
              <div className="flex items-center gap-3">
                <div className="flex-1 sm:max-w-fit flex items-center border-2 px-3 py-2 rounded-lg">
                  <label htmlFor="search-FAQ">
                    <SearchIcon width={18} height={18} fill={"none"} />
                  </label>
                  <input
                    id="search-FAQ"
                    // value={searchQuery}
                    // onChange={(e) => {
                    //   fetchSearchData(e.target.value);
                    // }}
                    className="ms-2 w-full sm:w-60 bg-transparent text-sm p-0 focus:outline-0"
                    type="text"
                    placeholder="Search by service or description etc."
                  />
                </div>
                <button
                  onClick={() => openModal()}
                  className="bg-accent hover:bg-accent/70 duration-300 w-8 h-8 flex aspect-square justify-center items-center text-sm font-semibold text-cardBg rounded-lg"
                >
                  {/* Add Service */}
                  <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 48 48"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={5} d="m24.06 10l-.036 28M10 24h28"></path></svg>
                </button>
              </div>
            </div>

            {isSearchLoading && (
              <div
                className={`flex-1 w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 2xl:grid-cols-4 gap-4 overflow-y-auto`}
              >
                {filteredserviceList.map((service) => (
                  <>
                    {service.parentId ? (
                      <div
                        key={service._id}
                        className="border-2 h-fit rounded-lg relative flex flex-col gap-3 p-3"
                      >
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-sm">
                            Service:
                          </span>
                          <span className="text-sm">{service.serviceName}</span>
                        </div>
                        <div className="flex flex-col items-start gap-1">
                          <span className="font-semibold text-sm">
                            Description:
                          </span>
                          <span className="text-sm">{service.description}</span>
                        </div>
                        {service.parentId && (
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-sm">
                              Parent ID:
                            </span>
                            <span className="text-sm">{service.parentId}</span>
                          </div>
                        )}
                        <div className="flex flex-row gap-1">
                          <span className="font-semibold text-sm">
                            is Addon:
                          </span>
                          <span className="text-sm">
                            {service.isAddOn ? "Yes" : "No"}
                          </span>
                        </div>
                        <div className="flex flex-row gap-1">
                          <span className="font-semibold text-sm">Price</span>
                          <span className="text-sm">
                            {service.servicePrice ? service.servicePrice : "-"}
                          </span>
                        </div>
                        <div className="flex absolute top-2.5 right-2 gap-2">
                          <button onClick={() => openModal(service)}>
                            <EditIcon width={16} height={16} fill={"#444050"} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(service._id)}
                          >
                            <MdOutlineDelete size={23} fill="#333333" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        key={service._id}
                        className="border-2 h-fit rounded-lg relative flex flex-col gap-3 p-3"
                      >
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-sm">
                            Service:
                          </span>
                          <span className="text-sm">{service.serviceName}</span>
                        </div>
                        <div className="flex flex-col items-start gap-1">
                          <span className="font-semibold text-sm">
                            Description:
                          </span>
                          <span className="text-sm">{service.description}</span>
                        </div>
                        {service.parentId && (
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-sm">
                              Parent ID:
                            </span>
                            <span className="text-sm">{service.parentId}</span>
                          </div>
                        )}
                        <div className="flex flex-row gap-1">
                          <span className="font-semibold text-sm">
                            is Addon:
                          </span>
                          <span className="text-sm">
                            {service.isAddOn ? "Yes" : "No"}
                          </span>
                        </div>
                        <div className="flex flex-row gap-1">
                          <span className="font-semibold text-sm">Price</span>
                          <span className="text-sm">
                            {service.servicePrice ? service.servicePrice : "-"}
                          </span>
                        </div>
                        <div className="mt-2">
                          <button
                            className="px-6 py-2 rounded-lg text-cardBg text-md font-medium  bg-green-600 hover:bg-green-700"
                            onClick={() =>
                              openSubServiceModal(service.serviceName)
                            }
                          >
                            View Sub Service
                          </button>
                        </div>
                        <div className="flex absolute top-2.5 right-2 gap-2">
                          <button onClick={() => openModal(service)}>
                            <EditIcon width={16} height={16} fill={"#444050"} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(service._id)}
                          >
                            <MdOutlineDelete size={23} fill="#333333" />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ))}
              </div>
            )}

            {totalPages > 1 && (
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
            )}
            <Modal
              isOpen={isAddEditModalOpen}
              onRequestClose={closeAddEditModal}
              contentLabel="Service Modal"
              className="w-full max-w-[500px] max-h-[96vh] overflow-auto bg-cardBg z-50 m-4 p-6 rounded-2xl flex flex-col gap-4"
              overlayClassName="overlay"
            >
              <h2 className="text-xl font-bold text-accent">
                {editingPackage ? "Edit Service" : "Add Service"}
              </h2>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="serviceName"
                  className="block text-sm font-semibold required"
                >
                  Service
                </label>
                <input
                  id="serviceName"
                  type="text"
                  value={serviceName}
                  placeholder="Enter Service"
                  onChange={(e) => setServiceName(e.target.value)}
                  className="bg-mainBg placeholder:text-secondaryText focus:outline-accent text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="description"
                  className="block text-sm font-semibold required"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  type="text"
                  value={description}
                  placeholder="Enter description"
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-mainBg placeholder:text-secondaryText focus:outline-accent text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="parentId"
                  className="block text-sm font-semibold"
                >
                  Parent ID
                </label>
                {/* <input
                
                  type="text"
                  value={parentId}
                  placeholder="Enter parentId No:"
                 
                  className="bg-mainBg placeholder:text-secondaryText focus:outline-accent text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
                /> */}
                <select
                  className="bg-mainBg  text-black focus:outline-accent text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
                  id="parentId"
                  name="parentId"
                  placeholder="Enter parentId No:"
                  onChange={(e) => setParentId(e.target.value)}
                >
                  <option
                    name="parentId"
                    className="text-black"
                    value={parentId}
                  >
                    None -
                  </option>
                  {filteredserviceList.map((service) => (
                    <>
                      {service.serviceName && service.parentId == "" && (
                        <option className="text-black">
                          {service.serviceName}
                        </option>
                      )}
                    </>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="isAddOn"
                  className="block text-sm font-semibold "
                >
                  Is addon
                </label>
                <div className="flex gap-2 px-4">
                  <div className="flex items-center gap-1">
                    <input
                      type="radio"
                      name="Yes"
                      placeholder="Yes"
                      value={isAddOn}
                      onClick={() => setIsAddOn(true)}
                    />
                    <span className="block text-sm font-semibold pt-0.5">
                      Yes
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="radio"
                      name="Yes"
                      placeholder="No"
                      value={isAddOn}
                      onClick={() => setIsAddOn(false)}
                    />
                    <span className="block text-sm font-semibold pt-0.5">
                      No
                    </span>
                  </div>
                </div>
              </div>

              <div
                className={`flex flex-col gap-1 ${isAddOn == false && "opacity-50"
                  }`}
              >
                <label
                  htmlFor="parentId"
                  disabled={isAddOn}
                  className={`block text-sm font-semibold required`}
                >
                  Price
                </label>
                <input
                  id="price"
                  type="number"
                  disabled={!isAddOn ? "disabled" : ""}
                  value={servicePrice}
                  placeholder="Price"
                  onChange={(e) => setServicePrice(e.target.value)}
                  className="bg-mainBg placeholder:text-secondaryText focus:outline-accent text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 m-x-4 w-full">
                <button
                  onClick={handleSubmit}
                  className={`px-6 py-2 rounded-lg text-cardBg text-md font-medium  ${editingPackage
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-green-600 hover:bg-green-700"
                    }`}
                >
                  {editingPackage ? "Update Service" : "Add Service"}
                </button>
                <button
                  onClick={closeAddEditModal}
                  className="px-6 py-2 rounded-lg font-medium text-md text-cardBg bg-dangerRed duration-300"
                >
                  Cancel
                </button>
              </div>
            </Modal>
            <Modal
              isOpen={subServiceModel}
              onRequestClose={closeSubServiceModel}
              contentLabel="Service Modal"
              className="w-full max-w-[500px] max-h-[96vh] overflow-auto bg-cardBg z-50 m-4 p-6 rounded-2xl flex flex-col gap-4"
              overlayClassName="overlay"
            >
              <h2 className="text-xl font-bold text-accent">Sub Service</h2>
              <div className="flex flex-col gap-1">
                {/* <label
                  htmlFor="serviceName"
                  className="block text-sm font-semibold"
                >
                  
                </label> */}
                {filteredSubServiceList.length > 0 &&
                  filteredSubServiceList.map((service) => (
                    <>
                      <div className="flex justify-between w-full text-sm mt-3">
                        <div className="block">{service.serviceName}</div>
                        <div className="block">
                          {service.servicePrice ? service.servicePrice : "-"}
                        </div>
                      </div>
                    </>
                  ))}
              </div>
              <div className="grid grid-cols-2 gap-3 m-x-4 w-full">
                <button
                  // onClick={handleSubmit}
                  className={`px-6 py-2 rounded-lg text-cardBg text-md font-medium  ${editingPackage
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-green-600 hover:bg-green-700"
                    }`}
                >
                  {editingPackage ? "Update Service" : "Add Service"}
                </button>
                <button
                  onClick={() => setsubService(false)}
                  className="px-6 py-2 rounded-lg font-medium text-md text-cardBg bg-dangerRed duration-300"
                >
                  Cancel
                </button>
              </div>
            </Modal>
          </div>
        </>
      )}
      <ToastContainer />
    </>
  );
};

export default Service;
