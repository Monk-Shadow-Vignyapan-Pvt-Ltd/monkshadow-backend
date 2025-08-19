import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { API_BASE_URL } from "../config/constant.js";
import { SearchIcon } from "../components/Icons/SearchIcon.jsx";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { FaCheck, FaPlus } from "react-icons/fa6";
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
import { NoDataIcon } from "../components/Icons/NoDataIcon.jsx";

Modal.setAppElement("#root");

const Service = () => {
  const [services, setServices] = useState([]);
  const [serviceName, setServiceName] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState("");
  const [servicePrice, setServicePrice] = useState("");
  const [isAddOn, setIsAddOn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [isAddEditFormOpen, setIsAddEditFormOpen] = useState(false);
  const [isSubServiceFormOpen, setIsSubServiceFormOpen] = useState(false);
  const [isTableDataOpen, setIsTableDataOpen] = useState(true);
  const { selectCountry } = useRoles();
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredserviceList, setFilteredServiceList] = useState([]);
  const [filteredSubServiceList, setFilteredSubServiceList] = useState([]);
  const [originalTotalPages, setOriginalTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async (page) => {
    setIsLoading(true); // Start loading
    try {
      const ServiceResponse = await axios.get(
        `${API_BASE_URL}/${selectCountry}/service/getServices?page=${page}`
      );

      const servicesData = ServiceResponse?.data?.services || [];
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

  useEffect(() => {
    fetchData(currentPage);
  }, [selectCountry, currentPage]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() !== '') {
      const lowercasedQuery = query.toLowerCase();
      // We filter the original `services` list to ensure we always search the full dataset
      const filteredData = services.filter(service =>
        service.serviceName.toLowerCase().includes(lowercasedQuery) ||
        service.description.toLowerCase().includes(lowercasedQuery)
      );
      setFilteredServiceList(filteredData);
    } else {
      // If the search query is empty, restore the full list
      setFilteredServiceList(services);
    }
  };


  const handleSubmit = async () => {
    setIsLoading(true);

    if (!serviceName || !description) {
      setIsLoading(false);
      return toast.warn("Please fill out all required fields.");
    }

    const data = {
      serviceName,
      parentId: parentId === "None -" ? "" : parentId,
      description,
      isAddOn,
      servicePrice: isAddOn ? servicePrice : null,
    };

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

      fetchData(currentPage);
      setIsLoading(false);
      closeAddEditForm();
    } catch (error) {
      console.error("Error uploading service:", error);
      toast.error("Failed to upload service.");
      setIsLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const openAddEditForm = (service = null) => {
    setEditingPackage(service);
    setServiceName(service ? service.serviceName : "");
    setDescription(service ? service.description : "");
    setParentId(service ? service.parentId || "None -" : "None -");
    setIsAddOn(service ? service.isAddOn : false);
    setServicePrice(service ? service.servicePrice : "");
    setIsAddEditFormOpen(true);
    setIsSubServiceFormOpen(false);
    if (window.innerWidth < 1024) {
      setIsTableDataOpen(false);
    }
  };

  const closeAddEditForm = () => {
    setIsAddEditFormOpen(false);
    setEditingPackage(null);
    if (window.innerWidth < 1024) {
      setIsTableDataOpen(true);
    }
  };

  const openSubServiceForm = useCallback(
    (parentServiceId) => {
      setIsSubServiceFormOpen(true);
      setIsAddEditFormOpen(false);
      setFilteredSubServiceList(
        services.filter((service) => service.parentId === parentServiceId)
      );
      if (window.innerWidth < 1024) {
        setIsTableDataOpen(false);
      }
    },
    [services]
  );

  const closeSubServiceForm = () => {
    setIsSubServiceFormOpen(false);
    if (window.innerWidth < 1024) {
      setIsTableDataOpen(true);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      const anyFormOpen = isAddEditFormOpen || isSubServiceFormOpen;
      if (window.innerWidth >= 1024) {
        setIsTableDataOpen(true);
      } else {
        if (anyFormOpen) {
          setIsTableDataOpen(false);
        } else {
          setIsTableDataOpen(true);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isAddEditFormOpen, isSubServiceFormOpen]);


  const handleDeleteClick = async (id) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      try {
        setIsLoading(true);
        await axios.delete(
          `${API_BASE_URL}/${selectCountry}/service/deleteService/${id}`
        );
        toast.success("Service deleted successfully!");
        fetchData(currentPage);
        setIsLoading(false);
      } catch (error) {
        console.error("Error deleting service:", error);
        toast.error("Failed to delete service.");
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      {isLoading ? (
        <div className="w-full flex-1 flex justify-center items-center bg-cardBg dark:bg-[#141414] duration-200">
          <i className="loader" />
        </div>
      ) : (
        <div className="flex-1 h-full w-full flex overflow-hidden">
          {isTableDataOpen && (
            <div className={`mx-auto w-full h-full flex flex-col flex-1 duration-200 bg-cardBg dark:bg-[#141414] dark:text-[#e6e6e6] p-5 gap-6 overflow-y-auto`}>
              <div className={`w-full ${(isAddEditFormOpen || isSubServiceFormOpen) && "lg:flex-col lg:items-start xl:flex-row xl:items-center"} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
                <h3 className="text-xl font-bold text-accent dark:text-[#e6e6e6]">All Services</h3>
                <div className={`flex items-center gap-3 w-full sm:w-auto ${(isAddEditFormOpen || isSubServiceFormOpen) && "lg:w-full xl:w-auto"}`}>
                  <div className={`flex-1 sm:max-w-fit ${(isAddEditFormOpen || isSubServiceFormOpen) && "lg:flex-1 lg:max-w-none"} flex items-center dark:bg-[#1a1a1a] focus-visible:border-[#f05f23] dark:focus-within:border-[#7b3517] border-2 dark:border-[#2b2b2b] px-3 py-2 rounded-lg`}>
                    <label htmlFor="search-FAQ">
                      <SearchIcon width={18} height={18} fill={"none"} />
                    </label>
                    <input
                      id="search-FAQ"
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className={`ms-2 w-full ${(isAddEditFormOpen || isSubServiceFormOpen) ? "sm:w-full xl:w-60" : "sm:w-60"} bg-transparent text-sm p-0 focus:outline-0`}
                      type="text"
                      placeholder="Search by service or description etc."
                    />
                  </div>
                  <button
                    onClick={() => openAddEditForm()}
                    className="bg-accent hover:bg-accent/70 duration-300 w-8 h-8 flex aspect-square justify-center items-center text-sm font-semibold text-cardBg rounded-lg"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 48 48"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={5} d="m24.06 10l-.036 28M10 24h28"></path></svg>
                  </button>
                </div>
              </div>

              {filteredserviceList < 1 ?
                <div className="flex-1 w-full flex flex-col gap-5 items-center justify-center">
                  <NoDataIcon className={'w-6/12 lg:w-3/12'} />
                  <h3 className="font-bold text-lg xl:text-xl text-[#e6e6e6]">No Data Found</h3>
                </div>
                :
                <div className={`w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ${(isAddEditFormOpen || isSubServiceFormOpen) ? "lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3" : "lg:grid-cols-3 2xl:grid-cols-4"} gap-4 overflow-y-auto`}>
                  {filteredserviceList
                    .filter(s => !s.parentId)
                    .map((service) => (
                      <div key={service._id} className="h-fit rounded-lg relative flex flex-col gap-3 p-3 dark:bg-[#1a1a1a] border-2 dark:border-[#2b2b2b]">
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-sm">Service:</span>
                          <span className="text-sm">{service.serviceName}</span>
                        </div>
                        <div className="flex flex-col items-start gap-1">
                          <span className="font-semibold text-sm">Description:</span>
                          <span className="text-sm">{service.description}</span>
                        </div>
                        <div className="flex flex-row gap-1">
                          <span className="font-semibold text-sm">Is Addon:</span>
                          <span className="text-sm">{service.isAddOn ? "Yes" : "No"}</span>
                        </div>
                        <div className="flex flex-row gap-1">
                          <span className="font-semibold text-sm">Price:</span>
                          <span className="text-sm">{service.servicePrice ? `$${service.servicePrice}` : "-"}</span>
                        </div>
                        <div className="mt-2">
                          <button
                            className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-800 dark:hover:bg-green-900 px-3 py-2 h-full text-sm text-nowrap font-semibold text-cardBg rounded-lg"
                            onClick={() => openSubServiceForm(service.serviceName)}
                          >
                            View Sub-Services
                          </button>
                        </div>
                        <div className="flex absolute top-2.5 right-2 gap-2">
                          <button onClick={() => openAddEditForm(service)}>
                            <EditIcon width={16} height={16} fill={"currentColor"} />
                          </button>
                          <button onClick={() => handleDeleteClick(service._id)}>
                            <MdOutlineDelete size={23} className="text-red-500" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              }

              {totalPages > 1 && !searchQuery && (
                <div className="flex justify-center mt-auto pt-4">
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
            </div>
          )}

          {isAddEditFormOpen && (
            <div className="bg-cardBg dark:bg-[#141414] dark:text-[#e6e6e6] border-l-2 dark:border-[#2b2b2b] p-4 lg:max-w-100 flex flex-col gap-4 overflow-y-auto flex-1">
              <div className="flex items-center justify-between w-full">
                <h2 className="text-xl font-bold text-accent dark:text-[#e6e6e6]">{editingPackage ? "Edit Service" : "Add Service"}</h2>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={closeAddEditForm} className="icon-xl flex items-center justify-center rounded-lg bg-dangerRed hover:bg-dangerRed/75 dark:bg-[#4d1a19] duration-300">
                    <FaPlus className="rotate-45" size={18} fill={"#ffffff"} />
                  </button>
                  <button onClick={handleSubmit} className={`icon-xl flex items-center justify-center rounded-lg duration-300 ${editingPackage ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-950' : 'bg-green-600 hover:bg-green-700 dark:bg-[#005239]'}`}>
                    <FaCheck size={14} fill={"#ffffff"} />
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="serviceName" className="block text-sm font-semibold required">Service</label>
                <input id="serviceName" type="text" value={serviceName} onChange={(e) => setServiceName(e.target.value)} placeholder="Enter Service" className="bg-mainBg placeholder:text-secondaryText dark:bg-[#000] border-2 border-[#c5c5c5] dark:border-[#2b2b2b] focus-visible:border-[#f05f23] dark:focus-visible:border-[#7b3517] focus-visible:outline-none text-sm rounded-lg px-3 py-2 block w-full" />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="description" className="block text-sm font-semibold required">Description</label>
                <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter description" className="bg-mainBg placeholder:text-secondaryText dark:bg-[#000] border-2 border-[#c5c5c5] dark:border-[#2b2b2b] focus-visible:border-[#f05f23] dark:focus-visible:border-[#7b3517] focus-visible:outline-none text-sm rounded-lg px-3 py-2 block w-full" style={{ minHeight: '100px' }} />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="parentId" className="block text-sm font-semibold">Parent Service</label>
                <select id="parentId" name="parentId" value={parentId} onChange={(e) => setParentId(e.target.value)} className="bg-mainBg dark:bg-[#000] dark:text-white border-2 border-[#c5c5c5] dark:border-[#2b2b2b] focus-visible:border-[#f05f23] dark:focus-visible:border-[#7b3517] focus-visible:outline-none text-sm rounded-lg px-3 py-2 block w-full">
                  <option value="None -">None -</option>
                  {services.filter(s => !s.parentId).map((service) => (
                    <option key={service._id} value={service.serviceName}>{service.serviceName}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="block text-sm font-semibold">Is Addon</label>
                <div className="flex flex-1 space-x-2 rounded-lg bg-mainBg dark:bg-black select-none p-1">
                  <label className="radio flex-1 flex flex-grow items-center justify-center rounded-lg cursor-pointer">
                    <input type="radio" name="isAddOn" className="peer hidden" checked={isAddOn} onChange={() => setIsAddOn(true)} />
                    <span className="text-sm flex-1 text-center peer-checked:bg-accent peer-checked:text-white peer-checked:font-semibold p-2 rounded-lg transition duration-150 ease-in-out">Yes</span>
                  </label>
                  <label className="radio flex-1 flex flex-grow items-center justify-center rounded-lg cursor-pointer">
                    <input type="radio" name="isAddOn" className="peer hidden" checked={!isAddOn} onChange={() => setIsAddOn(false)} />
                    <span className="text-sm flex-1 text-center peer-checked:bg-accent peer-checked:text-white peer-checked:font-semibold p-2 rounded-lg transition duration-150 ease-in-out">No</span>
                  </label>
                </div>
              </div>
              <div className={`flex flex-col gap-1 transition-opacity duration-300 ${!isAddOn && "opacity-50"}`}>
                <label htmlFor="price" className={`block text-sm font-semibold ${isAddOn ? 'required' : ''}`}>Price</label>
                <input id="price" type="number" disabled={!isAddOn} value={servicePrice} onChange={(e) => setServicePrice(e.target.value)} placeholder="Price" className="bg-mainBg placeholder:text-secondaryText dark:bg-[#000] border-2 border-[#c5c5c5] dark:border-[#2b2b2b] focus-visible:border-[#f05f23] dark:focus-visible:border-[#7b3517] focus-visible:outline-none text-sm rounded-lg px-3 py-2 block w-full disabled:cursor-not-allowed" />
              </div>
            </div>
          )}

          {isSubServiceFormOpen && (
            <div className="bg-cardBg dark:bg-[#141414] dark:text-[#e6e6e6] border-l-2 dark:border-[#2b2b2b] p-4 lg:max-w-100 flex flex-col gap-4 overflow-y-auto flex-1">
              <div className="flex items-center justify-between w-full">
                <h2 className="text-xl font-bold text-accent dark:text-[#e6e6e6]">Sub-Services</h2>
                <button onClick={closeSubServiceForm} className="icon-xl flex items-center justify-center rounded-lg bg-dangerRed hover:bg-dangerRed/75 dark:bg-[#4d1a19] duration-300">
                  <FaPlus className="rotate-45" size={18} fill={"#ffffff"} />
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {filteredSubServiceList.length > 0 ? (
                  filteredSubServiceList.map((service) => (
                    <div key={service._id} className="flex justify-between items-center w-full text-sm p-3 rounded-lg dark:bg-[#1a1a1a] border-2 dark:border-[#2b2b2b]">
                      <div className="flex flex-col">
                        <span className="font-semibold">{service.serviceName}</span>
                        <span className="text-xs text-gray-400">{service.description}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold text-accent">{service.servicePrice ? `$${service.servicePrice}` : "-"}</span>
                        <button onClick={() => openAddEditForm(service)}>
                          <EditIcon width={16} height={16} fill={"currentColor"} />
                        </button>
                        <button onClick={() => handleDeleteClick(service._id)}>
                          <MdOutlineDelete size={20} className="text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center gap-2 px-3 py-4 text-sm font-semibold border-2 border-dashed rounded-lg border-[#2b2b2b] dark:border-[#2b2b2b]">
                    <p>No sub-services available.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      <ToastContainer />
    </>
  );
};

export default Service;
