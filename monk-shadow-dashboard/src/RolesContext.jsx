import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from './config/constant';
import { LoaderAnime } from './components/LoaderAnime';

export const RolesContext = createContext();

export const RolesProvider = ({ children }) => {
    const [users, setUsers] = useState([]);
    const [userId,setUserId]  = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [selectCountry,setSelectedCountry] = useState("india");
    const [role,setRole] = useState("");
    
        const fetchRoles = async () => {
            let token = localStorage.getItem('auth-token');
            setIsLoading(true);
            try {
                const response = await axios.get(
                    `${API_BASE_URL}/auth/getUser`,
                    { headers: { 'x-auth-token': token } }
                );
                setRole(response.data.country);
                setSelectedCountry( response.data.country === "Canada" ? "canada" : "india")
                setUsers(response.data.users);
                setUserId(response.data.id);
            } catch (error) {
                console.error("Error fetching roles:", error);
            } finally {
                setIsLoading(false); // Ensure loading completes
            }
        };
    useEffect(() => {
        fetchRoles();
    }, []);

    if (isLoading) {
        return <LoaderAnime />; // Render the loader while loading
    }

    return (
        <RolesContext.Provider value={{ userId,users,selectCountry,setSelectedCountry,fetchRoles,role }}>
            {children}
        </RolesContext.Provider>
    );
};

export const useRoles = () => {
    return useContext(RolesContext);
};
