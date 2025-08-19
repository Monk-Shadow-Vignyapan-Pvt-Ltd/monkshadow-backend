import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Footer } from '../section/Footer';
import { Loader } from '../components/Loader';
import Sidebar from '../components/Sidebar';
import Header from '../section/Header';

const Layout = () => {
    const [loader, setLoader] = useState(true); // loader state for loader function
    const [toggle, setToggle] = useState(true)

    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoader(false);
        }, 5100);

        // Clean up timer on component unmount
        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            {/* {loader ? (
                <Loader />
            ) : ( */}
            <div>
                <div className='flex w-full relative min-h-screen lg:h-screen text-primaryText'>
                    <Sidebar toggle={toggle} />
                    <div className="w-full lg:w-auto flex flex-col flex-1 h-screen bg-cardBg dark:bg-[#141414]">
                        <Header setToggle={() => setToggle(!toggle)} toggle={toggle} />
                        <div className="flex-1 flex flex-col overflow-y-auto">
                            <Outlet />
                        </div>
                        <Footer />
                    </div>
                </div>
            </div>
            {/* )} */}
        </>
    );
};

export default Layout;
