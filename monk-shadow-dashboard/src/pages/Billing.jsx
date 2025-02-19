import React, { useState, useEffect } from 'react';
import { ThreeDotsMenu } from '../components/Icons/ThreeDotsMenu';
import ApexBarChart from '../components/BarChart';
import TreemapChart from '../components/BasicTreemap';
import ThreeColTable from '../components/ThreeColTable';
import OrdersOverview from '../components/OrdersOverview';
import BillingInformation from '../components/BillingInformation';
import { WalletIcon } from '../components/Icons/WalletIcon';
import { BankIcon } from '../components/Icons/BankIcon';
import { cardImg, visa } from '../assets';
import { EditIcon } from '../components/Icons/EditIcon';
import InvoiceTable from '../components/Invoicetabel';

const Billing = () => {

    const data = [
        { Product: 'PlayStation 4 1TB (Jet Black)', Qty: '3', Sum: '$480.00' },
        { Product: 'PlayStation 4 1TB (Jet Black)', Qty: '3', Sum: '$480.00' },
        { Product: 'PlayStation 4 1TB (Jet Black)', Qty: '3', Sum: '$480.00' },
        { Product: 'PlayStation 4 1TB (Jet Black)', Qty: '3', Sum: '$480.00' },
        { Product: 'PlayStation 4 1TB (Jet Black)', Qty: '3', Sum: '$480.00' },
        { Product: 'PlayStation 4 1TB (Jet Black)', Qty: '3', Sum: '$480.00' },
        { Product: 'PlayStation 4 1TB (Jet Black)', Qty: '3', Sum: '$480.00' },
        { Product: 'PlayStation 4 1TB (Jet Black)', Qty: '3', Sum: '$480.00' },
        { Product: 'PlayStation 4 1TB (Jet Black)', Qty: '3', Sum: '$480.00' },
    ];

    const Invoices = [
        { Product: 'March, 01, 2020', date:'#MS-415646', price: '$480.00', pdf: "true" },
        { Product: 'March, 01, 2020', date:'#MS-415646', price: '$480.00', pdf: "false" },
        { Product: 'March, 01, 2020', date:'#MS-415646', price: '$480.00', pdf: "true" },
        { Product: 'March, 01, 2020', date:'#MS-415646', price: '$480.00', pdf: "false" },
        { Product: 'March, 01, 2020', date:'#MS-415646', price: '$480.00', pdf: "true" },
        { Product: 'March, 01, 2020', date:'#MS-415646', price: '$480.00', pdf: "false" },
        { Product: 'March, 01, 2020', date:'#MS-415646', price: '$480.00', pdf: "true" },
        { Product: 'March, 01, 2020', date:'#MS-415646', price: '$480.00', pdf: "false" },
        { Product: 'March, 01, 2020', date:'#MS-415646', price: '$480.00', pdf: "true" },
    ];

    return (
        <>
            <section className="w-full flex flex-col items-center justify-between gap-3">
                <div className="w-full grid grid-cols-12 items-center justify-between gap-3">
                    <div className="w-full flex flex-col col-span-12 lg:col-span-6 justify-between bg-cardBg rounded-lg card-shadow h-full p-5">
                        <div className="flex justify-between items-start w-full">
                            <div className="w-full flex flex-col">
                                <span className="text-lg font-semibold text-primaryText">Earning Reports</span>
                                <span className="text-md text-secondaryText mt-2">Weekly Earnings Overview</span>
                            </div>
                            <ThreeDotsMenu width={26} height={26} fill={"none"} />
                        </div>
                        <div className="w-full">
                            <TreemapChart />
                        </div>
                    </div>

                    <div className="w-full flex flex-col col-span-12 lg:col-span-6 justify-between md:items-center bg-cardBg rounded-lg card-shadow h-full p-5 gap-4">
                        <div className="flex justify-between items-start w-full">
                            <div className="w-full flex flex-col">
                                <span className="text-lg font-semibold text-primaryText">Latest Sells</span>
                            </div>
                            <ThreeDotsMenu width={26} height={26} fill={"none"} />
                        </div>
                        <ThreeColTable data={data} />
                    </div>
                </div>


                <div className="w-full grid grid-cols-12 items-center justify-between gap-3">
                    <OrdersOverview />
                    <BillingInformation />
                </div>

                <div className="w-full grid grid-cols-12 items-center justify-between gap-3">
                    <div className="grid grid-cols-12 col-span-12 xl:col-span-8 2xl:col-span-8 gap-3 h-full">
                        <div className="grid grid-cols-12 col-span-12 gap-3">
                            <div className="flex flex-col items-center justify-center col-span-6 sm:col-span-6 md:col-span-3 lg:col-span-3 xl:col-span-3 bg-cardBg rounded-lg card-shadow h-full p-5 gap-4">
                                <div className="w-fit p-4 rounded-lg bg-lightAccent">
                                    <BankIcon width={46} height={46} fill={"#f16b35"} />
                                </div>
                                <div className="w-full flex flex-col items-center">
                                    <span className="text-lg font-semibold">Salary</span>
                                    <span className="text-md text-center">Belong Interactive</span>
                                </div>
                                <div className="pt-4 border-t-2 border-border w-full flex flex-col items-center">
                                    <span className="font-semibold">+$2000</span>
                                </div>
                            </div>

                            <div className="flex flex-col items-center justify-center col-span-6 sm:col-span-6 md:col-span-3 lg:col-span-3 xl:col-span-3 bg-cardBg rounded-lg card-shadow h-full p-5 gap-4">
                                <div className="w-fit p-4 rounded-lg bg-lightAccent">
                                    <WalletIcon width={46} height={46} fill={"#f16b35"} />
                                </div>
                                <div className="w-full flex flex-col items-center">
                                    <span className="text-lg font-semibold">Paypal</span>
                                    <span className="text-md text-center">Freelance Payment</span>
                                </div>
                                <div className="pt-4 border-t-2 border-border w-full flex flex-col items-center">
                                    <span className="font-semibold">$455.00</span>
                                </div>
                            </div>

                            <img className="w-full col-span-12 md:col-span-6" src={cardImg} alt="Card" />
                        </div>

                        <div className="flex flex-1 flex-col col-span-12 bg-cardBg rounded-lg card-shadow p-5 gap-4">
                            <div className="flex justify-between items-center w-full">
                                <div className="w-full flex flex-col">
                                    <span className="text-lg font-semibold text-primaryText">Payment Method</span>
                                </div>
                                <button className="bg-accent hover:bg-accent/70 px-6 py-1.5 w-fit text-md font-semibold text-cardBg rounded-lg text-nowrap">Add New Card</button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="p-4 border-2 rounded-lg w-full flex items-center">
                                    <div className="w-full flex items-center gap-3">
                                        <img className="w-16" src={visa} alt="Visa" />
                                        {/* eslint-disable-next-line no-irregular-whitespace */}
                                        <span className="text-lg font-semibold text-primaryText">****   ****   ****   <span className="text-accent">7852</span></span>
                                    </div>
                                    <EditIcon width={22} height={22} fill={"#f05f23"} />
                                </div>
                                <div className="p-4 border-2 rounded-lg w-full flex items-center">
                                    <div className="w-full flex items-center gap-3">
                                        <img className="w-16" src={visa} alt="Visa" />
                                        {/* eslint-disable-next-line no-irregular-whitespace */}
                                        <span className="text-lg font-semibold text-primaryText">****   ****   ****   <span className="text-accent">7852</span></span>
                                    </div>
                                    <EditIcon width={22} height={22} fill={"#f05f23"} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 col-span-12 xl:col-span-4 2xl:col-span-4 bg-cardBg rounded-lg card-shadow h-full p-5 gap-4 justify-between md:items-center">
                        <div className="flex justify-between items-start w-full">
                            <div className="w-full flex flex-col">
                                <span className="text-lg font-semibold text-primaryText">Latest Sells</span>
                            </div>
                            <ThreeDotsMenu width={26} height={26} fill={"none"} />
                        </div>
                        <InvoiceTable data={Invoices} />
                    </div>
                </div>

            </section>

            {/* <HeroSection /> */}
        </>
    )
}

export default Billing