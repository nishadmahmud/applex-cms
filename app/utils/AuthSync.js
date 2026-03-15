'use client'
import { useSession } from 'next-auth/react'
import  { useEffect } from 'react'
import { useDispatch } from 'react-redux';
import { setToken } from '../store/authSlice';
import { useRouter } from 'next/navigation';

export default function AuthSync() {
    const {data : session,status} = useSession();
    const dispatch = useDispatch();
    const router = useRouter();

    useEffect(() => {
        if(status === "authenticated"){
            dispatch(setToken(session.accessToken));
        }

        if(status === "unauthenticated"){
            router.replace('/signin');
        }
    },[session,status,dispatch])
    
  return null;
}
