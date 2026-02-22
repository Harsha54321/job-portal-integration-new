import React from 'react'
import './EHeader.css'
import search from '../assets/icon_search.png'
import chat from '../assets/header_message.png'
import bell from '../assets/header_bell.png'
import { Link, NavLink } from 'react-router-dom'


export const EHeader = () => {
    const NavIcons = [

        { image: chat, path: "/Job-portal/Employer/chat" },
        { image: bell, path: "" },

    ]
    return (
        <header className="header">
            <div className="logo">job portal</div>
            <div className='E-Header-search'>
                <img className="E-searchicon" src={search} alt="search icon" />
                <input className="input" type="text" placeholder='Search for jobs and applicants' />
            </div>

            <div className="auth-links">
                {NavIcons.map((IC, index) => {
                    const isActive = Location.pathname === IC.path
                    return (
                        <Link key={index} to={IC.path}><img className={isActive ? 'jheader-icons-active' : 'jheader-icons'} src={IC.image} width={40} alt='My Jobs' /></Link>)
                })}
            </div>

        </header>
    )
}