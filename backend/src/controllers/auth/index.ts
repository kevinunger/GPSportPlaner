import { NextFunction, Response } from 'express';
import { ExpressJwtRequest } from 'express-jwt';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Auth, ILoginData, Role } from '../../models/Auth';

const bcrypt = require('bcrypt');

export async function authenticate(loginData: ILoginData): Promise<string> {
  //check fields
  if (loginData.house !== '9' && loginData.house !== '11' && loginData.house !== '09') {
    throw new Error('Invalid house number');
  }

  if (loginData.room.length !== 3 && loginData.room.length !== 4) {
    throw new Error('Invalid room number');
  }

  if (loginData.password.length === 0) {
    throw new Error('No password provided');
  }

  const hashedPasswordUser = await getPasswordOfRole(Role.User);
  const hashedPasswordAdmin = await getPasswordOfRole(Role.Admin);
  const hashedPasswordMaster = await getPasswordOfRole(Role.Master);

  const saltRounds = 10;

  const hash2 = await bcrypt.hash(loginData.password, saltRounds);

  const result_user = await bcrypt.compare(loginData.password, hashedPasswordUser);
  let result_admin, result_master;
  if (!result_user) {
    result_admin = await bcrypt.compare(loginData.password, hashedPasswordAdmin);
  }
  if (!result_user && !result_admin) {
    result_master = await bcrypt.compare(loginData.password, hashedPasswordMaster);
  }
  if (result_user || result_admin || result_master) {
    loginData.role = result_user ? Role.User : result_admin ? Role.Admin : Role.Master;
    return await generateJwtToken(loginData);
  } else {
    throw new Error('Invalid password');
  }
}

// generate jwt token with express jwt
export async function generateJwtToken(jwtData: ILoginData): Promise<string> {
  const token = jwt.sign(
    {
      name: jwtData.name,
      house: jwtData.house,
      room: jwtData.room,
      role: jwtData.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '2w',
    }
  );
  return token;
}

export async function setInitialPw(newPassword: string, forRole: Role) {
  if (newPassword.length === 0) throw new Error('No password provided');
  const hash = await bcrypt.hash(newPassword, 10);
  // check if role is a Role
  if (forRole != Role.User && forRole != Role.Admin && forRole != Role.Master) throw new Error('Invalid role');
  // check if role already exists in db
  const role = await Auth.findOne({ role: forRole });
  if (role) throw new Error('Role already exists in DB');
  else {
    // create new entry
    return Auth.create({ role: forRole, password: hash });
  }
}

export async function changePw(oldPassword: string, newPassword: string, forRole: Role) {
  if (oldPassword.length === 0 || newPassword.length === 0) throw new Error('No password provided');
  try {
    const hashedPassword = await getPasswordOfRole(forRole);
    const result = await bcrypt.compare(oldPassword, hashedPassword);

    if (!result) {
      throw new Error('Invalid oldPassword');
    } else {
      // set new password
      const newHashPassword = await bcrypt.hash(newPassword, 10);
      await Auth.findOneAndUpdate({ role: forRole }, { role: forRole, password: newHashPassword });
    }
  } catch (err) {
    // if role or password not found in db, create new entry
    if (err.message !== 'Role or password not found in DB') throw new Error(err);
    const hash = await bcrypt.hash(newPassword, 10);
    Auth.create({ role: forRole, password: hash });
  }
}

export async function getPasswordOfRole(role: Role): Promise<string> {
  if (role != Role.User && role != Role.Admin && role != Role.Master) throw new Error('Invalid role');
  try {
    return (await Auth.findOne({ role: role })).toObject().password;
  } catch (err) {
    throw new Error('Role or password not found in DB');
  }
}

export async function authUser(req: ExpressJwtRequest, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
    const loginData = decoded as ILoginData;

    if (loginData.role === Role.User || loginData.role === Role.Admin || loginData.role === Role.Master) {
      next();
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  } catch (e) {
    res.status(401).json({ error: 'Invalid Token' });
  }
}

export async function authAdmin(req: ExpressJwtRequest, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
    const loginData = decoded as ILoginData;

    if (loginData.role === Role.Admin || loginData.role === Role.Master) {
      next();
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  } catch (e) {
    res.status(401).json({ error: e });
  }
}

export async function authMaster(req: ExpressJwtRequest, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
    const loginData = decoded as ILoginData;

    if (loginData.role === Role.Master) {
      next();
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  } catch (e) {
    res.status(401).json({ error: e });
  }
}
