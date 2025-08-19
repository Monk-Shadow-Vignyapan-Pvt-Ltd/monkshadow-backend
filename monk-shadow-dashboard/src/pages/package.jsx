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

const Package = () => {
  const [packages, setPackages] = useState([]);
  const [packageName, setPackageName] = useState("");
  const [services, setServices] = useState("");
  const [noOfPages, setNoOfPages] = useState("");
  const [domesticPrice, setDomesticPrice] = useState("");
  const [duration, setduration] = useState("");
  const [lockingPeriod, setLockingPeriod] = useState("");
  const [internationalPrice, setInternationalPrice] = useState("");
  const [note, setnote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [isAddEditFormOpen, setIsAddEditFormOpen] = useState(false);
  const [isTableDataOpen, setIsTableDataOpen] = useState(true);
  const { selectCountry } = useRoles();
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredPackageList, setFilteredPackageList] = useState([]);
  const [originalTotalPages, setOriginalTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async (page) => {
    setIsLoading(true); // Start loading
    try {
      const PackageResponse = await axios.get(
        `${API_BASE_URL}/${selectCountry}/packages/getPackages?page=${page}`
      );

      const packageData = PackageResponse?.data?.packages || [];
      setPackages(packageData);
      setFilteredPackageList(packageData);
      setOriginalTotalPages(PackageResponse.data.pagination.totalPages);
      setTotalPages(PackageResponse.data.pagination.totalPages);
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
      const filteredData = packages.filter(pkg =>
        pkg.packageName.toLowerCase().includes(lowercasedQuery) ||
        pkg.services.toLowerCase().includes(lowercasedQuery)
      );
      setFilteredPackageList(filteredData);
    } else {
      setFilteredPackageList(packages);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    if (!packageName || !services) {
      setIsLoading(false);
      return toast.warn("Please fill out all required fields.");
    }

    const data = {
      packageName,
      services,
      noOfPages,
      domesticPrice,
      duration,
      lockingPeriod,
      internationalPrice,
      note,
    };

    try {
      const endpoint = editingPackage
        ? `${API_BASE_URL}/${selectCountry}/packages/updatePackage/${editingPackage._id}`
        : `${API_BASE_URL}/${selectCountry}/packages/addPackage_`;

      await axios.post(endpoint, data, {
        headers: { "Content-Type": "application/json" },
      });

      toast.success(
        editingPackage
          ? "Package updated successfully!"
          : "Package added successfully!"
      );

      fetchData(currentPage);
      setIsLoading(false);
      closeAddEditForm();
    } catch (error) {
      console.error("Error uploading Package:", error);
      toast.error("Failed to upload Package.");
      setIsLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const openAddEditForm = (pkg = null) => {
    setEditingPackage(pkg);
    setPackageName(pkg ? pkg.packageName : "");
    setServices(pkg ? pkg.services : "");
    setNoOfPages(pkg ? pkg.noOfPages : "");
    setDomesticPrice(pkg ? pkg.domesticPrice : "");
    setnote(pkg ? pkg.note : "");
    setduration(pkg ? pkg.duration : "");
    setLockingPeriod(pkg ? pkg.lockingPeriod : "");
    setInternationalPrice(pkg ? pkg.internationalPrice : "");
    setIsAddEditFormOpen(true);
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

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsTableDataOpen(true);
      } else {
        if (isAddEditFormOpen) {
          setIsTableDataOpen(false);
        } else {
          setIsTableDataOpen(true);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isAddEditFormOpen]);


  const handleDeleteClick = async (id) => {
    if (window.confirm("Are you sure you want to delete this Package?")) {
      try {
        setIsLoading(true);
        await axios.delete(
          `${API_BASE_URL}/${selectCountry}/packages/deletePackage/${id}`
        );
        toast.success("Package deleted successfully!");
        fetchData(currentPage);
        setIsLoading(false);
      } catch (error) {
        console.error("Error deleting Package:", error);
        toast.error("Failed to delete Package.");
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
              <div className={`w-full ${isAddEditFormOpen && "lg:flex-col lg:items-start xl:flex-row xl:items-center"} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
                <h3 className="text-xl font-bold text-accent dark:text-[#e6e6e6]">All Packages</h3>
                <div className={`flex items-center gap-3 w-full sm:w-auto ${isAddEditFormOpen && "lg:w-full xl:w-auto"}`}>
                  <div className={`flex-1 sm:max-w-fit ${isAddEditFormOpen && "lg:flex-1 lg:max-w-none"} flex items-center dark:bg-[#1a1a1a] focus-visible:border-[#f05f23] dark:focus-within:border-[#7b3517] border-2 dark:border-[#2b2b2b] px-3 py-2 rounded-lg`}>
                    <label htmlFor="search-packages">
                      <SearchIcon width={18} height={18} fill={"none"} />
                    </label>
                    <input
                      id="search-packages"
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className={`ms-2 w-full ${isAddEditFormOpen ? "sm:w-full xl:w-60" : "sm:w-60"} bg-transparent text-sm p-0 focus:outline-0`}
                      type="text"
                      placeholder="Search by package name or services..."
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

              {filteredPackageList < 1 ?
                <div className="flex-1 w-full flex flex-col gap-5 items-center justify-center">
                  <NoDataIcon className={'w-6/12 lg:w-3/12'} />
                  <h3 className="font-bold text-lg xl:text-xl text-[#e6e6e6]">No Data Found</h3>
                </div> :
                <div className={`w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ${isAddEditFormOpen ? "lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3" : "lg:grid-cols-3 2xl:grid-cols-4"} gap-4 overflow-y-auto`}>
                  {filteredPackageList.map((pkg) => (
                    <div key={pkg._id} className="h-fit rounded-lg relative flex flex-col gap-3 p-3 dark:bg-[#1a1a1a] border-2 dark:border-[#2b2b2b]">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-sm">Package:</span>
                        <span className="text-sm">{pkg.packageName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-sm">Services:</span>
                        <span className="text-sm">{pkg.services}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-sm">No. Of Pages:</span>
                        <span className="text-sm">{pkg.noOfPages}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-sm">Domestic Price:</span>
                        <span className="text-sm">{pkg.domesticPrice}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-sm">Duration:</span>
                        <span className="text-sm">{pkg.duration}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-sm">Locking Period:</span>
                        <span className="text-sm">{pkg.lockingPeriod}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-sm">International Price:</span>
                        <span className="text-sm">{pkg.internationalPrice}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-sm">Note:</span>
                        <span className="text-sm">{pkg.note}</span>
                      </div>
                      <div className="flex absolute top-2.5 right-2 gap-2">
                        <button onClick={() => openAddEditForm(pkg)}>
                          <EditIcon width={16} height={16} fill={"currentColor"} />
                        </button>
                        <button onClick={() => handleDeleteClick(pkg._id)}>
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
                <h2 className="text-xl font-bold text-accent dark:text-[#e6e6e6]">{editingPackage ? "Edit Package" : "Add Package"}</h2>
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
                <label htmlFor="packageName" className="block text-sm font-semibold required">Package Name</label>
                <input id="packageName" type="text" value={packageName} onChange={(e) => setPackageName(e.target.value)} placeholder="Enter Package Name" className="bg-mainBg placeholder:text-secondaryText dark:bg-[#000] border-2 border-[#c5c5c5] dark:border-[#2b2b2b] focus-visible:border-[#f05f23] dark:focus-visible:border-[#7b3517] focus-visible:outline-none text-sm rounded-lg px-3 py-2 block w-full" />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="services" className="block text-sm font-semibold required">Services</label>
                <input id="services" type="text" value={services} onChange={(e) => setServices(e.target.value)} placeholder="Enter Services (comma-separated)" className="bg-mainBg placeholder:text-secondaryText dark:bg-[#000] border-2 border-[#c5c5c5] dark:border-[#2b2b2b] focus-visible:border-[#f05f23] dark:focus-visible:border-[#7b3517] focus-visible:outline-none text-sm rounded-lg px-3 py-2 block w-full" />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="noOfPages" className="block text-sm font-semibold">No. Of Pages</label>
                <input id="noOfPages" type="text" value={noOfPages} onChange={(e) => setNoOfPages(e.target.value)} placeholder="e.g., 10-20" className="bg-mainBg placeholder:text-secondaryText dark:bg-[#000] border-2 border-[#c5c5c5] dark:border-[#2b2b2b] focus-visible:border-[#f05f23] dark:focus-visible:border-[#7b3517] focus-visible:outline-none text-sm rounded-lg px-3 py-2 block w-full" />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="domesticPrice" className="block text-sm font-semibold">Domestic Price</label>
                <input id="domesticPrice" type="number" value={domesticPrice} onChange={(e) => setDomesticPrice(e.target.value)} placeholder="Enter Domestic Price" className="bg-mainBg placeholder:text-secondaryText dark:bg-[#000] border-2 border-[#c5c5c5] dark:border-[#2b2b2b] focus-visible:border-[#f05f23] dark:focus-visible:border-[#7b3517] focus-visible:outline-none text-sm rounded-lg px-3 py-2 block w-full" />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="duration" className="block text-sm font-semibold">Duration</label>
                <input id="duration" type="text" value={duration} onChange={(e) => setduration(e.target.value)} placeholder="e.g., 3 Months" className="bg-mainBg placeholder:text-secondaryText dark:bg-[#000] border-2 border-[#c5c5c5] dark:border-[#2b2b2b] focus-visible:border-[#f05f23] dark:focus-visible:border-[#7b3517] focus-visible:outline-none text-sm rounded-lg px-3 py-2 block w-full" />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="lockingPeriod" className="block text-sm font-semibold">Locking Period</label>
                <input id="lockingPeriod" type="text" value={lockingPeriod} onChange={(e) => setLockingPeriod(e.target.value)} placeholder="e.g., 1 Month" className="bg-mainBg placeholder:text-secondaryText dark:bg-[#000] border-2 border-[#c5c5c5] dark:border-[#2b2b2b] focus-visible:border-[#f05f23] dark:focus-visible:border-[#7b3517] focus-visible:outline-none text-sm rounded-lg px-3 py-2 block w-full" />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="internationalPrice" className="block text-sm font-semibold">International Price</label>
                <input id="internationalPrice" type="number" value={internationalPrice} onChange={(e) => setInternationalPrice(e.target.value)} placeholder="Enter International Price" className="bg-mainBg placeholder:text-secondaryText dark:bg-[#000] border-2 border-[#c5c5c5] dark:border-[#2b2b2b] focus-visible:border-[#f05f23] dark:focus-visible:border-[#7b3517] focus-visible:outline-none text-sm rounded-lg px-3 py-2 block w-full" />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="note" className="block text-sm font-semibold">Note</label>
                <textarea id="note" value={note} onChange={(e) => setnote(e.target.value)} placeholder="Enter Note" className="bg-mainBg placeholder:text-secondaryText dark:bg-[#000] border-2 border-[#c5c5c5] dark:border-[#2b2b2b] focus-visible:border-[#f05f23] dark:focus-visible:border-[#7b3517] focus-visible:outline-none text-sm rounded-lg px-3 py-2 block w-full" style={{ minHeight: '100px' }} />
              </div>
            </div>
          )}
        </div>
      )}
      <ToastContainer />
    </>
  );
};

export default Package;
