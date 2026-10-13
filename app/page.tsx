import {headers} from 'next/headers';
import {redirect} from 'next/navigation';
import {LandingPage} from '../components/landing-page';
import {emailSessionPresent} from '../lib/email-auth';
export default async function Page(){const incoming=await headers(),cookie=incoming.get('cookie');if(cookie&&await emailSessionPresent(new Request('https://mendje.internal/',{headers:{cookie}})))redirect('/teacher');return <LandingPage/>;}
