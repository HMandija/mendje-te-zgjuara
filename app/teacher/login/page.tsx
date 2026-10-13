import {headers} from 'next/headers';
import {redirect} from 'next/navigation';
import {TeacherAuth} from '../../../components/teacher-auth';
import {emailSessionPresent} from '../../../lib/email-auth';
export default async function Page(){const incoming=await headers(),cookie=incoming.get('cookie');if(cookie&&await emailSessionPresent(new Request('https://mendje.internal/teacher/login',{headers:{cookie}})))redirect('/teacher');return <TeacherAuth/>;}
