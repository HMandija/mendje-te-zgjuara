import {authorize,requireOrigin} from '../../../lib/school-access';
import {route,input} from '../../../lib/api-route';
import {bulkAssignmentInput,assignClasses,editAssignmentInput,deleteAssignmentInput,changeAssignment} from '../../../lib/classroom-server';
export async function POST(r:Request){return route(async()=>{requireOrigin(r);return assignClasses(await authorize(r,'class:write'),await input(r,bulkAssignmentInput));});}
export async function PUT(r:Request){return route(async()=>{requireOrigin(r);return changeAssignment(await authorize(r,'class:write'),await input(r,editAssignmentInput));});}
export async function DELETE(r:Request){return route(async()=>{requireOrigin(r);return changeAssignment(await authorize(r,'class:write'),await input(r,deleteAssignmentInput));});}
