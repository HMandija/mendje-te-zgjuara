import {LabRobot} from './learning-art';
import './robot-world-launcher.css';
export function RobotWorldLauncher({preview=false,student=false}:{preview?:boolean;student?:boolean}){
 return <section className="robot-world-launcher" aria-label="Bota e Robotit"><div className="robot-world-launcher-art" aria-hidden="true"><LabRobot/></div><div><span>ARGËTOHU · EKSPLORO · PROGRAMO</span><h2>Bota e Robotit</h2><p>{preview?'Njihu me botën 3D të robotit. Hyr në llogari për misionet dhe sfidat.':'Shëtit me robotin, ndërto ura dhe shpëto miqtë e pyllit.'}</p></div><a className="primary" href={student?'/student/robot-world':'/robot-world'}>{preview?'Eksploro lojën':'Argëtohu'} →</a></section>;
}
