import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { brandLogo, logo, pinkalBlackLogo } from '../assets'
import { Logo } from './Icons/Logo'
import MenuSectionIcon from './MenuSectionIcon'
import MenuItemIcon from './MenuItemIcon'
// import { MenuComponent } from './MenuComponent'
import { HideSidebar } from './Icons/hideSidebar'
import { useRoles } from '../RolesContext';
import { UpArrow } from './Icons/UpArrow';


const Sidebar = (props) => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const location = useLocation();
    const {role} = useRoles() ;

    const [openSubMenus, setOpenSubMenus] = useState({});

    const { userRole } = useRoles();

    const toggleSubMenu = (menuName) => {
        setOpenSubMenus((prevState) => ({
            ...prevState,
            [menuName]: !prevState[menuName],
        }));
    };

    const MenuComponent = ({ to, name, icon, isArrow }) => {
        const isActive = location.pathname === to;

        return (
            <li className="mb-2 last:mb-0">
                <Link
                    className={`menu-section duration-100 ease-linear 
                        px-3 py-2 flex items-center relative justify-between ${isActive ? 'btnLinear hover:bg-accent/75 text-mainBg font-semibold' : 'hover:bg-menuActive'
                        } rounded-lg`}
                    to={to}
                >
                    <div className="flex items-center flex-1">
                        <div
                            className={`active-menu-status ${isActive ? 'bg-accent' : ''
                                } h-3 w-2 absolute left-[-4px] rounded-lg`}
                        ></div>
                        {icon}
                        {!isSidebarCollapsed && <span className="text-md ms-2">{name}</span>}
                    </div>
                    {isArrow && <UpArrow width={20} height={20} fill="none" />}
                </Link>
            </li>
        );
    };

    return (
        <>
            <aside className={`app-sidebar hidden lg:flex flex-col border-r-2 bg-try h-full px-3 pt-2 overflow-hidden ${isSidebarCollapsed ? "w-fit" : "w-[260px]"}`} id="sidebar">
                {/* Start::main-sidebar-header */}
                <div className={`px-3 py-2 flex justify-between items-center mb-4`}>

                    {!isSidebarCollapsed &&
                        <Link to="/" className="header-logo brandLogoAside">
                            {/* <Logo width={32} height={"auto"} fill={"none"} /> */}
                            {/* <span>IR Clinic</span> */}
                            <img src={brandLogo} className='h-full w-auto' alt="brandLogo" />
                        </Link>
                    }
                    {/* <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="hide-sidebar-button icon-md">
                        <HideSidebar width={20} height={20} fill={"none"} />
                    </button> */}
                </div>
                {/* End::main-sidebar-header */}
                {/* Start::main-sidebar */}
                <div className="main-sidebar flex-1 overflow-y-auto" id="sidebar-scroll">
                    {/* Start::nav */}
                    <nav className="main-menu-container nav nav-pills flex-column sub-open">
                   
                        <ul className="main-menu flex flex-col">
                            <div className="mb-2">
                            {role === "India" ?  <MenuComponent to={'/users'} name={"Users"} icon={<MenuSectionIcon />} isActive={false} /> : null}
                           

                            <MenuComponent to={'/contacts'} name={"Contacts"} icon={<MenuSectionIcon />} isActive={false} />

                            <MenuComponent to={'/career'} name={"Career Master"} icon={<MenuSectionIcon />} isActive={false} />

                            <MenuComponent to={'/career-forms'} name={"Career Forms"} icon={<MenuSectionIcon />} isActive={false} />

                            <MenuComponent to={'/service'} name={"Service Maker"} icon={<MenuSectionIcon />} isActive={false} />

                            <MenuComponent to={'/package'} name={"Package Maker"} icon={<MenuSectionIcon />} isActive={false} />



                            </div>

                        </ul>
                    </nav>
                    {/* End::nav */}
                </div>
                {/* End::main-sidebar */}
            </aside>
        </>

    )
}

export default Sidebar