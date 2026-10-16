import type * as Three from 'three';
export function robotGeometry(T:typeof Three,n:number,w:number,h:number,d:number):Three.BufferGeometry{
 switch(n){case 0:return new T.BoxGeometry(w,h,d);case 1:return new T.SphereGeometry(w*.65,12,8);case 2:return new T.CylinderGeometry(w*.55,w*.65,h,6);case 3:return new T.CylinderGeometry(w*.5,w*.5,h,16);case 4:return new T.OctahedronGeometry(w*.65);case 5:return new T.IcosahedronGeometry(w*.65,0);case 6:return new T.CapsuleGeometry(w*.4,h*.5,4,12);case 7:return new T.CylinderGeometry(w*.6,w*.3,h,8);case 8:return new T.TorusGeometry(w*.43,w*.17,8,16);default:return new T.CylinderGeometry(w*.4,w*.6,h,4);}
}
