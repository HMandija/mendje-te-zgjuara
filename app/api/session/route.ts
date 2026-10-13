import {ApiError} from '../../../lib/school-access';
import {json,student} from '../../../lib/school-server';
import {emailIdentity} from '../../../lib/email-auth';

export async function GET(request:Request){
  try{
    if(request.headers.has('authorization')){
      const actor=await student(request);
      return json({authenticated:!!actor,role:actor?'STUDENT':null});
    }
    const actor=await emailIdentity(request);
    return json({authenticated:!!actor,role:actor?'TEACHER':null});
  }catch(error){
    if(error instanceof ApiError&&(error.status===401||error.status===403))return json({authenticated:false,role:null});
    throw error;
  }
}
