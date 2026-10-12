import {db,hash} from './school-server';
import {ApiError} from './school-access';
type Attempt={failures:number;retry_at:number;locked:number;accepted:number};
const WAIT=5*60_000;
function blocked(row:Attempt,now:number):never {
  if(row.locked)throw new ApiError(403,'Për sigurinë tënde, kërko ndihmën e mësuesit për një figurë të re.',undefined,'PICTURE_LOCKED');
  throw new ApiError(429,'Kemi provuar disa figura. Prit pak ose kërko ndihmën e mësuesit.',Math.max(1,Math.ceil((row.retry_at-now)/1000)));
}
export async function guardedPictureLogin(classId:string,profile:string,picture:string,challengeHash:string){
  const now=Date.now(),attempt=crypto.randomUUID();
  const token=[...crypto.getRandomValues(new Uint8Array(32))].map(b=>b.toString(16).padStart(2,'0')).join('');
  // D1 batch is atomic: reserve a guess, grant only that successful attempt,
  // then consume the challenge. Concurrent requests cannot bypass the boundary.
  const results=await db().batch<Attempt>([
    db().prepare(`WITH candidate AS (
      SELECT l.class,l.profile,(l.picture=?) AS correct FROM picture_logins l
      JOIN class_students m ON m.class=l.class AND m.profile=l.profile
      JOIN classes c ON c.id=l.class JOIN accounts a ON a.user=c.owner
      LEFT JOIN classroom_settings s ON s.class=c.id
      JOIN roster_challenges r ON r.class=c.id AND r.hash=? AND r.expires>?
      WHERE l.class=? AND l.profile=? AND COALESCE(s.archived,0)=0
        AND a.enabled=1 AND a.role IN ('TEACHER','ADMIN')
    ) INSERT INTO picture_login_guard(class,profile,failures,retry_at,locked,attempt,accepted)
      SELECT class,profile,CASE WHEN correct THEN 0 ELSE 1 END,0,0,?,correct FROM candidate WHERE 1
      ON CONFLICT(class,profile) DO UPDATE SET
        failures=CASE WHEN excluded.accepted=1 THEN 0 ELSE failures+1 END,
        retry_at=CASE WHEN excluded.accepted=0 AND failures>=2 THEN ? ELSE 0 END,
        locked=CASE WHEN excluded.accepted=0 AND failures>=5 THEN 1 ELSE 0 END,
        attempt=excluded.attempt,accepted=excluded.accepted
      WHERE picture_login_guard.locked=0 AND picture_login_guard.retry_at<=?
      RETURNING failures,retry_at,locked,accepted`).bind(picture,challengeHash,now,classId,profile,attempt,now+WAIT,now),
    db().prepare(`INSERT INTO picture_sessions(hash,class,profile,expires)
      SELECT ?,class,profile,? FROM picture_login_guard WHERE class=? AND profile=? AND attempt=? AND accepted=1`)
      .bind(await hash(token),now+8*3600000,classId,profile,attempt),
    db().prepare(`DELETE FROM roster_challenges WHERE hash=? AND EXISTS (
      SELECT 1 FROM picture_login_guard WHERE class=? AND profile=? AND attempt=? AND accepted=1)`)
      .bind(challengeHash,classId,profile,attempt),
  ]);
  const row=results[0].results[0];
  if(row?.accepted)return token;
  if(row){if(row.locked||row.retry_at>now)blocked(row,now);throw new ApiError(401,'Figura nuk përputhet. Provo sërish ose pyet mësuesin.');}
  const state=await db().prepare('SELECT failures,retry_at,locked,accepted FROM picture_login_guard WHERE class=? AND profile=?').bind(classId,profile).first<Attempt>();
  if(state&&(state.locked||state.retry_at>now))blocked(state,now);
  throw new ApiError(401,'Hyrja nuk u krye. Vendose përsëri kodin e klasës.');
}
