import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import DataTable from "react-data-table-component";
import Modal from "react-modal";
import { API_BASE_URL } from "../config/constant.js";
import { SearchIcon } from "../components/Icons/SearchIcon.jsx";
import { useRoles } from "../RolesContext";
import AccessDenied from "../components/AccessDenied.jsx";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { FaPlus } from "react-icons/fa6";
import { EditIcon } from "../components/Icons/EditIcon.jsx";
import { MdOutlineDelete } from "react-icons/md";
import {
  Label,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

Modal.setAppElement("#root");

const Package = () => {
  const [packages, setPackages] = useState("");
  const [packageName, setPackageName] = useState("");
  const [services, setServices] = useState("");
  const [noOfPages, setNoOfPages] = useState("");
  const [domesticPrice, setDomesticPrice] = useState("");
  const [duration, setduration] = useState("");
  const [lockingPeriod, setLockingPeriod] = useState("");
  const [internationalPrice, setInternationalPrice] = useState("");
  const [note, setnote] = useState();
  // const [addOnIs, setAddOnIs] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const { selectCountry } = useRoles();
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredPackageList, setFilteredPackageList] = useState([]);
  const [isSearchLoading, setIsSearchLoading] = useState(true);
  const [originalTotalPages, setOriginalTotalPages] = useState(0);
  const [subServiceModel, setsubService] = useState(false);

  const fetchData = async (page) => {
    setIsLoading(true); // Start loading
    try {
      const PackageResponse = await axios.get(
        `${API_BASE_URL}/${selectCountry}/packages/getPackages?page=${page}`
      );

      const packageData = PackageResponse?.data?.packages;

      console.log("Response pack", PackageResponse);

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

  // console.log("parentId", parentId);

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

  const handleSubmit = async () => {
    setIsLoading(true);

    if (!packageName || !services) {
      setIsLoading(false);
      return toast.warn("Please fill out all required fields.");
    }

    const data = {
      packageName,
      services,
      noOfPages, // May be null if no file is provided
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

      fetchData();
      setIsLoading(false);
      closeAddEditModal();
    } catch (error) {
      console.error("Error uploading Package:", error);
      toast.error("Failed to upload Package.");
    } finally {
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openModal = (packages = null) => {
    setEditingPackage(packages);
    setPackageName(packages ? packages.packageName : "");
    setServices(packages ? packages.services : "");
    setNoOfPages(packages ? packages.parentId : "");
    setDomesticPrice(packages ? packages.domesticPrice : "");
    setnote(packages ? packages.note : "");
    setduration(packages ? packages.duration : "");
    setLockingPeriod(packages ? packages.lockingPeriod : "");
    setInternationalPrice(packages ? packages.internationalPrice : "");
    setnote(packages ? packages.note : "");
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
    if (window.confirm("Are you sure you want to delete this Package?")) {
      try {
        setIsLoading(true);
        await axios.delete(
          `${API_BASE_URL}/${selectCountry}/packages/deletePackage/${id}`
        );
        toast.success("Packages deleted successfully!");
        fetchData();
        setIsLoading(false);
      } catch (error) {
        console.error("Error deleting Packages:", error);
        toast.error("Failed to delete Packages.");
      }
    }
  };

  // const openSubServiceModal = useCallback(
  //   (parentId) => {
  //     setsubService(true);
  //     setFilteredSubServiceList(
  //       filteredPackageList.filter((service) => service.parentId === parentId)
  //     );
  //   },
  //   [filteredPackageList]
  // );

  return (
    <>
      {isLoading ? (
        <div className="w-full h-100 flex justify-center items-center bg-cardBg card-shadow rounded-lg">
          <i className="loader" />
        </div>
      ) : (
        <>
          <div className="mx-auto w-full flex flex-col col-span-12 md:col-span-8 justify-between bg-cardBg rounded-lg card-shadow p-5 gap-6">
            <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-xl font-bold text-accent">All Contacts</h3>
              <div className="flex items-center border-2 px-3 py-2 rounded-lg">
                <label htmlFor="search-FAQ">
                  <SearchIcon width={18} height={18} fill={"none"} />
                </label>
                <input
                  id="search-FAQ"
                  // value={searchQuery}
                  onChange={(e) => {
                    fetchSearchData(e.target.value);
                  }}
                  className="ms-2 w-full sm:w-60 bg-transparent text-sm p-0 focus:outline-0"
                  type="text"
                  placeholder="Search by Name or Email etc."
                />
              </div>
              <button
                onClick={() => openModal()}
                className="bg-accent hover:bg-accent/70 px-3 py-2 h-full text-sm font-semibold text-cardBg rounded-lg"
              >
                Add Contact
              </button>
            </div>

            {isSearchLoading && (
              <div
                className={`flex-1 w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 2xl:grid-cols-4 gap-4 overflow-y-auto`}
              >
                {filteredPackageList.map((packages) => (
                  <div
                    key={packages._id}
                    className="border-2 h-fit rounded-lg relative flex flex-col gap-3 p-3"
                  >
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-sm">Package</span>
                      <span className="text-sm">{packages.packageName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-sm">Services</span>
                      <span className="text-sm">{packages.services}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-sm">
                        No. Of Pages
                      </span>
                      <span className="text-sm">{packages.noOfPages}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-sm">
                        Domestic Price
                      </span>
                      <span className="text-sm">{packages.domesticPrice}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-sm">Duratation</span>
                      <span className="text-sm">{packages.duration}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-sm">
                        Locking Period
                      </span>
                      <span className="text-sm">{packages.lockingPeriod}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-sm">
                        International Price
                      </span>
                      <span className="text-sm">
                        {packages.internationalPrice}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-sm">Note</span>
                      <span className="text-sm">{packages.note}</span>
                    </div>

                    <div className="flex absolute top-2.5 right-2 gap-2">
                      <button onClick={() => openModal(packages)}>
                        <EditIcon width={16} height={16} fill={"#444050"} />
                      </button>
                      <button onClick={() => handleDeleteClick(packages._id)}>
                        <MdOutlineDelete size={23} fill="#333333" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
            <Modal
              isOpen={isAddEditModalOpen}
              onRequestClose={closeAddEditModal}
              contentLabel="Packages Modal"
              className="w-full max-w-[500px] max-h-[96vh] overflow-auto bg-cardBg z-50 m-4 p-6 rounded-2xl flex flex-col gap-4"
              overlayClassName="overlay"
            >
              <h2 className="text-xl font-bold text-accent">
                {editingPackage ? "Edit Package" : "Add Package"}
              </h2>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="packageName"
                  className="block text-sm font-semibold required"
                >
                  Package name
                </label>
                <input
                  id="packageName"
                  type="text"
                  value={packageName}
                  placeholder="Enter Package Name"
                  onChange={(e) => setPackageName(e.target.value)}
                  className="bg-mainBg placeholder:text-secondaryText focus:outline-accent text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="services"
                  className="block text-sm font-semibold required"
                >
                  Services
                </label>
                <input
                  id="services"
                  type="text"
                  value={services}
                  placeholder="Enter Services"
                  onChange={(e) => setServices(e.target.value)}
                  className="bg-mainBg placeholder:text-secondaryText focus:outline-accent text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="noOfPage"
                  className="block text-sm font-semibold required"
                >
                  No Of Pages:
                </label>
                <select
                  id="noOfPage"
                  type="text"
                  placeholder="Enter No. Of Pages No:"
                  onChange={(e) => setNoOfPages(e.target.value)}
                  className="bg-mainBg placeholder:text-secondaryText focus:outline-accent text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
                >
                  <option id="noOfPage" value={noOfPages}>0-10</option>
                  <option id="noOfPage" value={noOfPages}>10-20</option>
                  <option id="noOfPage" value={noOfPages}>15-30</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="domesticPrice"
                  className="block text-sm font-semibold "
                >
                  Domestic Price
                </label>
                <input
                  id="domesticPrice"
                  type="number"
                  value={domesticPrice}
                  onChange={(e) => setDomesticPrice(e.target.value)}
                  placeholder="Enter Domestic Price"
                  className="bg-mainBg placeholder:text-secondaryText focus:outline-accent text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="duration"
                  className="block text-sm font-semibold "
                >
                  Duration
                </label>
                <input
                  id="duration"
                  value={duration}
                  onChange={(e) => setduration(e.target.value)}
                  placeholder="Enter Domestic Price"
                  className="bg-mainBg placeholder:text-secondaryText focus:outline-accent text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="lockingPeriod"
                  className="block text-sm font-semibold "
                >
                  Locking Period
                </label>
                <input
                  id="lockingPeriod"
                  type="number"
                  value={lockingPeriod}
                  onChange={(e) => setLockingPeriod(e.target.value)}
                  placeholder="Enter Locking Period"
                  className="bg-mainBg placeholder:text-secondaryText focus:outline-accent text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="internationalPrice"
                  className="block text-sm font-semibold "
                >
                  International Price
                </label>
                <input
                  id="internationalPrice"
                  type="number"
                  value={internationalPrice}
                  onChange={(e) => setInternationalPrice(e.target.value)}
                  placeholder="Enter Locking Period"
                  className="bg-mainBg placeholder:text-secondaryText focus:outline-accent text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="note" className="block text-sm font-semibold ">
                  Note
                </label>
                <textarea
                  id="note"
                  value={note}
                  onChange={(e) => setnote(e.target.value)}
                  placeholder="Enter Locking Period"
                  className="bg-mainBg placeholder:text-secondaryText focus:outline-accent text-sm rounded-lg px-3 py-2 block w-full flatpickr-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 m-x-4 w-full">
                <button
                  onClick={handleSubmit}
                  className={`px-6 py-2 rounded-lg text-cardBg text-md font-medium  ${
                    editingPackage
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {editingPackage ? "Update Contact" : "Add Contact"}
                </button>
                <button
                  onClick={closeAddEditModal}
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

export default Package;
