import { getServerSession } from 'next-auth';
import { authOption } from '../api/auth/[...nextauth]/route';

const auth = () => {
    return getServerSession(authOption);
};

export default auth;