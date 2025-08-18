import React from 'react'
import { FaFacebookF, FaTwitter, FaYoutube } from 'react-icons/fa6'
import { Link } from 'react-router-dom'
import { BsTwitterX } from 'react-icons/bs'
import { IoCall } from 'react-icons/io5'
import { IoLogoWhatsapp } from 'react-icons/io'
import { Facebook } from '../components/Icons/Facebook'
import { Whatsapp } from '../components/Icons/Whatsapp'
import { PhoneIcon } from '../components/Icons/PhoneIcon'

export const Footer = () => {
    return (
        <div className="">
            {/* ----------------------------------------- Footer Start ----------------------------------------- */}
            <footer className={`w-full app-header border-t-2 dark:border-[#2b2b2b] dark:bg-[#141414] dark:text-[#e6e6e6] px-4 py-4`}>
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                    <span className="text-md font-semibold">© 2024, Made by Monk Shadow</span>
                    {/* <div className="flex gap-5">
                        <Facebook className="dark:text-[#e6e6e6] dark:hover:text-white/75 duration-300 cursor-pointer" width={20} height={20} fill={"none"} />
                        <Whatsapp className="dark:text-[#e6e6e6] dark:hover:text-white/75 duration-300 cursor-pointer" width={20} height={20} fill={"none"} />
                        <PhoneIcon className="dark:text-[#e6e6e6] dark:hover:text-white/75 duration-300 cursor-pointer" width={20} height={20} fill={"none"} />
                    </div> */}
                </div>
            </footer>
            {/* ----------------------------------------- Footer End ----------------------------------------- */}
        </div>
    )
}
