import React, { useState, useEffect } from 'react';
import { ThreeDotsMenu } from '../components/Icons/ThreeDotsMenu.jsx';
import Pagination from '../components/Pagination.jsx';

import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import 'flatpickr/dist/plugins/confirmDate/confirmDate.css';
import confirmDate from 'flatpickr/dist/plugins/confirmDate/confirmDate';
import { SearchIcon } from '../components/Icons/SearchIcon.jsx';

const Datatable = () => {


    const formatDate = (date) => {
        if (!date) return '';
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return new Intl.DateTimeFormat('en-US', options).format(date).split('/').join('-');
    };

    useEffect(() => {
        flatpickr('#date', {
            enableTime: false,
            dateFormat: "d-m-y", // Flatpickr date format
            maxDate: new Date(),
            plugins: [new confirmDate({
                confirmText: 'OK',
                showAlways: false,
                theme: 'light',
            })],
            disableMobile: true,
        });
    }, []);

    const data = [
        { project: 'Website SEO', leader: 'Emily', team: 'Team A', progress: 71, date: '1O May 2021' },
        { project: 'Website SEO', leader: 'Jake', team: 'Team B', progress: 4, date: '1O May 2021' },
        { project: 'Website SEO', leader: 'Black', team: 'Team C', progress: 100, date: '1O May 2021' },
        { project: 'Website SEO', leader: 'Veer', team: 'Team D', progress: 71, date: '1O May 2021' },
        { project: 'Website SEO', leader: 'Veer', team: 'Team D', progress: 71, date: '1O May 2021' },
        { project: 'Website SEO', leader: 'Veer', team: 'Team D', progress: 71, date: '1O May 2021' },
        { project: 'Website SEO', leader: 'Veer', team: 'Team D', progress: 71, date: '1O May 2021' },
        { project: 'Website SEO', leader: 'Veer', team: 'Team D', progress: 71, date: '1O May 2021' },
        { project: 'Website SEO', leader: 'Veer', team: 'Team D', progress: 71, date: '1O May 2021' },
        { project: 'Website SEO', leader: 'Veer', team: 'Team D', progress: 71, date: '1O May 2021' },
        // Add more data items as needed
    ];

    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 4;

    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = data.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(data.length / rowsPerPage);
    const totalEntries = data.length;

    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    return (
        <div className="w-full flex flex-col col-span-12 md:col-span-8 justify-between md:items-center bg-cardBg rounded-lg card-shadow p-5 gap-5">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center w-full gap-4">
                <span className="text-lg font-semibold text-primaryText">Project List</span>
                <div className="flex items-center border-b-2 border-secondaryText pb-0.5">
                    <input className="w-full sm:w-auto bg-transparent p-0 focus:outline-0 text-md" type="Search" placeholder='Search' />
                    <SearchIcon width={20} height={20} fill={"none"} />
                </div>
            </div>

            <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 items-center justify-between gap-3">

                <div className="flex flex-col">
                    <label className="mb-1 text-md font-semibold" htmlFor="Project" >Project</label>
                    <input id="Project" className="font-input-style text-sm min-w-0 rounded-lg px-3 py-2 focus:outline-accent bg-mainBg placeholder:text-secondaryText" type="text" placeholder="Enter your First Name" />
                </div>
                <div className="flex flex-col light">
                    <label className="mb-1 text-md font-semibold" htmlFor="dateOfBirth">Date</label>
                    <div className="relative col">
                        <input
                            id="date"
                            type="text"
                            name="date"
                            readOnly
                            className="bg-mainBg placeholder:text-secondaryText focus:outline-none text-sm rounded-lg px-3 py-2 block w-full "
                            placeholder="Enter your Date of Birth"
                        />
                    </div>
                </div>
                <div className="flex flex-col">
                    <label className="mb-1 text-md font-semibold" htmlFor="Leader" >Leader</label>
                    <input id="Leader" className="font-input-style text-sm min-w-0 rounded-lg px-3 py-2 focus:outline-accent bg-mainBg placeholder:text-secondaryText" type="text" placeholder="Enter Leader" />
                </div>
                <div className="flex flex-col">
                    <label className="mb-1 text-md font-semibold" htmlFor="Progress">Progress</label>
                    <div className="focus-within:outline-1 focus-within:outline-accent bg-mainBg flex items-center justify-between px-3 py-2 rounded-lg">
                        <input id="Progress" className="font-input-style flex-1 me-2 text-sm min-w-0 focus:outline-none bg-mainBg placeholder:text-secondaryText" type="text" placeholder="Enter Progress" />
                        <span className="text-accent text-sm">%</span>
                    </div>
                </div>
                <div className="flex flex-col">
                    <label className="mb-1 text-md font-semibold" htmlFor="Team">Team</label>
                    <input id="Team" className="font-input-style text-sm min-w-0 rounded-lg px-3 py-2 focus:outline-accent bg-mainBg placeholder:text-secondaryText" type="text" placeholder="Enter your Company Name" />
                </div>
                <div className="flex justify-between items-end h-full gap-3">
                    <button className="bg-accent w-full h-fit hover:bg-accent/70 px-3 py-2 text-sm font-semibold text-cardBg rounded-lg">Save</button>
                    <button className="bg-secondaryText w-full h-fit hover:bg-secondaryText/70 px-3 py-2 text-sm font-semibold text-cardBg rounded-lg">Cancel</button>
                </div>
            </div>

            <div className="w-full overflow-scroll flex-1 flex flex-col justify-center relative">
                <table className="w-full text-sm text-left rtl:text-right border-0 bg-cardBg text-primaryText">
                    <thead className="w-full text-md border-b-2 border-l-0 border-r-0 border-border border-2 text-primaryText">
                        <tr>
                            <th scope="col">
                                <div className="flex items-center">
                                    <input
                                        id="checkbox-all-search"
                                        type="checkbox"
                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="checkbox-all-search" className="sr-only">
                                        checkbox
                                    </label>
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-3">Project</th>
                            <th scope="col" className="px-6 py-3">Leader</th>
                            <th scope="col" className="px-6 py-3">Team</th>
                            <th scope="col" className="px-6 py-3">Progress</th>
                            <th scope="col" className="py-3 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="w-full">
                        {currentRows.map((row, index) => (
                            <tr key={index} className="border-b-2 border-l-0 border-r-0 border-border border-2 hover:bg-gray-50 items-center">
                                <td className="w-4">
                                    <div className="flex items-center">
                                        <input
                                            id={`checkbox-table-search-${index}`}
                                            type="checkbox"
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <label htmlFor={`checkbox-table-search-${index}`} className="sr-only">
                                            checkbox
                                        </label>
                                    </div>
                                </td>
                                <th scope="row" className="px-6 py-4 font-medium whitespace-nowrap flex flex-col">
                                    <span className="font-semibold text-md">{row.project}</span>
                                    <span className="font-normal mt-0.5">{row.date}</span>
                                </th>
                                <td className="h-full px-6 py-4">{row.leader}</td>
                                <td className="h-full px-6 py-4">
                                    <div className="w-32 flex overflow-hidden">
                                        <img
                                            className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
                                            src="https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                            alt=""
                                        />
                                        <img
                                            className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
                                            src="https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                            alt=""
                                        />
                                        <img
                                            className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
                                            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80"
                                            alt=""
                                        />
                                        <div className="flex items-center justify-center font-semibold h-8 w-8 rounded-full ring-2 bg-lightRed text-cardBg ring-white">
                                            +1
                                        </div>
                                    </div>
                                </td>
                                <td className="h-full px-6 py-4">
                                    <div className="w-full bg-gray-200 rounded-full h-2 bg-placeHolder overflow-hidden">
                                        <div className="bg-lightRed h-2 rounded-full" style={{ width: `${row.progress}%` }} />
                                    </div>
                                </td>
                                <td className="h-full align-middle px-6 py-4">
                                    <div className="flex justify-center items-center w-full">
                                        <ThreeDotsMenu width={20} height={20} fill={"none"} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalEntries={totalEntries}
                entriesPerPage={rowsPerPage}
            />
        </div>
    )
}

export default Datatable