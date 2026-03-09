"use client"

import Image from 'next/image'
import Link from 'next/link'
import { useSession } from "next-auth/react"

function NavBar() {
    const { data: session } = useSession();

    return (
        <nav className='border-b border-gray-500'>
            <div className='flex justify-between items-center px-6'>
                <Image src='/logo-nav.png' alt='Failio logo' width={120} height={120} />
                <div className='flex gap-6'>
                    <Link href='/' className='text-gray-600 hover:bg-gray-300 hover:text-gray-950 px-2 py-1 rounded-md'>Home</Link>
                    <Link href='/dashboard' className='text-gray-600 hover:bg-gray-300 hover:text-gray-950 px-2 py-1 rounded-md'>My Failure</Link>
                </div>

                <div>
                    {session ? (
                        <Link href='/profile' className='text-gray-600 hover:bg-gray-300 hover:text-gray-950 px-2 py-1 rounded-md'>Profile</Link>
                    ) : (
                        <div className='flex gap-5'>
                            <Link href='/sign-up' className='text-gray-600 bg-amber-300 px-3 py-2 rounded-md hover:bg-amber-400 hover:text-gray-800 transition-all duration-300'>Sign Up</Link>
                            <Link href='/sign-in' className='text-gray-300 bg-blue-600 px-3 py-2 rounded-md hover:bg-blue-700 hover:text-gray-200 transition-all duration-300'>Sign In</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    )
}

export default NavBar