import { authOption } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';

const serverFetchPromise = async (url,options={}) => {
    const session = await getServerSession(authOption);
    const token = session.accessToken;
    const res = await fetch(`${url}`,{
        options,
        headers : {
            authorization : `Bearer ${token}`
        }
    })
    return res.json();
};

export default serverFetchPromise;